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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <SyncLoader color="#0284c7" size={15} />
        <p className="text-lg font-medium animate-pulse">Getting everything ready...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="w-full max-w-md px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Create Your Account</h1>
        <SignUp 
          routing="path" 
          path="/sign-up"
          fallbackRedirectUrl={redirectUrl || "/"}
        />
      </div>
    </div>
  )
}