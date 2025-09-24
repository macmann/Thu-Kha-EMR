import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  maxWidth?: string;
}

export default function PageLayout({ children, maxWidth = 'max-w-2xl' }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className={`w-full ${maxWidth} rounded-2xl bg-white p-6 shadow sm:p-8`}>{children}</div>
    </div>
  );
}
