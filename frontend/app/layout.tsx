import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/providers/AuthProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}