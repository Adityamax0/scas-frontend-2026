import '@/styles/globals.css';
import SyncStatus from '@/components/SyncStatus';
import { LanguageProvider } from '@/lib/LanguageContext';
import LangToggle from '@/components/LangToggle';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata = {
  title: 'SCAS — Smart Crop Advisory System',
  description: 'Empowering Indian farmers with smart agricultural problem resolution',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
        <link rel="apple-touch-icon" href="/scas_pwa_icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          <ErrorBoundary>
            <SyncStatus />
            <LangToggle />
            <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            {children}
          </ErrorBoundary>
        </LanguageProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Route Guard: Protect /dashboard/* from unauthenticated access
              (function() {
                var path = window.location.pathname;
                if (path.startsWith('/dashboard') && !localStorage.getItem('token')) {
                  window.location.replace('/login');
                }
              })();

              // Service Worker Registration
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SCAS SW registered:', reg.scope);
                  }, function(err) {
                    console.log('SCAS SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
