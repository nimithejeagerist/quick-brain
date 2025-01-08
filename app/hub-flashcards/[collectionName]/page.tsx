"use client";

import { Box, Typography, Container } from "@mui/material";
import { useState, useEffect } from "react";
import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import Flashcard from "@/components/Flashcard";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
      } catch (error) {
        console.error("Error fetching flashcards:", error);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-50 dark:from-zinc-900 dark:to-zinc-800">
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
