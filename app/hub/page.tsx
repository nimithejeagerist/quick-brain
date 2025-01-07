"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-zinc-900">
      <h1 className="text-4xl mb-8 antialiased font-bold tracking-tight 2xl:text-5xl text-center text-gray-900 dark:text-zinc-100">Welcome to the Community Hub</h1>
      
      {/* Tab Navigation */}
      <div className="flex justify-center space-x-8 mb-10 relative">
        <button
          onClick={() => setActiveTab('public')}
          className={`px-6 py-3 text-lg font-medium relative antialiased tracking-tight rounded-full transition-all duration-300
            ${activeTab === 'public' ? 'text-white bg-sky-600 shadow-lg' : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'}
          `}
        >
          Public Collections
        </button>
        <button
          onClick={() => setActiveTab('owned')}
          className={`px-6 py-3 text-lg font-medium relative antialiased tracking-tight rounded-full transition-all duration-300
            ${activeTab === 'owned' ? 'text-white bg-sky-600 shadow-lg' : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'}
          `}
        >
          My Collections
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="space-y-4">
                <Skeleton height={32} width="80%" />
                <Skeleton height={48} />
                <Skeleton height={24} width="40%" />
              </div>
            </div>
          ))}
        </div>
      ) : displayedCollections.length === 0 ? (
        <div className="text-center mt-12">
          <p className="text-xl text-gray-600 dark:text-zinc-300 font-medium">
            {activeTab === 'public' 
              ? 'No collections have been shared to the hub yet.'
              : 'You haven\'t shared any collections to the hub yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {displayedCollections.map((collection) => (
            <div 
              key={collection.name}
              className="group bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-sky-100 dark:hover:border-sky-900"
            >
              <Link href={`/flashcards/${collection.collectionName}`} className="block">
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold antialiased tracking-tight text-gray-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {collection.collectionName}
                  </h3>
                  <p className="text-gray-600 dark:text-zinc-300 antialiased tracking-tight leading-relaxed">
                    {collection.description}
                  </p>
                  <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    <span className="font-medium">{collection.questionCount} questions</span>
                  </div>
                </div>
              </Link>
              {activeTab === 'owned' && (
                <button
                  className="mt-4 w-full px-4 py-2 text-sm font-medium bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-zinc-800"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  Edit Collection
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
