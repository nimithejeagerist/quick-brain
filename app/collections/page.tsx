"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  Modal,
  TextField,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { db } from "@/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  updateDoc,
  writeBatch,
  DocumentData,
} from "firebase/firestore";
import Link from "next/link";
import { Pencil, Trash2, Share, Plus } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Collection {
  name: string;
  questionCount?: number;
  description?: string;
}

export default function CollectionsPage() {
  const { user } = useUser();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null
  );
  const [newCollectionName, setNewCollectionName] = useState<string>("");

  const fetchCollections = async () => {
    if (user) {
      const userDocRef = doc(collection(db, "users"), user.id);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userCollections = docSnap.data().flashcards || [];

        const collectionsWithCounts = await Promise.all(
          userCollections.map(async (col: Collection) => {
            const colRef = collection(userDocRef, col.name);
            const colSnap = await getDocs(colRef);
            const questionCount = colSnap.size;
            return {
              ...col,
              questionCount,
            };
          })
        );

        setCollections(collectionsWithCounts);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [user]);

  const handleOpenModal = (collectionName: string) => {
    setSelectedCollection(collectionName);
    setNewCollectionName(collectionName);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCollection(null);
    setNewCollectionName("");
  };

  const handleSaveCollectionName = async () => {
    if (!user || !selectedCollection || !newCollectionName.trim()) return;

    const userDocRef = doc(collection(db, "users"), user.id);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const batch = writeBatch(db);
      const userCollections: Collection[] = docSnap.data().flashcards || [];

      const updatedCollections = userCollections.map((col: Collection) => {
        if (col.name === selectedCollection) {
          return { ...col, name: newCollectionName };
        }
        return col;
      });

      batch.update(userDocRef, { flashcards: updatedCollections });

      const oldCollectionRef = collection(userDocRef, selectedCollection);
      const newCollectionRef = collection(userDocRef, newCollectionName);

      const colSnap = await getDocs(oldCollectionRef);

      colSnap.forEach((document) => {
        const newDocRef = doc(newCollectionRef, document.id);
        batch.set(newDocRef, document.data());
      });

      colSnap.forEach((document) => {
        batch.delete(document.ref);
      });

      await batch.commit();

      setCollections(
        updatedCollections.map((col: Collection) => {
          const existing = collections.find((c) => c.name === col.name);
          return {
            ...col,
            questionCount: existing ? existing.questionCount : 0,
          };
        })
      );
      handleCloseModal();
      window.location.reload();
    } else {
      console.error("Document does not exist!");
    }
  };

  const handleDeleteCollection = async () => {
    if (!user || !selectedCollection) return;

    try {
      const userDocRef = doc(collection(db, "users"), user.id);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userCollections: Collection[] = docSnap.data().flashcards || [];

        const updatedCollections = userCollections.filter(
          (col: Collection) => col.name !== selectedCollection
        );

        await updateDoc(userDocRef, { flashcards: updatedCollections });

        const collectionRef = collection(userDocRef, selectedCollection);
        const colSnap = await getDocs(collectionRef);

        const batch = writeBatch(db);

        colSnap.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();

        setCollections(
          updatedCollections.map((col: Collection) => {
            const existing = collections.find((c) => c.name === col.name);
            return {
              ...col,
              questionCount: existing ? existing.questionCount : 0,
            };
          })
        );

        await fetchCollections();
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  const handleShareCollection = async () => {
    if (!user || !selectedCollection) return;
  
    try {
      const userDocRef = doc(collection(db, "users"), user.id);
      const docSnap = await getDoc(userDocRef);
  
      if (docSnap.exists()) {
        const collectionRef = collection(userDocRef, selectedCollection);
        const colSnap = await getDocs(collectionRef);
  
        if (colSnap.empty) {
          alert("The selected collection has no flashcards to share!");
          return;
        }

        const collections = docSnap.data().flashcards || [];
        const collectionData = collections.find((c: Collection) => c.name === selectedCollection);
        const description = collectionData?.description || 'No description provided';
  
        const hubRef = doc(collection(db, "hub"), `${user.id}_${selectedCollection}`);
        await setDoc(hubRef, {
          userId: user.id,
          collectionName: selectedCollection,
          description: description,
          flashcardCount: colSnap.size,
          sharedAt: new Date(),
        });
  
        alert("Collection shared successfully to the hub!");
      }
    } catch (error) {
      console.error("Error sharing collection:", error);
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <Container maxWidth="lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <Skeleton width={200} height={36} />
                <Skeleton width={150} height={40} />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="w-full bg-white dark:bg-zinc-800 rounded-xl p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton width={200} height={24} />
                        <Skeleton width={100} height={20} />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton width={40} height={40} circle />
                        <Skeleton width={40} height={40} circle />
                        <Skeleton width={40} height={40} circle />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Start Your Learning Journey
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4">
                Create your first collection of flashcards to begin studying effectively
              </p>
              <Link href="/text-generations">
                <button className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors text-sm sm:text-base">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Create Your First Collection
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Your Collections
                </h1>
                <Link href="/text-generations">
                  <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors text-sm sm:text-base">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    New Collection
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {collections.map((col, index) => (
                  <div
                    key={index}
                    className="w-full bg-white dark:bg-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-zinc-700 overflow-hidden"
                  >
                    <Link href={`/flashcards/${col.name}`}>
                      <div className="p-6 cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400">
                              {col.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {col.questionCount} {col.questionCount === 1 ? 'card' : 'cards'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleOpenModal(col.name);
                              }}
                              className="p-2 text-gray-600 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedCollection(col.name);
                                handleShareCollection();
                              }}
                              className="p-2 text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
                            >
                              <Share className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedCollection(col.name);
                                handleDeleteCollection();
                              }}
                              className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Modal 
          open={modalOpen} 
          onClose={handleCloseModal}
          className="flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Edit Collection
            </h2>
            <TextField
              label="Collection Name"
              fullWidth
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="mb-6"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCollectionName}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-sky-600 hover:bg-sky-700 text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      </Container>
    </div>
  );
}
