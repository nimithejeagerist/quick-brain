"use client";

import { Box } from "@mui/material";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type FlashcardFormProps = {
    id: number;
    question: string;
    answer: string;
  };
  

const FlashcardForm: React.FC<FlashcardFormProps> = ({ id, question, answer }) => {

    return (
        <div className="w-10/12 flex flex-col">
            <div className="flex flex-row">
                <p className="flex-1">{id}</p>
                <Trash2 className="h-4 w-6" />
            </div>
        </div>
    );
};

export default FlashcardForm;
