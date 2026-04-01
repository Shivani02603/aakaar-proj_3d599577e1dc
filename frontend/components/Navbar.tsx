'use client';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-white font-semibold">
          Agentic Graph RAG
        </Link>
        <div className="flex space-x-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-300 hover:text-white">
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="text-gray-300 hover:text-white underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-300 hover:text-white">
                Login
              </Link>
              <Link href="/register" className="text-gray-300 hover:text-white">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}