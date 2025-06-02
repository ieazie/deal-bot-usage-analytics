'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after a short delay
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Deal Bot Analytics
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Analytics platform for Deal Bot usage monitoring
        </p>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Welcome
          </h2>
          <p className="text-gray-600 mb-6">
            Monitor Deal Bot usage patterns, analyze conversation data, and gain insights into user interactions.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/conversations')}
              className="w-full"
            >
              Browse Conversations
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
} 