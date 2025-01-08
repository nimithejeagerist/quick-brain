"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect, CSSProperties } from "react";
import { db } from "@/firebase";
import { collection, doc, getDoc, writeBatch } from "firebase/firestore";
import Preview from "@/components/Preview";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import SyncLoader from "react-spinners/SyncLoader";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export default function GenerateWithTextPage() {
  const color = "#0284c7"
  const { isLoaded, isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    setFlashcards([]);
    setLoading(true);
    try {
      const response = await fetch("/api/text-generations", {
        method: "POST",
        body: text,
      });

      const data = await response.json();
      setLoading(false);
      setFlashcards(data.flashcards);
    } catch (error) {
      console.error("Error generating flashcards:", error);
    }
  };

  const saveFlashcards = async () => {
    if (!name) {
      alert("Please enter a name for the flashcard set");
      return;
    }

    // Need to encode to ensure safe storing
    const batch = writeBatch(db);
    if (user) {
      const userDocRef = doc(collection(db, "users"), user.id);

      try {
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const collections = docSnap.data().flashcards || [];

          if (collections.find((f: any) => f.name === name)) {
            alert("Flashcard set with the same name already exists");
            return;
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
      } catch (error) {
        console.error("Error getting user document:", error);
      }
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4">
      <div className="mt-6 mb-6 max-w-[80rem] mx-auto flex flex-col items-center">
        <h3 className="mb-6 scroll-m-20 antialiased text-4xl font-bold tracking-tight 2xl:text-5xl">Generate Flashcards</h3>
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
          disabled={!text.trim()}
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
                disabled={!name || !flashcards.length}
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