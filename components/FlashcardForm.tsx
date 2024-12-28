"use client";

import { Box, TextField } from "@mui/material";
import { Trash2 } from "lucide-react";
import { FlashCardInput } from "./ui/flashcardInput";

type FlashcardFormProps = {
  id: number;
  question: string;
  answer: string;
  onUpdate: (id: number, field: "question" | "answer", value: string) => void;
};

const FlashcardForm: React.FC<FlashcardFormProps> = ({
  id,
  question,
  answer,
  onUpdate,
}) => {
  return (
    <div className="w-10/12 flex flex-col mb-4 dark:bg-sky-700 bg-blue-100 rounded-lg">
      <div className="p-4 border-b border-gray-300">
        <div className="flex flex-row">
          <p className="flex-1">{id + 1}</p>
          <Trash2 className="h-4 w-6 cursor-pointer" />
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-row gap-6">
          <input
            className="flex-1 peer w-full bg-transparent border-b-2 placeholder-slate-300 border-slate-300 text-gray-800 dark:text-white focus:outline-none focus:ring-0 focus:border-white"
            value={question}
            placeholder="Question"
            onChange={(e) => onUpdate(id, "question", e.target.value)}
          />
          <input
            className="flex-1 peer w-full bg-transparent border-b-2 placeholder-slate-300 border-slate-300 text-gray-800 dark:text-white focus:outline-none focus:ring-0 focus:border-white"
            value={answer}
            placeholder="Answer"
            onChange={(e) => onUpdate(id, "answer", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default FlashcardForm;
