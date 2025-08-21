import { Metadata } from 'next';
import { redirect } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { useEffect } from 'react'

export const metadata: Metadata = {
  title: 'Pisafa Gifts - Authentication',
  description: 'Sign in or create an account to access Pisafa Gifts Shop',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Client-only redirect guard: if already authenticated, send away
  if (typeof window !== 'undefined') {
    // Render a client component with redirect logic
  }
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}