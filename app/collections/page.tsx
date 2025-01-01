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
  getDocs,
  updateDoc,
  writeBatch,
  DocumentData,
} from "firebase/firestore";
import Link from "next/link";
import { Pencil, Trash2, Share } from "lucide-react";

interface Collection {
  name: string;
  questionCount?: number;
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

      // Update the collection name in the flashcards array
      const updatedCollections = userCollections.map((col: Collection) => {
        if (col.name === selectedCollection) {
          return { ...col, name: newCollectionName };
        }
        return col;
      });

      batch.update(userDocRef, { flashcards: updatedCollections });

      // Rename the actual collection in Firestore
      const oldCollectionRef = collection(userDocRef, selectedCollection);
      const newCollectionRef = collection(userDocRef, newCollectionName);

      const colSnap = await getDocs(oldCollectionRef);

      // Copy documents to the new collection
      colSnap.forEach((document) => {
        const newDocRef = doc(newCollectionRef, document.id);
        batch.set(newDocRef, document.data());
      });

      // Delete the old collection documents
      colSnap.forEach((document) => {
        // Renamed from 'doc' to 'document'
        batch.delete(document.ref);
      });

      await batch.commit();

      // Update the state with the new collection names
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

        // Remove the collection name from the flashcards array
        const updatedCollections = userCollections.filter(
          (col: Collection) => col.name !== selectedCollection
        );

        await updateDoc(userDocRef, { flashcards: updatedCollections });

        // Delete the actual collection from Firestore
        const collectionRef = collection(userDocRef, selectedCollection);
        const colSnap = await getDocs(collectionRef);

        const batch = writeBatch(db);

        // Delete all documents in the collection
        colSnap.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();

        // Update the state with the remaining collections
        setCollections(
          updatedCollections.map((col: Collection) => {
            const existing = collections.find((c) => c.name === col.name);
            return {
              ...col,
              questionCount: existing ? existing.questionCount : 0,
            };
          })
        );

        await fetchCollections(); // Ensure this is awaited to finish before continuing
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

        // Create a reference to the hub collection and the specific user's subcollection
        const hubRef = collection(db, "hub");
        const userHubRef = doc(hubRef, user.id);

        // Get all flashcards from the collection
        const flashcardsData = colSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Create a new document in the hub with the collection name
        const collectionInHub = collection(userHubRef, selectedCollection);

        // Add each flashcard to the hub collection
        const batch = writeBatch(db);

        flashcardsData.forEach((flashcard) => {
          const newDocRef = doc(collectionInHub);
          batch.set(newDocRef, flashcard);
        });

        await batch.commit();
        alert("Collection shared successfully to the hub!");
      }
    } catch (error) {
      console.error("Error sharing collection:", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 6,
          mb: 6,
          maxWidth: "80rem",
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          </Box>
        ) : collections.length === 0 ? (
          <>
            <Typography
              variant="h3"
              className="mb-6 scroll-m-20 antialiased text-4xl font-bold tracking-tight lg:text-5xl"
            >
              No collections made yet
            </Typography>
            <Button variant="contained" color="primary" sx={{ mt: 2 }}>
              <Link href="/text-generations" passHref>
                Go to Generate Flashcards
              </Link>
            </Button>
          </>
        ) : (
          <>
            <h3
              className="mb-6 scroll-m-20 antialiased text-4xl font-bold tracking-tight lg:text-5xl"
            >
              Your Collections
            </h3>
            <List sx={{ width: "100%", mt: 2 }}>
              {collections.map((col, index) => (
                <ListItem
                  key={index}
                  className="mb-4 ring ring-sky-600 dark:ring-sky-500 ring-opacity-50 focus:ring-opacity-100 text-xl antialiased rounded-list-item"
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Link href={`/flashcards/${col.name}`} passHref>
                    <p className="text-base antialiased">
                      {`${col.name} (${col.questionCount} questions)`}
                    </p>
                  </Link>
                  <Box className="flex items-center gap-2">
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleOpenModal(col.name)}
                      className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                    >
                      <Pencil />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => {
                        setSelectedCollection(col.name);
                        handleDeleteCollection();
                      }}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="share to hub"
                      onClick={() => {
                        setSelectedCollection(col.name);
                        handleShareCollection();
                      }}
                      className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      <Share />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            p: 4,
            backgroundColor: "white",
            margin: "auto",
            mt: 6,
            borderRadius: "8px",
            width: "400px",
          }}
        >
          <h6>Edit or Delete Collection</h6>
          <TextField
            label="New Collection Name"
            fullWidth
            margin="normal"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
          />
          <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
            <Button onClick={handleCloseModal} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleSaveCollectionName}
              variant="contained"
              color="primary"
            >
              Save
            </Button>
            <Button
              onClick={handleDeleteCollection}
              variant="contained"
              color="secondary"
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
}
