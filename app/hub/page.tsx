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
  const [activeTab, setActiveTab] = useState<'public' | 'owned'>('public');

  useEffect(() => {
    const fetchHubCollections = async () => {
      if (!user) return;
      
      try {
        const hubRef = collection(db, "hub");
        const hubSnapshot = await getDocs(hubRef);
        
        const allCollections: Collection[] = [];

        for (const hubDoc of hubSnapshot.docs) {
          const hubData = hubDoc.data();
          allCollections.push({
            name: hubDoc.id,
            questionCount: hubData.flashcardCount,
            userId: hubData.userId,
            collectionName: hubData.collectionName,
            description: hubData.description || 'No description provided'
          });
        }

        setCollections(allCollections);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching hub collections:", error);
        setLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchHubCollections();
    }
  }, [isLoaded, isSignedIn, user]);

  // Filter collections based on active tab
  const displayedCollections = activeTab === 'public' 
    ? collections 
    : collections.filter(collection => collection.userId === user?.id);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Community Hub</h1>
      
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('public')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'public'
              ? 'bg-sky-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Public Collections
        </button>
        <button
          onClick={() => setActiveTab('owned')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'owned'
              ? 'bg-sky-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          My Collections
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center mt-8">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : displayedCollections.length === 0 ? (
        <p className="text-lg text-gray-600">
          {activeTab === 'public' 
            ? 'No collections have been shared to the hub yet.'
            : 'You haven\'t shared any collections to the hub yet.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {displayedCollections.map((collection) => (
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
              {/* Edit button only shows up in "My Collections" tab */}
              {activeTab === 'owned' && (
                <button
                  className="mt-2 px-4 py-1 text-sm bg-sky-600 text-white rounded hover:bg-sky-700"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent Link navigation
                    // Add your edit functionality here
                  }}
                >
                  Edit
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
