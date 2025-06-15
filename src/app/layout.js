'use client';

import './global.css';
import { SessionProvider } from 'next-auth/react';
import VisitTracker from '@/components/VisitTracker';

export default function RootLayout({ children }) {
  return (
      <html lang="en">
        <head>
          <link rel="icon" href="/assets/sleeve.png" type="image/png" />
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




