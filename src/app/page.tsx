'use client';

import type React from 'react';
import DashboardPage from '@/components/dashboard-page';
// Removed useState, useEffect, useAuth, LoginPage, LoadingSpinner imports

export default function Home() {
  // Removed auth state checking logic

  // Directly render the DashboardPage as authentication is removed
  return <DashboardPage />;
}
