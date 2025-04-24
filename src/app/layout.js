'use client';

import './global.css';
import { SessionProvider } from 'next-auth/react';
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/assets/sleeve.png" type="image/png" />
        </head>
        <body>
          <SessionProvider>
            {children}
          </SessionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
