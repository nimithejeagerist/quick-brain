"use client"

import FlashcardForm from "@/components/FlashcardForm";
import React, { useState } from "react";

type FlashCardFormProps = {
    id: number;
    question: string;
    answer: string;
}

export default function CreateFlashcards() {

    const [flashcards, setFlashcards] = useState<FlashCardFormProps[]>([])


    return (
        <div className="flex flex-col justify-center mt-10 items-center">
            <h3 className="mb-6 scroll-m-20 antialiased text-4xl font-bold tracking-tight lg:text-5xl">Create Flashcards</h3>
            <FlashcardForm id={1} question="" answer="" />
        </div>
    )
}