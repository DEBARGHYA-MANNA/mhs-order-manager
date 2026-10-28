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
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#18172a',
                color: '#f7f7fb',
                borderRadius: '16px',
                fontSize: '13.5px',
                fontWeight: 500,
                padding: '10px 16px',
              },
              success: { iconTheme: { primary: '#1aa876', secondary: '#fff' } },
              error: { iconTheme: { primary: '#e24d6b', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}