"use client";

import { Box } from "@mui/material";
import { Trash2 } from "lucide-react";

type FlashcardFormProps = {
  id: number;
  question: string;
  answer: string;
  onUpdate: (id: number, field: "question" | "answer", value: string) => void;
  onDelete: (id: number) => void;
};

const FlashcardForm: React.FC<FlashcardFormProps> = ({
  id,
  question,
  answer,
  onUpdate,
  onDelete,
}) => {
  // Function to handle auto-resizing
  const handleResize = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    event.target.style.height = "auto"; // Reset height to auto to allow shrinking
    event.target.style.height = `${event.target.scrollHeight}px`; // Set to scroll height
  };

  return (
    <div className="2xl:w-5/12 xl:w-7/12 flex flex-col mb-4 dark:bg-sky-600 bg-blue-100 rounded-alg">
      <div className="p-4 border-b border-zinc-400 dark:border-slate-300">
        <div className="flex flex-row">
          <p className="flex-1 antialiased">{id + 1}</p>
          <Trash2
            className="h-4 w-6 cursor-pointer"
            onClick={() => onDelete(id)}
          />
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-row gap-6">
          {/* Question Textarea */}
          <textarea
            className="flex-1 peer w-full bg-transparent border-b-2 placeholder-zinc-500 dark:placeholder-slate-300 border-zinc-500 dark:border-slate-300 dark:text-white focus:outline-none focus:ring-0 focus:border-zinc-900 dark:focus:border-white antialiased resize-none"
            value={question}
            placeholder="Question"
            onInput={handleResize}
            onChange={(e) => onUpdate(id, "question", e.target.value)}
            rows={1} // Minimum height
          ></textarea>

          {/* Answer Textarea */}
          <textarea
            className="flex-1 peer w-full bg-transparent border-b-2 placeholder-zinc-500 dark:placeholder-slate-300 border-zinc-500 dark:border-slate-300 dark:text-white focus:outline-none focus:ring-0 focus:border-zinc-900 dark:focus:border-white antialiased resize-none"
            value={answer}
            placeholder="Answer"
            onInput={handleResize}
            onChange={(e) => onUpdate(id, "answer", e.target.value)}
            rows={1} 
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default FlashcardForm;