"use client";

import FlashcardForm from "@/components/FlashcardForm";
import React, { useState } from "react";

type FlashCardFormProps = {
  id: number;
  question: string;
  answer: string;
};

export default function CreateFlashcards() {
  const [flashcards, setFlashcards] = useState<FlashCardFormProps[]>(
    Array.from({ length: 5 }, (_, index) => ({
      id: index,
      question: "",
      answer: "",
    }))
  );

  const addFlashcard = () => {
    setFlashcards([
      ...flashcards,
      { id: flashcards.length, question: "", answer: "" },
    ]);
  };

  const updateFlashcard = (
    id: number,
    field: "question" | "answer",
    value: string
  ) => {
    setFlashcards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, [field]: value } : card))
    );
  };

  return (
    <div className="flex flex-col justify-center mt-10 items-center">
      <h3 className="mb-6 scroll-m-20 antialiased text-4xl font-bold tracking-tight lg:text-5xl">
        Create Flashcards
      </h3>
      {flashcards.map((card) => (
        <FlashcardForm
          key={card.id}
          id={card.id}
          question={card.question}
          answer={card.answer}
          onUpdate={updateFlashcard}
        />
      ))}
      <button
        onClick={addFlashcard}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add Flashcard
      </button>
    </div>
  );
}
