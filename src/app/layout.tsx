import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from './contexts/LanguageContext';

export const metadata: Metadata = {
  title: 'WiFi Check-in',
  description: 'Track check-ins via WiFi presence',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
};

export default RootLayout;
