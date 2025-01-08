"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect, CSSProperties } from "react";
import { Container, Box } from "@mui/material";
import { db } from "@/firebase";
import { collection, doc, getDoc, writeBatch } from "firebase/firestore";
import Preview from "@/components/Preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWorker } from "tesseract.js";
import Image from "next/image";
import { TextArea } from "@/components/ui/textarea";
import SyncLoader from "react-spinners/SyncLoader";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export default function GenerateWithImagePage() {
  const router = useRouter();
  const color = "#0284c7"
  const { isLoaded, isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("idle");
  const [flashcards, setFlashcards] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleExtract = async () => {
    if (!imageData) {
      setError("Please select an image first");
      return;
    }

    try {
      const worker = await createWorker("eng", 1,{
        logger: (m) => {
          setProgress(m.progress);
          setProgressLabel(m.progress === 1 ? "done" : m.status);
        },
      });

      const { data: { text } } = await worker.recognize(imageData);
      await worker.terminate();

      if (!text.trim()) {
        throw new Error("No text could be extracted from the image");
      }

      return text;
    } catch (error) {
      console.error("Error extracting text:", error);
      setError("Failed to extract text from image. Please try a different image.");
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!imageData) {
      setError("Please select an image first");
      return;
    }

    if (imageData.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      return;
    }

    setError("");
    setFlashcards([]);
    setLoading(true);
    
    try {
      const extractedText = await handleExtract();
      if (!extractedText) return;

      const response = await fetch("/api/image-generations", {
        method: "POST",
        body: JSON.stringify({ textGenerated: extractedText }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setFlashcards(data);
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

    if (!flashcards.length) {
      setError("No flashcards to save");
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
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="mt-6 mb-6 max-w-[80rem] mx-auto flex flex-col items-center">
          <Skeleton height={48} width="75%" className="mb-10" />
          <Skeleton height={300} width="100%" className="max-w-2xl mb-6" />
          <Skeleton height={40} width="100%" className="max-w-2xl" />
        </div>
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
        <h1 className="mb-10 scroll-m-20 antialiased text-4xl font-bold tracking-tight lg:text-5xl">
          Generate Flashcards from Image
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded w-full max-w-2xl">
            {error}
          </div>
        )}

        <div className="w-full max-w-2xl">
          <div 
            className={`relative group border-2 ${imageData ? 'border-solid border-sky-600' : 'border-dashed border-sky-400'} rounded-xl p-8 transition-all duration-300 hover:border-sky-600`}
          >
            <label
              htmlFor="dropzone-file"
              className={`
                flex flex-col items-center justify-center w-full min-h-[200px] rounded-lg cursor-pointer
                ${!imageData ? 'bg-gradient-to-b from-sky-50 to-transparent dark:from-sky-900/20' : ''}
                transition-all duration-300
              `}
            >
              {!imageData ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 rounded-full bg-sky-100 dark:bg-sky-900/30">
                    <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium antialiased mb-2">
                      Drop your image here, or <span className="text-sky-600">browse</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Supports: JPG, PNG, GIF (Max 10MB)
                    </p>
                  </div>
                </div>
              ) : (
                <Image
                  src={URL.createObjectURL(imageData)}
                  alt="Preview"
                  width={400}
                  height={300}
                  className="rounded-lg object-contain max-h-[300px] w-auto"
                />
              )}
              <Input
                id="dropzone-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    if (file.size > 10 * 1024 * 1024) {
                      setError("Image size must be less than 10MB");
                      return;
                    }
                    setError("");
                    setImageData(file);
                  }
                }}
              />
            </label>

            {imageData && (
              <button
                onClick={() => {
                  setImageData(null);
                  setError("");
                }}
                className="absolute -top-3 -right-3 p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <Button
            className="w-full mt-6 bg-sky-600 hover:bg-sky-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
            onClick={handleSubmit}
            disabled={!imageData || loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <span className="text-base antialiased">Processing</span>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              </div>
            ) : (
              <span className="text-base antialiased">Generate Flashcards</span>
            )}
          </Button>
        </div>

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
                  setImageData(null);
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