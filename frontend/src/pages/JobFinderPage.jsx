/**
 * @file JobFinderPage.jsx
 * @description Auto JobFinder workspace: scrapes live public job boards (Remotive, Arbeitnow, RemoteOK),
 * filters into Jobs & Internships, extracts public contact emails, ranks roles against the user's
 * profile, generates AI cold emails, and integrates with Gmail Drafts + automatic status tracking.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import integrationService from '../services/integrationService';
import {
  isGmailOAuthConfigured,
  getStoredGmailToken,
  connectGmail,
  disconnectGmail,
  createGmailDraft,
  sendGmailDraft,
  checkMailStatus,
  getGmailComposeUrl
} from '../services/gmailService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import {
  Briefcase,
  Search,
  RefreshCw,
  Mail,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Send,
  Copy,
  Check,
  X,
  AlertCircle,
  Loader2,
  MapPin,
  Globe,
  FileEdit,
  Inbox
} from 'lucide-react';

const STATUS_STYLES = {
  DRAFTED: 'bg-[#FFE600] text-black border-black',
  SENT: 'bg-[#38B6FF] text-black border-black',
  REPLIED: 'bg-[#70E000] text-black border-black'
};

export default function JobFinderPage() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const outreachStorageKey = `cp_outreach_${user?.userId || 'guest'}`;

  const [category, setCategory] = useState('all'); // all | jobs | internships
  const [searchQuery, setSearchQuery] = useState('');
  const [jobsData, setJobsData] = useState({
    total_fetched: 0,
    returned_count: 0,
    emails_found_count: 0,
    sources: [],
    jobs: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Gmail OAuth & Outreach tracking state
  const oauthConfigured = isGmailOAuthConfigured();
  const [gmailSession, setGmailSession] = useState(() => getStoredGmailToken());
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);
  const [isSyncingStatus, setIsSyncingStatus] = useState(false);
  const [gmailNotice, setGmailNotice] = useState('');

  const [outreachMap, setOutreachMap] = useState(() => {
    try {
      const saved = localStorage.getItem(outreachStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal state for AI Cold Email & Gmail Draft
  const [activeJob, setActiveJob] = useState(null);
  const [draftForm, setDraftForm] = useState({ to: '', subject: '', body: '', source: '' });
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [modalError, setModalError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const persistOutreach = useCallback(
    (updater) => {
      setOutreachMap((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        try {
          localStorage.setItem(outreachStorageKey, JSON.stringify(next));
        } catch {
          // Ignore storage quota errors
        }
        return next;
      });
    },
    [outreachStorageKey]
  );

  const userSkills = useMemo(() => {
    const raw = profile?.skills || [];
    return raw.map((s) => (typeof s === 'string' ? s : s.name)).filter(Boolean);
  }, [profile]);

  const fetchLiveJobs = useCallback(
    async (cat = category, q = searchQuery) => {
      setIsLoading(true);
      setFetchError('');
      try {
        const data = await integrationService.discoverJobs({
          targetRole: profile?.target_role || 'Software Engineer',
          skills: userSkills,
          category: cat,
          search: q,
          limit: 30
        });
        setJobsData(data);
      } catch (err) {
        setFetchError(
          err?.response?.data?.detail || err?.message || 'Failed to scrape live job boards.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [category, searchQuery, profile?.target_role, userSkills]
  );

  useEffect(() => {
    fetchLiveJobs(category, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLiveJobs(category, searchQuery);
  };

  const handleCopyEmail = (id, email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleConnectGmail = async () => {
    setIsConnectingGmail(true);
    setGmailNotice('');
    try {
      const token = await connectGmail();
      setGmailSession(token);
      setGmailNotice(`Connected Gmail${token.email ? `: ${token.email}` : ''}`);
    } catch (err) {
      setGmailNotice(err.message || 'Gmail connection failed.');
    } finally {
      setIsConnectingGmail(false);
    }
  };

  const handleDisconnectGmail = () => {
    disconnectGmail();
    setGmailSession(null);
    setGmailNotice('Disconnected Gmail session.');
  };

  const handleSyncAllStatuses = async () => {
    if (!gmailSession) {
      setGmailNotice('Connect Gmail first to sync live Draft/Sent/Reply statuses.');
      return;
    }
    const entries = Object.entries(outreachMap).filter(
      ([, rec]) => rec?.draftId || rec?.threadId
    );
    if (entries.length === 0) {
      setGmailNotice('No Gmail-linked drafts or sent emails to sync yet.');
      return;
    }
    setIsSyncingStatus(true);
    setGmailNotice('');
    try {
      const updates = {};
      for (const [jobId, rec] of entries) {
        try {
          const res = await checkMailStatus(rec);
          updates[jobId] = {
            ...rec,
            status: res.status,
            threadId: res.threadId || rec.threadId,
            lastSyncedAt: new Date().toISOString()
          };
        } catch {
          // Keep existing record if single thread check fails
        }
      }
      persistOutreach((prev) => ({ ...prev, ...updates }));
      setGmailNotice(`Synced ${Object.keys(updates).length} Gmail thread(s).`);
    } finally {
      setIsSyncingStatus(false);
    }
  };

  const openDraftModal = async (job) => {
    setActiveJob(job);
    setModalError('');
    setIsGeneratingEmail(true);
    setDraftForm({
      to: job.contact_email || '',
      subject: `${job.title} Application - ${profile?.name || 'Candidate'}`,
      body: '',
      source: ''
    });

    try {
      const res = await integrationService.generateOutreachEmail({
        jobTitle: job.title,
        company: job.company,
        contactEmail: job.contact_email || '',
        jobDescription: job.description_snippet || '',
        studentName: profile?.name || user?.name || 'Candidate',
        targetRole: profile?.target_role || 'Software Engineer',
        skills: userSkills,
        projects: (profile?.projects || []).map((p) => p.title || p.name).filter(Boolean)
      });
      setDraftForm({
        to: res.to || job.contact_email || '',
        subject: res.subject || '',
        body: res.body || '',
        source: res.source || 'template'
      });
    } catch (err) {
      setModalError(err?.response?.data?.detail || 'Could not generate AI email draft.');
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleSaveToGmailDrafts = async () => {
    if (!activeJob) return;
    setIsSavingDraft(true);
    setModalError('');
    try {
      const created = await createGmailDraft({
        to: draftForm.to,
        subject: draftForm.subject,
        body: draftForm.body
      });
      persistOutreach((prev) => ({
        ...prev,
        [activeJob.id]: {
          jobId: activeJob.id,
          company: activeJob.company,
          title: activeJob.title,
          to: draftForm.to,
          subject: draftForm.subject,
          status: 'DRAFTED',
          draftId: created.draftId,
          messageId: created.messageId,
          threadId: created.threadId,
          updatedAt: new Date().toISOString()
        }
      }));
      setGmailNotice(`Saved Gmail draft for ${activeJob.company}.`);
    } catch (err) {
      setModalError(err.message || 'Failed to save draft to Gmail.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSendViaGmail = async () => {
    if (!activeJob) return;
    if (!draftForm.to) {
      setModalError('Recipient email ("To") is required before sending.');
      return;
    }
    setIsSendingMail(true);
    setModalError('');
    try {
      const existing = outreachMap[activeJob.id];
      let draftId = existing?.draftId;
      if (!draftId) {
        const created = await createGmailDraft({
          to: draftForm.to,
          subject: draftForm.subject,
          body: draftForm.body
        });
        draftId = created.draftId;
      }
      const sent = await sendGmailDraft(draftId);
      persistOutreach((prev) => ({
        ...prev,
        [activeJob.id]: {
          jobId: activeJob.id,
          company: activeJob.company,
          title: activeJob.title,
          to: draftForm.to,
          subject: draftForm.subject,
          status: 'SENT',
          draftId: null,
          messageId: sent.messageId,
          threadId: sent.threadId,
          updatedAt: new Date().toISOString()
        }
      }));
      setActiveJob(null);
      setGmailNotice(`Email sent to ${draftForm.to} (${activeJob.company}).`);
    } catch (err) {
      setModalError(err.message || 'Failed to send via Gmail.');
    } finally {
      setIsSendingMail(false);
    }
  };

  const handleMarkStatusManual = (job, status) => {
    persistOutreach((prev) => ({
      ...prev,
      [job.id]: {
        ...(prev[job.id] || {}),
        jobId: job.id,
        company: job.company,
        title: job.title,
        to: draftForm.to || job.contact_email || '',
        status,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  const trackedCount = Object.keys(outreachMap).length;

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-black flex flex-col font-sans relative selection:bg-[#FFE600] selection:text-black">
      <div className="absolute inset-0 neo-grid pointer-events-none opacity-20 -z-0" />
      <Navbar />

      <div className="flex-1 flex w-full relative z-10">
        <Sidebar />

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10 space-y-6"
        >
          {/* Header Banner */}
          <div className="border-2 border-black bg-[#FFE600] shadow-[4px_4px_0px_0px_#000] px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-black font-mono text-xs font-black uppercase">
                <Briefcase className="w-4 h-4 stroke-[2.5]" />
                <span>WORKSPACE :: AUTO_JOBFINDER_&_OUTREACH</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-black font-sans mt-0.5 tracking-tight">
                Auto JobFinder & Gmail Outreach
              </h1>
              <p className="text-xs font-mono text-black/80 mt-1">
                Live roles scraped for <strong>{profile?.target_role || 'Software Engineer'}</strong> • Ranked by your {userSkills.length} profile skills
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {oauthConfigured ? (
                gmailSession ? (
                  <>
                    <span className="px-3 py-1.5 bg-[#70E000] border-2 border-black font-mono text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {gmailSession.email || 'Gmail Connected'}
                    </span>
                    <button
                      onClick={handleSyncAllStatuses}
                      disabled={isSyncingStatus}
                      className="px-3 py-1.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] font-mono text-xs font-bold hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-1.5"
                    >
                      {isSyncingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      Sync Mail Status
                    </button>
                    <button
                      onClick={handleDisconnectGmail}
                      className="px-3 py-1.5 bg-[#FF70A6] border-2 border-black font-mono text-xs font-bold"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleConnectGmail}
                    disabled={isConnectingGmail}
                    className="px-4 py-2 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] font-mono text-xs font-black uppercase flex items-center gap-2 hover:bg-[#38B6FF] transition-colors"
                  >
                    {isConnectingGmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    Connect Gmail
                  </button>
                )
              ) : (
                <div className="px-3 py-2 bg-white border-2 border-black font-mono text-[11px] max-w-md">
                  <span className="font-black">GMAIL_API_MODE:</span> Set{' '}
                  <code className="bg-black/10 px-1">VITE_GOOGLE_CLIENT_ID</code> in{' '}
                  <code className="bg-black/10 px-1">frontend/.env</code> for 1-click Drafts & auto reply sync. Pre-filled Gmail Compose + manual tracking active now.
                </div>
              )}
            </div>
          </div>

          {gmailNotice && (
            <div className="border-2 border-black bg-[#38B6FF] px-4 py-2 font-mono text-xs font-bold flex items-center justify-between">
              <span>{gmailNotice}</span>
              <button onClick={() => setGmailNotice('')} className="ml-4 font-black">
                ✕
              </button>
            </div>
          )}

          {/* Controls: Tabs + Search + Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-5 flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Opportunities' },
                { key: 'jobs', label: 'Full-Time Jobs' },
                { key: 'internships', label: 'Internships' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setCategory(tab.key)}
                  className={`px-4 py-2 border-2 border-black font-mono text-xs font-black uppercase transition-all ${
                    category === tab.key
                      ? 'bg-black text-[#FFE600] shadow-[3px_3px_0px_0px_#38B6FF]'
                      : 'bg-white text-black hover:bg-[#FAF9F6] shadow-[2px_2px_0px_0px_#000]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="lg:col-span-7 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by keyword, skill, company, or role (e.g. AI, Python, Backend)..."
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black font-mono text-xs focus:outline-none focus:bg-[#FFFDF5]"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-[#70E000] border-2 border-black shadow-[3px_3px_0px_0px_#000] font-mono text-xs font-black uppercase flex items-center gap-1.5"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Scrape Live
              </button>
            </form>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_#000]">
              <div className="font-mono text-[10px] font-bold uppercase text-black/60">Live Listings Scraped</div>
              <div className="text-2xl font-black mt-0.5">{jobsData.total_fetched}</div>
            </div>
            <div className="border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_#000]">
              <div className="font-mono text-[10px] font-bold uppercase text-black/60">Matched Results</div>
              <div className="text-2xl font-black mt-0.5">{jobsData.returned_count}</div>
            </div>
            <div className="border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_#000]">
              <div className="font-mono text-[10px] font-bold uppercase text-black/60">Public Emails Found</div>
              <div className="text-2xl font-black mt-0.5 text-[#0077B6]">{jobsData.emails_found_count}</div>
            </div>
            <div className="border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_#000]">
              <div className="font-mono text-[10px] font-bold uppercase text-black/60">Outreach Tracked</div>
              <div className="text-2xl font-black mt-0.5">{trackedCount}</div>
            </div>
          </div>

          {fetchError && (
            <div className="border-2 border-black bg-[#FF70A6] p-4 font-mono text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fetchError}</span>
            </div>
          )}

          {/* Job List */}
          {isLoading ? (
            <div className="border-2 border-black bg-white p-12 text-center shadow-[4px_4px_0px_0px_#000]">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
              <p className="font-mono text-sm font-black uppercase">
                Scraping Remotive, Arbeitnow & RemoteOK live feeds...
              </p>
            </div>
          ) : jobsData.jobs.length === 0 ? (
            <Card title="No Matching Roles Found" subtitle="Try broadening your search keyword or switching category tab">
              <p className="font-mono text-xs text-black/70">
                No active listings matched the current filter. Click <strong>All Opportunities</strong> or clear your search query.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {jobsData.jobs.map((job) => {
                const outreach = outreachMap[job.id];
                return (
                  <div
                    key={job.id}
                    className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="px-2 py-0.5 bg-black text-white font-mono text-[10px] font-black uppercase">
                              {job.source}
                            </span>
                            <span
                              className={`px-2 py-0.5 border border-black font-mono text-[10px] font-black uppercase ${
                                job.job_type === 'internship' ? 'bg-[#FF70A6]' : 'bg-[#E2ECE9]'
                              }`}
                            >
                              {job.job_type}
                            </span>
                            {job.remote && (
                              <span className="px-2 py-0.5 bg-[#38B6FF] border border-black font-mono text-[10px] font-black uppercase flex items-center gap-1">
                                <Globe className="w-3 h-3" /> Remote
                              </span>
                            )}
                            {outreach?.status && (
                              <span
                                className={`px-2 py-0.5 border font-mono text-[10px] font-black uppercase ${
                                  STATUS_STYLES[outreach.status] || 'bg-gray-200 border-black'
                                }`}
                              >
                                MAIL: {outreach.status}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-black leading-snug">{job.title}</h3>
                          <p className="font-mono text-xs font-bold text-black/80 mt-0.5">
                            {job.company} • <MapPin className="w-3 h-3 inline mb-0.5" /> {job.location}
                          </p>
                        </div>

                        <div className="shrink-0 border-2 border-black bg-[#70E000] px-2.5 py-1.5 text-center shadow-[2px_2px_0px_0px_#000]">
                          <div className="text-lg font-black leading-none">{job.match_score}%</div>
                          <div className="font-mono text-[9px] font-black uppercase">MATCH</div>
                        </div>
                      </div>

                      {/* Snippet */}
                      <p className="text-xs font-mono text-black/75 line-clamp-3">
                        {job.description_snippet || 'No description snippet available.'}
                      </p>

                      {/* Matched / Missing Skills */}
                      <div className="flex flex-wrap gap-1.5">
                        {(job.matched_skills || []).slice(0, 5).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 bg-[#D8F3DC] border border-black font-mono text-[10px] font-bold"
                          >
                            ✓ {s}
                          </span>
                        ))}
                        {(job.missing_skills || []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 bg-[#FFF3B0] border border-black font-mono text-[10px]"
                          >
                            + {s}
                          </span>
                        ))}
                      </div>

                      {/* Contact Email Row */}
                      <div className="border-t border-dashed border-black/30 pt-2 flex items-center justify-between gap-2">
                        {job.contact_email ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail className="w-3.5 h-3.5 text-[#0077B6] shrink-0" />
                            <span className="font-mono text-xs font-bold truncate">
                              {job.contact_email}
                            </span>
                            <button
                              onClick={() => handleCopyEmail(job.id, job.contact_email)}
                              className="p-1 border border-black bg-[#FAF9F6] hover:bg-[#FFE600]"
                              title="Copy email"
                            >
                              {copiedId === job.id ? (
                                <Check className="w-3 h-3 text-green-700" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="font-mono text-[11px] text-black/50 flex items-center gap-1.5">
                            <Inbox className="w-3.5 h-3.5" /> No public recruiter email in listing (add manually in draft)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t-2 border-black">
                      <button
                        onClick={() => openDraftModal(job)}
                        className="flex-1 px-3 py-2 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] font-mono text-xs font-black uppercase flex items-center justify-center gap-1.5 hover:bg-[#FFD000]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Draft Cold Email
                      </button>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] font-mono text-xs font-black uppercase flex items-center gap-1.5 hover:bg-[#38B6FF]"
                      >
                        Apply <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {outreach?.status === 'DRAFTED' && (
                        <button
                          onClick={() => handleMarkStatusManual(job, 'SENT')}
                          className="px-2.5 py-2 bg-[#38B6FF] border-2 border-black font-mono text-[10px] font-black uppercase"
                        >
                          Mark Sent
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.main>
      </div>

      {/* AI Cold Email & Gmail Draft Modal */}
      <AnimatePresence>
        {activeJob && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-2xl bg-[#FAF9F6] border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4 border-b-2 border-black pb-3">
                <div>
                  <div className="font-mono text-[10px] font-black uppercase text-[#0077B6]">
                    AI COLD EMAIL & GMAIL OUTREACH
                  </div>
                  <h2 className="text-xl font-black">
                    {activeJob.title} @ {activeJob.company}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveJob(null)}
                  className="p-1.5 border-2 border-black bg-white hover:bg-[#FF70A6]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {modalError && (
                <div className="border-2 border-black bg-[#FF70A6] p-3 font-mono text-xs font-bold">
                  {modalError}
                </div>
              )}

              {isGeneratingEmail ? (
                <div className="py-12 text-center font-mono text-xs font-bold">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Generating personalized email from your skills & projects...
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block font-mono text-[11px] font-black uppercase mb-1">
                      Recipient Email (To)
                    </label>
                    <input
                      type="email"
                      value={draftForm.to}
                      onChange={(e) => setDraftForm((f) => ({ ...f, to: e.target.value }))}
                      placeholder="recruiter@company.com"
                      className="w-full px-3 py-2 bg-white border-2 border-black font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-black uppercase mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={draftForm.subject}
                      onChange={(e) => setDraftForm((f) => ({ ...f, subject: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border-2 border-black font-mono text-xs"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-mono text-[11px] font-black uppercase">
                        Email Body
                      </label>
                      {draftForm.source && (
                        <span className="font-mono text-[10px] px-2 py-0.5 bg-[#E2ECE9] border border-black">
                          Source: {draftForm.source}
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={8}
                      value={draftForm.body}
                      onChange={(e) => setDraftForm((f) => ({ ...f, body: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border-2 border-black font-mono text-xs leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t-2 border-black">
                    {gmailSession && (
                      <>
                        <button
                          onClick={handleSaveToGmailDrafts}
                          disabled={isSavingDraft}
                          className="px-4 py-2 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] font-mono text-xs font-black uppercase flex items-center gap-1.5"
                        >
                          {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileEdit className="w-3.5 h-3.5" />}
                          Save to Gmail Drafts
                        </button>
                        <button
                          onClick={handleSendViaGmail}
                          disabled={isSendingMail}
                          className="px-4 py-2 bg-[#70E000] border-2 border-black shadow-[2px_2px_0px_0px_#000] font-mono text-xs font-black uppercase flex items-center gap-1.5"
                        >
                          {isSendingMail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Send via Gmail
                        </button>
                      </>
                    )}

                    <a
                      href={getGmailComposeUrl(draftForm)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleMarkStatusManual(activeJob, 'DRAFTED')}
                      className="px-4 py-2 bg-[#38B6FF] border-2 border-black shadow-[2px_2px_0px_0px_#000] font-mono text-xs font-black uppercase flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Open in Gmail Compose
                    </a>

                    <button
                      onClick={() => handleMarkStatusManual(activeJob, 'SENT')}
                      className="px-3 py-2 bg-white border-2 border-black font-mono text-xs font-bold uppercase"
                    >
                      Mark as Sent
                    </button>

                    <button
                      onClick={() => openDraftModal(activeJob)}
                      className="ml-auto px-3 py-2 bg-white border-2 border-black font-mono text-xs font-bold uppercase"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

