"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function CommunityHub() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  if (!isLoaded || !isSignedIn) {
    return null;
  }


  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Community Hub</h1>
      <p className="text-lg text-black">
        This space will soon be filled with community features and interactions. Stay tuned!
      </p>
    </div>
  );
}
