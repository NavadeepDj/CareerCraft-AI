'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import LoginPage from '@/components/login-page';
import DashboardPage from '@/components/dashboard-page';
import LoadingSpinner from '@/components/loading-spinner';

export default function Home() {
  const { user, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);

  if (!authChecked) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <DashboardPage />;
}
