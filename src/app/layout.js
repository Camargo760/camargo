'use client';

import './global.css';
import { SessionProvider } from 'next-auth/react';
import VisitTracker from '@/components/VisitTracker';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Standard favicon */}
        <link rel="icon" href="/assets/logo.png" type="image/png" />

        {/* Optional but recommended for better support */}
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/logo.png" />
      </head>
      <body>
        <SessionProvider>
          {children}
          <VisitTracker />
        </SessionProvider>
      </body>
    </html>
  );
}
