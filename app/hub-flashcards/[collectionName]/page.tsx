"use client";

import { Box, Typography, Container } from "@mui/material";
import { useState, useEffect } from "react";
import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import Flashcard from "@/components/Flashcard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface FlashcardProps {
  flashcard: {
    id?: string;
    front: string;
    back: string;
  };
}

interface FlashcardsPageProps {
  params: {
    collectionName: string;
  };
  searchParams: {
    userId: string;
  };
}

export default function HubFlashcardsPage({ params, searchParams }: FlashcardsPageProps) {
  const { collectionName } = params;
  const { userId } = searchParams;
  const [flashcards, setFlashcards] = useState<FlashcardProps["flashcard"][]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!collectionName || !userId) return;
      
      const decodedCollectionName = decodeURIComponent(collectionName);

      try {
        const userDocRef = doc(collection(db, "users"), userId);
        const colRef = collection(userDocRef, decodedCollectionName);
        const colSnap = await getDocs(colRef);

        const flashcardsData: FlashcardProps["flashcard"][] = colSnap.docs.map((doc) => ({
          id: doc.id,
          front: doc.data().front || "",
          back: doc.data().back || "",
        }));

        setFlashcards(flashcardsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [collectionName, userId]);

  const handleNext = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Container maxWidth="lg">
          <Box sx={{ pt: 4, pb: 8 }}>
            <div className="mb-4 text-center">
              <Skeleton width={300} height={40} />
            </div>
            
            <div className="flex justify-center items-center gap-8">
              <div className="p-2">
                <Skeleton circle width={48} height={48} />
              </div>

              <div className="flex-1 flex justify-center">
                <div className="w-[500px] h-[300px]">
                  <Skeleton height="100%" />
                </div>
              </div>

              <div className="p-2">
                <Skeleton circle width={48} height={48} />
              </div>
            </div>

            <div className="text-center mt-4">
              <Skeleton width={100} height={20} />
            </div>
          </Box>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Container maxWidth="lg">
        <Box sx={{ pt: 4, pb: 8 }}>
          {flashcards.length > 0 ? (
            <>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ mb: 4 }}
                className="text-center font-semibold text-gray-900 dark:text-white"
              >
                {decodeURIComponent(collectionName)}
              </Typography>
              
              <div className="flex justify-center items-center gap-8">
                <button
                  onClick={handlePrevious}
                  className="p-2 rounded-full hover:bg-sky-200 dark:hover:bg-zinc-700 transition-colors"
                  disabled={flashcards.length <= 1}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>

                <div className="flex-1 flex justify-center">
                  <Flashcard flashcard={flashcards[currentCardIndex]} />
                </div>

                <button
                  onClick={handleNext}
                  className="p-2 rounded-full hover:bg-sky-200 dark:hover:bg-zinc-700 transition-colors"
                  disabled={flashcards.length <= 1}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>

              <Typography variant="body2" className="text-center mt-4 text-gray-600 dark:text-gray-400">
                Card {currentCardIndex + 1} of {flashcards.length}
              </Typography>
            </>
          ) : (
            <Box
              sx={{
                mt: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center"
              }}
            >
              <Typography variant="h6" className="dark:text-white">
                No flashcards found in this collection.
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </div>
  );
}
