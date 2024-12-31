"use client";

import { useUser } from "@clerk/nextjs";
import FlashcardForm from "@/components/FlashcardForm";
import React, { useState } from "react";
import { db } from "@/firebase";
import { writeBatch, doc, collection, getDoc } from "firebase/firestore";

type FlashCardFormProps = {
  id: number;
  question: string;
  answer: string;
};

// Format for saving the flashcards
type FlashcardSaveProps = {
  back: string;
  front: string;
}

export default function CreateFlashcards() {
  const [flashcards, setFlashcards] = useState<FlashCardFormProps[]>(
    Array.from({ length: 5 }, (_, index) => ({
      id: index,
      question: "",
      answer: "",
    }))
  );
  const [name, setName] = useState("");
  const { isLoaded, isSignedIn, user } = useUser();

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

  const deleteFlashcard = (id: number) => {
    setFlashcards((prev) => prev.filter((card) => card.id !== id));
  };

  const saveFlashcards = async () => {
    if (!name) {
      alert("Please enter a name for the flashcard set");
      return;
    }

    if (!user) {
      alert("You must be logged in to save flashcards");
      return;
    }

    const batch = writeBatch(db);
    const userDocRef = doc(collection(db, "users"), user.id);

    try {
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];

        if (collections.find((f: any) => f.name === name)) {
          alert("A flashcard set with the same name already exists.");
          return;
        } else {
          collections.push({ name });
          batch.set(userDocRef, { flashcards: collections }, { merge: true });
        }
      } else {
        batch.set(userDocRef, { flashcards: [{ name }] });
      }

      const flashcardRef = collection(userDocRef, name);

      flashcards.forEach((flashcard) => {
        const cardDocRef = doc(flashcardRef);

        const transformedFlashcard: FlashcardSaveProps = {
          front: flashcard.question,
          back: flashcard.answer
        }

        batch.set(cardDocRef, transformedFlashcard);
      });

      await batch.commit();
    } catch (error) {
      console.error("Error saving flashcards:", error);
      alert(
        "An error occured while saving the flashcard set. Please try again."
      );
    }
  };

  return (
    <div className="flex flex-col justify-center mt-10 items-center">
      <h3 className="mb-6 scroll-m-20 antialiased text-4xl font-bold tracking-tight lg:text-5xl">
        Create Flashcards
      </h3>
      <h2 className="scroll-m-20 antialiased text-xl font-semibold tracking-tight lg:text-2xl">
        Title
      </h2>
      <input
        className="my-5 flex-1 peer w-5/12 bg-transparent border-b-2 placeholder-zinc-500 dark:placeholder-slate-300 border-zinc-500 dark:border-slate-300  dark:text-white focus:outline-none focus:ring-0 focus:border-zinc-900 dark:focus:border-white antialiased"
        value={name}
        placeholder="Enter a name for your flashcard set"
        onChange={(e) => setName(e.target.value)}
      />
      {flashcards.map((card) => (
        <FlashcardForm
          key={card.id}
          id={card.id}
          question={card.question}
          answer={card.answer}
          onUpdate={updateFlashcard}
          onDelete={deleteFlashcard}
        />
      ))}
      <button
        onClick={addFlashcard}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add Flashcard
      </button>
      <button
        onClick={saveFlashcards}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Save Flashcard
      </button>
    </div>
  );
}
