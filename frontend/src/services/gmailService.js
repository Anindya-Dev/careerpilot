/**
 * Gmail API & Google Identity Services (GIS) Client
 * Enables direct Gmail Draft creation, sending, and automatic status checking
 * (DRAFTED -> SENT -> REPLIED) when VITE_GOOGLE_CLIENT_ID is configured.
 * Falls back cleanly to pre-filled Gmail Compose URLs if OAuth is not configured.
 */

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.readonly'
].join(' ');

const TOKEN_STORAGE_KEY = 'cp_gmail_oauth_token';

let gisScriptPromise = null;

function loadGoogleIdentityScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Browser environment required'));
  }
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve(window.google);
  }
  if (!gisScriptPromise) {
    gisScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.google));
        existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }
  return gisScriptPromise;
}

function encodeBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildRawMimeMessage({ to = '', subject = '', body = '' }) {
  const lines = [
    ...(to ? [`To: ${to}`] : []),
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body
  ];
  return encodeBase64Url(lines.join('\r\n'));
}

export function isGmailOAuthConfigured() {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
}

export function getStoredGmailToken() {
  try {
    const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.access_token || Date.now() >= (parsed.expires_at || 0)) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function disconnectGmail() {
  try {
    const stored = getStoredGmailToken();
    if (stored?.access_token && window.google?.accounts?.oauth2?.revoke) {
      window.google.accounts.oauth2.revoke(stored.access_token);
    }
  } catch {
    // Ignore revoke errors on disconnect
  }
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function connectGmail() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      'VITE_GOOGLE_CLIENT_ID is not set in frontend/.env. Add a Google OAuth Web Client ID to enable direct Gmail API access.'
    );
  }

  const google = await loadGoogleIdentityScript();
  if (!google?.accounts?.oauth2) {
    throw new Error('Google OAuth client failed to initialize.');
  }

  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GMAIL_SCOPES,
      callback: async (response) => {
        if (response.error) {
          reject(new Error(response.error_description || response.error));
          return;
        }
        const expiresAt = Date.now() + Number(response.expires_in || 3500) * 1000 - 30000;
        let email = '';
        try {
          const profileRes = await fetch(`${GMAIL_API_BASE}/profile`, {
            headers: { Authorization: `Bearer ${response.access_token}` }
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            email = profileData.emailAddress || '';
          }
        } catch {
          // Optional profile fetch
        }
        const tokenPayload = {
          access_token: response.access_token,
          expires_at: expiresAt,
          email
        };
        sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenPayload));
        resolve(tokenPayload);
      }
    });
    client.requestAccessToken({ prompt: 'consent' });
  });
}

async function gmailFetch(path, options = {}) {
  const token = getStoredGmailToken();
  if (!token?.access_token) {
    throw new Error('Gmail session expired or not connected. Please click Connect Gmail.');
  }
  const res = await fetch(`${GMAIL_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (res.status === 401) {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    throw new Error('Gmail token expired. Reconnect Gmail to continue.');
  }
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gmail API error (${res.status}): ${errText}`);
  }
  return res.json();
}

export async function createGmailDraft({ to, subject, body }) {
  const raw = buildRawMimeMessage({ to, subject, body });
  const data = await gmailFetch('/drafts', {
    method: 'POST',
    body: JSON.stringify({ message: { raw } })
  });
  return {
    draftId: data.id,
    messageId: data.message?.id || null,
    threadId: data.message?.threadId || null
  };
}

export async function sendGmailDraft(draftId) {
  const data = await gmailFetch('/drafts/send', {
    method: 'POST',
    body: JSON.stringify({ id: draftId })
  });
  return {
    messageId: data.id,
    threadId: data.threadId
  };
}

/**
 * Checks whether a drafted or sent email is still a draft, has been sent,
 * or has received a reply in its Gmail thread.
 */
export async function checkMailStatus(record) {
  const token = getStoredGmailToken();
  if (!token?.access_token) {
    throw new Error('Connect Gmail first to sync live mail status.');
  }

  let status = record.status || 'DRAFTED';
  let threadId = record.threadId || null;

  // 1. Check if draft still exists
  if (record.draftId) {
    const draftRes = await fetch(`${GMAIL_API_BASE}/drafts/${record.draftId}`, {
      headers: { Authorization: `Bearer ${token.access_token}` }
    });
    if (draftRes.status === 404) {
      // Draft was either sent or deleted; verify via threadId if we have it
      if (status === 'DRAFTED') {
        status = 'SENT';
      }
    } else if (draftRes.ok) {
      const draftData = await draftRes.json();
      threadId = draftData.message?.threadId || threadId;
    }
  }

  // 2. Inspect thread to detect SENT vs REPLIED
  if (threadId) {
    const threadRes = await fetch(`${GMAIL_API_BASE}/threads/${threadId}?format=metadata`, {
      headers: { Authorization: `Bearer ${token.access_token}` }
    });
    if (threadRes.ok) {
      const threadData = await threadRes.json();
      const messages = threadData.messages || [];
      const nonDraftMessages = messages.filter(
        (m) => !(m.labelIds || []).includes('DRAFT')
      );
      if (nonDraftMessages.length > 0 && status === 'DRAFTED') {
        status = 'SENT';
      }
      // If any non-SENT incoming message exists (or >1 non-draft message), mark REPLIED
      const hasInboundReply = nonDraftMessages.some(
        (m) => !(m.labelIds || []).includes('SENT')
      );
      if (hasInboundReply || nonDraftMessages.length > 1) {
        status = 'REPLIED';
      }
    }
  }

  return { status, threadId };
}

export function getGmailComposeUrl({ to = '', subject = '', body = '' }) {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: to || '',
    su: subject || '',
    body: body || ''
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

