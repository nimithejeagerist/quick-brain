"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect, CSSProperties } from "react";
import { db } from "@/firebase";
import { collection, doc, getDoc, writeBatch } from "firebase/firestore";
import Preview from "@/components/Preview";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import SyncLoader from "react-spinners/SyncLoader";
import { useRouter } from "next/navigation";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export default function GenerateWithTextPage() {
  const router = useRouter();
  const color = "#0284c7"
  const { isLoaded, isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [text, setText] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Please enter some text to generate flashcards");
      return;
    }

    setError("");
    setFlashcards([]);
    setLoading(true);
    try {
      const response = await fetch("/api/text-generations", {
        method: "POST",
        body: text,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setFlashcards(data.flashcards);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      setError("Failed to generate flashcards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveFlashcards = async () => {
    if (!name) {
      setError("Please enter a name for the flashcard set");
      return;
    }

    if (!user) {
      setError("You must be signed in to save flashcards");
      return;
    }

    setSaving(true);
    setError("");
    const batch = writeBatch(db);
    const userDocRef = doc(collection(db, "users"), user.id);

    try {
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];

        if (collections.find((f: any) => f.name === name)) {
          throw new Error("Flashcard set with the same name already exists");
        } else {
          collections.push({ name, description });
          batch.set(userDocRef, { flashcards: collections }, { merge: true });
        }
      } else {
        batch.set(userDocRef, { flashcards: [{ name, description }] });
      }

      const flashcardRef = collection(userDocRef, name);
      flashcards.forEach((flashcard) => {
        const cardDocRef = doc(flashcardRef);
        batch.set(cardDocRef, flashcard);
      });

      await batch.commit();
      router.push('/collections');
    } catch (error) {
      console.error("Error saving flashcards:", error);
      setError(error instanceof Error ? error.message : "Error saving flashcards. Please try again.");
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SyncLoader color={color} size={15} />
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // useEffect will redirect
  }

  if (saving) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <SyncLoader color={color} size={15} />
          <p className="text-xl font-medium dark:text-white">Saving your flashcards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4">
      <div className="mt-6 mb-6 max-w-[80rem] mx-auto flex flex-col items-center">
        <h3 className="mb-6 scroll-m-20 antialiased text-4xl font-bold tracking-tight 2xl:text-5xl">Generate Flashcards</h3>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to generate flashcards"
          rows={5}
          className="mb-4 ring ring-sky-600 ring-opacity-50 focus:ring-opacity-100 text-base antialiased w-9/12 2xl:w-full"
        />
        <Button
          className="bg-sky-700 hover:bg-sky-600 text-white w-1/2"
          onClick={handleSubmit}
          disabled={!text.trim() || loading}
        >
          <p className="text-base antialiased tracking-tight">Submit</p>
        </Button>

        {loading && (
          <div className="flex justify-center items-center mt-20">
            <SyncLoader
              color={color}
              loading={loading}
              cssOverride={override}
              size={10}
            />
          </div>
        )}

        {flashcards.length > 0 && (
          <>
            <h2 className="mt-14 mb-2 antialiased text-3xl font-semibold tracking-tight">
              Preview Your Flashcards
            </h2>
            <div className="flex flex-col gap-5">
              {flashcards.map((flashcard, index) => (
                <div key={index}>
                  <Preview flashcard={flashcard} />
                </div>
              ))}
            </div>

            <h3 className="mt-4 mb-2 antialiased text-2xl font-semibold tracking-tight">
              Flashcards generated! Save them below:
            </h3>
            <TextArea
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for the collection (max 50 chars)"
              maxLength={50}
              className="mb-4 ring ring-violet-600 ring-opacity-50 focus:ring-opacity-100 text-base antialiased"
            />
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for the collection (max 200 chars)"
              maxLength={200}
              className="mb-4 ring ring-violet-600 ring-opacity-50 focus:ring-opacity-100 text-base antialiased"
            />
            <div className="flex gap-4 w-1/2">
              <Button
                className="bg-violet-800 hover:bg-violet-700 text-white flex-1"
                onClick={saveFlashcards}
                disabled={!name || !flashcards.length || saving}
              >
                <p className="text-base antialiased tracking-tight">Save Flashcards</p>
              </Button>
              <Button
                className="bg-red-700 hover:bg-red-600 text-white flex-1"
                onClick={() => {
                  setText('');
                  setName('');
                  setDescription('');
                  setFlashcards([]);
                  setError('');
                }}
              >
                <p className="text-base antialiased tracking-tight">Clear All</p>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}