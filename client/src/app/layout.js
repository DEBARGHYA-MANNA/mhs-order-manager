import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import MainLayout from '@/components/Layout/MainLayout';
import './globals.css';

export const metadata = {
  title: 'MHS Order Manager',
  description: 'WhatsApp-integrated order management system for medical shops',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f8fafc',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f8fafc',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}