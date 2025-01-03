"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";

interface Collection {
  name: string;
  questionCount: number;
  userId: string;
  collectionName: string;
  description: string;
}

export default function CommunityHub() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHubCollections = async () => {
      if (!user) return;
      
      try {
        console.log("Starting hub collections fetch...");
        const hubRef = collection(db, "hub");
        const hubSnapshot = await getDocs(hubRef);
        
        console.log("Hub snapshot size:", hubSnapshot.size, "documents");
        
        const allCollections: Collection[] = [];

        // Get all collections from the hub
        for (const hubDoc of hubSnapshot.docs) {
          const hubData = hubDoc.data();
          console.log(`Processing hub document: ${hubDoc.id}`);
          
          allCollections.push({
            name: hubDoc.id,
            questionCount: hubData.flashcardCount,
            userId: hubData.userId,
            collectionName: hubData.collectionName,
            description: hubData.description || 'No description provided'
          });
        }

        console.log("Final collections:", allCollections);

        setCollections(allCollections);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching hub collections:", error);
        if (error instanceof Error) {
          console.error("Full error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        }
        setLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchHubCollections();
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Community Hub</h1>
      
      {loading ? (
        <div className="flex justify-center mt-8">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : collections.length === 0 ? (
        <p className="text-lg text-gray-600">
          No collections have been shared to the hub yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {collections.map((collection) => (
            <div 
              key={collection.name}
              className="p-4 border border-sky-600 rounded-lg hover:shadow-lg transition-shadow"
            >
              <Link href={`/flashcards/${collection.collectionName}`}>
                <h3 className="text-xl font-semibold mb-2">{collection.collectionName}</h3>
                <p className="text-gray-600 mb-2">{collection.description}</p>
                <p className="text-gray-600">
                  {collection.questionCount} questions
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
