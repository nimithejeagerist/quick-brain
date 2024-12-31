"use client";

import { useUser } from "@clerk/nextjs";
import FlashcardForm from "@/components/FlashcardForm";
import React, { useEffect, useState, useRef } from "react";
import { db } from "@/firebase";
import { writeBatch, doc, collection, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

type FlashCardFormProps = {
  id: number;
  question: string;
  answer: string;
};

// Format for saving the flashcards
type FlashcardSaveProps = {
  back: string;
  front: string;
};

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
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const dummyRef = useRef<HTMLDivElement>(null);

  const addFlashcard = () => {
    setFlashcards([
      ...flashcards,
      { id: flashcards.length, question: "", answer: "" },
    ]);

    setTimeout(() => {
      dummyRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
    setIsLoading(true);
    setProgress(0);

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

      let savedCount = 0;
      flashcards.forEach((flashcard) => {
        const cardDocRef = doc(flashcardRef);

        const transformedFlashcard: FlashcardSaveProps = {
          front: flashcard.question,
          back: flashcard.answer,
        };

        batch.set(cardDocRef, transformedFlashcard);

        savedCount++;
        setProgress(Math.round((savedCount / flashcards.length) * 100));
      });

      await batch.commit();
      setProgress(100);
      setTimeout(() => router.push("/collections"), 500);
    } catch (error) {
      console.error("Error saving flashcards:", error);
      alert(
        "An error occured while saving the flashcard set. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col justify-center mt-10 items-center">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="flex flex-col text-center items-center">
            <div className="loader border-t-4 border-white rounded-full w-16 h-16 animate-spin"></div>
            <p className="mt-3 text-white text-base 2xl:text-lg antialiased">
              Saving... {progress}%
            </p>
          </div>
        </div>
      )}

      <h3 className="mb-6 scroll-m-20 antialiased text-4xl font-bold tracking-tight lg:text-5xl">
        Create Flashcards
      </h3>
      <input
        className="my-5 flex-1 peer w-5/12 bg-transparent border-b-2 placeholder-zinc-500 dark:placeholder-slate-300 border-zinc-500 dark:border-slate-300  dark:text-white focus:outline-none focus:ring-0 focus:border-zinc-900 dark:focus:border-white antialiased"
        value={name}
        placeholder="Enter a name for your flashcard set"
        onChange={(e) => setName(e.target.value)}
      />
      {flashcards.map((card, index) => (
        <FlashcardForm
          key={card.id}
          id={index}
          question={card.question}
          answer={card.answer}
          onUpdate={updateFlashcard}
          onDelete={deleteFlashcard}
        />
      ))}
      <div ref={dummyRef} />
      <div className="flex flex-row gap-4 mt-5">
        <button
          onClick={addFlashcard}
          className="px-4 py-2 dark:bg-slate-100 dark:text-black bg-black text-white rounded-md hover:scale-105 transition-transform duration-300"
        >
          Add Flashcard
        </button>
        <button
          onClick={saveFlashcards}
          className="px-4 py-2 dark:bg-slate-100 dark:text-black bg-black text-white rounded-md hover:scale-105 transition-transform duration-300"
        >
          Save Flashcard
        </button>
      </div>
    </div>
  );
}
