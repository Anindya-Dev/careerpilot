/**
 * @file ClerkProviderWrapper.jsx
 * @description Safe conditional wrapper around @clerk/clerk-react ClerkProvider.
 * Allows the application to run with headless Clerk OAuth when VITE_CLERK_PUBLISHABLE_KEY
 * is provided, while gracefully degrading to standard/mock auth if the key is not set.
 * @author Anindya Bhattacharya (Member 2) & Sargam Banerjee (Member 4)
 */

import React, { createContext, useContext } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

export const ClerkConfigContext = createContext({
  isClerkConfigured: false,
  publishableKey: null
});

export const useClerkConfig = () => useContext(ClerkConfigContext);

export default function ClerkProviderWrapper({ children }) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  const isConfigured = Boolean(
    publishableKey &&
    publishableKey.trim() !== '' &&
    publishableKey.startsWith('pk_') &&
    !publishableKey.includes('placeholder')
  );

  if (isConfigured) {
    return (
      <ClerkConfigContext.Provider value={{ isClerkConfigured: true, publishableKey }}>
        <ClerkProvider publishableKey={publishableKey}>
          {children}
        </ClerkProvider>
      </ClerkConfigContext.Provider>
    );
  }

  // Graceful fallback when Clerk key is not yet configured in .env
  return (
    <ClerkConfigContext.Provider value={{ isClerkConfigured: false, publishableKey: null }}>
      {children}
    </ClerkConfigContext.Provider>
  );
}

