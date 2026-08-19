import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function PremiumGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="w-8 h-8 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check if user is logged in and has an active premium subscription
  const isPremium = profile?.isPremium === true;
  const hasValidSubscription = profile?.premiumUntil ? new Date(profile.premiumUntil) > new Date() : false;

  if (!user || (!isPremium && !hasValidSubscription)) {
    return <Navigate to="/premium" replace />;
  }

  return <>{children}</>;
}
