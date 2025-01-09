"use client";

import { Button, Grid, Box, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Flashcard from "@/components/Flashcard";
import { ChevronLeft, ChevronRight, Plus, X, Pencil, Trash2 } from "lucide-react";
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
}

export default function FlashcardsPage({ params }: FlashcardsPageProps) {
  const { collectionName } = params;
  const [flashcards, setFlashcards] = useState<FlashcardProps["flashcard"][]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const { user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardProps["flashcard"] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!collectionName || !user) return;
      
      // Need to decode to remove any characters that are in ASCII
      const decodedCollectionName = decodeURIComponent(collectionName)

      try {
        const userDocRef = doc(collection(db, "users"), user.id);
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
  }, [collectionName, user]);

  const handleNext = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  const handleOpenModal = (flashcard: FlashcardProps["flashcard"] | null = null) => {
    setSelectedFlashcard(flashcard || { front: "", back: "" });
    setIsEditing(!!flashcard);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedFlashcard(null);
    setIsEditing(false);
  };

  const handleSaveFlashcard = async () => {
    if (!user || !collectionName) return;

    const userDocRef = doc(collection(db, "users"), user.id);
    const colRef = collection(userDocRef, collectionName);

    try {
      if (isEditing && selectedFlashcard?.id) {
        const flashcardDocRef = doc(colRef, selectedFlashcard.id);
        await updateDoc(flashcardDocRef, {
          front: selectedFlashcard.front,
          back: selectedFlashcard.back,
        });
      } else {
        await addDoc(colRef, {
          front: selectedFlashcard?.front || "",
          back: selectedFlashcard?.back || "",
        });
      }

      const colSnap = await getDocs(colRef);
      const flashcardsData: FlashcardProps["flashcard"][] = colSnap.docs.map((doc) => ({
        id: doc.id,
        front: doc.data().front || "",
        back: doc.data().back || "",
      }));
      setFlashcards(flashcardsData);
    } catch (error) {
      console.error("Error saving flashcard:", error);
    }

    handleCloseModal();
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (!user || !collectionName) return;

    try {
      const userDocRef = doc(collection(db, "users"), user.id);
      const colRef = collection(userDocRef, collectionName);
      const flashcardDocRef = doc(colRef, flashcardId);
      await deleteDoc(flashcardDocRef);

      const colSnap = await getDocs(colRef);
      const flashcardsData: FlashcardProps["flashcard"][] = colSnap.docs.map((doc) => ({
        id: doc.id,
        front: doc.data().front || "",
        back: doc.data().back || "",
      }));
      setFlashcards(flashcardsData);
    } catch (error) {
      console.error("Error deleting flashcard:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <Box sx={{ mt: 6, mb: 6, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="mb-1">
            <Skeleton width={300} height={60} />
          </div>
          <div className="grid grid-flow-col gap-10 mt-2">
            <div className="flex justify-center items-center">
              <Skeleton width={48} height={48} circle />
            </div>
            <div className="w-[500px] h-[300px]">
              <Skeleton height="100%" />
            </div>
            <div className="flex justify-center items-center">
              <Skeleton width={48} height={48} circle />
            </div>
          </div>
          <div className="w-full max-w-4xl mt-12">
            <div className="flex justify-between items-center mb-8">
              <Skeleton width={200} height={32} />
              <Skeleton width={120} height={40} />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <Skeleton height={24} width="80%" />
                      <Skeleton height={20} width="60%" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton width={32} height={32} circle />
                      <Skeleton width={32} height={32} circle />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Box>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Box
        sx={{
          mt: 6,
          mb: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h3" className="mb-1 scroll-m-20 antialiased text-4xl font-bold tracking-tight lg:text-5xl">
          {decodeURIComponent(collectionName)}
        </Typography>
        {flashcards.length > 0 ? (
          <>
            <div className="grid grid-flow-col gap-10 mt-2">
              <div className="flex justify-center items-center">
                <Button variant="contained" color="primary" size="large" onClick={handlePrevious} disabled={currentCardIndex === 0} className="rounded-full dark:disabled:bg-gray-400">
                  <ChevronLeft />
                </Button>
              </div>
              <Flashcard flashcard={flashcards[currentCardIndex]} />
              <div className="flex justify-center items-center">
                <Button variant="contained" color="primary" size="large" onClick={handleNext} disabled={currentCardIndex === flashcards.length - 1} className="rounded-full dark:disabled:bg-gray-400">
                <ChevronRight />
                </Button>
              </div>
            </div>
            <hr className="border-t-2 border-gray-200 mt-16 w-3/4 mx-auto" />

            <div className="w-full max-w-4xl mt-12">
              <div className="flex justify-between items-center mb-8">
                <Typography variant="h4" className="text-2xl font-bold tracking-tight dark:text-white">
                  All Questions ({flashcards.length})
                </Typography>
                <Button
                  onClick={() => handleOpenModal()}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  Add Question
                </Button>
              </div>

              <div className="space-y-4">
                {flashcards.map((flashcard) => (
                  <div
                    key={flashcard.id}
                    className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-zinc-700"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white text-lg">{flashcard.front}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{flashcard.back}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(flashcard)}
                          className="p-2 text-gray-600 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFlashcard(flashcard.id!)}
                          className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <Box
            sx={{
              mt: 6,
              mb: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center"
            }}
          >
            <Typography variant="h6" className="dark:text-white mb-4">No flashcards found in this collection.</Typography>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg"
            >
              Create First Flashcard
            </Button>
          </Box>
        )}
      </Box>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-semibold mb-6 dark:text-white">
              {isEditing ? "Edit Flashcard" : "Add New Flashcard"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-zinc-700 dark:text-white"
                  rows={3}
                  value={selectedFlashcard?.front || ""}
                  onChange={(e) =>
                    setSelectedFlashcard((prev) => ({
                      ...prev!,
                      front: e.target.value,
                    }))
                  }
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Answer
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-zinc-700 dark:text-white"
                  rows={3}
                  value={selectedFlashcard?.back || ""}
                  onChange={(e) =>
                    setSelectedFlashcard((prev) => ({
                      ...prev!,
                      back: e.target.value,
                    }))
                  }
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFlashcard}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
                >
                  {isEditing ? "Save Changes" : "Add Flashcard"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}