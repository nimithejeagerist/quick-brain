"use client";

import { SignUp, useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import SyncLoader from "react-spinners/SyncLoader";

export default function SignUpPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirectUrl");

  useEffect(() => {
    if (isLoaded && userId) {
      router.push(redirectUrl || "/");
    }
  }, [isLoaded, userId, redirectUrl, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 sm:px-6 lg:px-8">
        <SyncLoader color="#0284c7" size={15} />
        <p className="text-lg font-medium animate-pulse text-center">Getting everything ready...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[90%] sm:max-w-md mx-auto">
        <SignUp 
          routing="path" 
          path="/sign-up"
          fallbackRedirectUrl={redirectUrl || "/"}
        />
      </div>
    </div>
  )
}