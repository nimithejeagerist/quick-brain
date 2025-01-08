"use client";

import { Container, Box, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Flashcard from "@/components/Flashcard";

export default function DemoCollection() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const demoFlashcards = [
    {
      front: "What is QuickBrain?",
      back: "An AI-powered flashcard learning platform that helps users create and study efficiently.",
      tags: ["demo", "introduction"]
    },
    {
      front: "What are the key features?", 
      back: "Smart learning with AI assistance, quick flashcard creation, and collaborative study capabilities.",
      tags: ["features"]
    },
    {
      front: "How does it work?",
      back: "Create collections of flashcards, study them with our interactive viewer, and track your progress over time.",
      tags: ["usage"]
    }
  ];

  const handleNext = () => {
    setCurrentCardIndex((prev) => 
      prev === demoFlashcards.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevious = () => {
    setCurrentCardIndex((prev) => 
      prev === 0 ? demoFlashcards.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen">
      <Container maxWidth="lg">
        <Box sx={{ pt: 4, pb: 8 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ mb: 4 }}
            className="text-center font-semibold text-gray-900 dark:text-white"
          >
            Demo Collection
          </Typography>
          
          <div className="flex justify-center items-center gap-8">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-full hover:bg-sky-200 dark:hover:bg-zinc-700 transition-colors"
              disabled={demoFlashcards.length <= 1}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <div className="flex-1 flex justify-center">
              <Flashcard flashcard={demoFlashcards[currentCardIndex]} />
            </div>

            <button
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-sky-200 dark:hover:bg-zinc-700 transition-colors"
              disabled={demoFlashcards.length <= 1}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          <Typography variant="body2" className="text-center mt-4 text-gray-600 dark:text-gray-400">
            Card {currentCardIndex + 1} of {demoFlashcards.length}
          </Typography>
        </Box>
      </Container>
    </div>
  );
}