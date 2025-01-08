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
  isDeleting?: boolean;
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
    <div className="relative flex flex-col justify-center items-center">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 animate-fadeIn">
          <div className="flex flex-col text-center items-center">
            <div className="loader border-t-4 border-white rounded-full w-16 h-16"></div>
            <p className="mt-3 text-white text-base 2xl:text-lg antialiased animate-pulse">
              Saving... {progress}%
            </p>
          </div>
        </div>
      )}

      <h3 className="mt-10 mb-8 scroll-m-20 antialiased text-4xl font-bold tracking-tight 2xl:text-5xl text-black dark:text-white bg-clip-text animate-fadeIn">
        Create Your Flashcards
      </h3>

      <div className="w-5/12 mb-8 fade-in-up">
        <input
          className="w-full bg-transparent border-b-2 placeholder-zinc-500 dark:placeholder-slate-300 border-zinc-500 dark:border-slate-300 dark:text-white focus:outline-none focus:ring-0 focus:border-zinc-900 dark:focus:border-white antialiased transition-all duration-300"
          value={name}
          placeholder="Enter a name for your flashcard set"
          onChange={(e) => setName(e.target.value)}
        />
        {name && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-slate-300 animate-fadeIn">
            Creating set: {name}
          </p>
        )}
      </div>

      <div className="w-full space-y-4">
        {flashcards.map((card, index) => (
          <div
            key={card.id}
            className="transform transition-all duration-300 animate-fadeIn"
            style={{
              animation: `${card.isDeleting ? 'fadeOutLeft 0.3s ease-out forwards' : 'fadeInRight 0.3s ease-out'}`
            }}
          >
            <FlashcardForm
              id={index}
              question={card.question}
              answer={card.answer}
              onUpdate={updateFlashcard}
              onDelete={(id) => {
                setFlashcards(cards => 
                  cards.map(card => 
                    card.id === id ? { ...card, isDeleting: true } : card
                  )
                );
                setTimeout(() => deleteFlashcard(id), 300);
              }}
            />
          </div>
        ))}
      </div>
      <div ref={dummyRef} />

      <div className="flex flex-row gap-4 mt-8 mb-12">
        <button
          onClick={addFlashcard}
          className="group px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium"
        >
          <span className="flex items-center">
            Add Card 
            <span className="inline-block transition-transform duration-300 group-hover:rotate-90">+</span>
          </span>
        </button>
        <button
          onClick={saveFlashcards}
          disabled={!name || flashcards.every(card => !card.question.trim() && !card.answer.trim())}
          className={`px-6 py-3 rounded-lg shadow-md font-medium transform transition-all duration-300
            ${!name || flashcards.every(card => !card.question.trim() && !card.answer.trim())
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:scale-105'
            } text-white`}
        >
          {!name ? 'Name Required' : 'Save Collection'}
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeOutLeft {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-20px);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
