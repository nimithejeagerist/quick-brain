"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

const MAX_CHARS = 500;

type FlashcardFormProps = {
  id: number;
  question: string;
  answer: string;
  onUpdate: (id: number, field: "question" | "answer", value: string) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
};

const FlashcardForm: React.FC<FlashcardFormProps> = ({
  id,
  question,
  answer,
  onUpdate,
  onDelete,
  isDeleting = false
}) => {
  const [questionChars, setQuestionChars] = useState(0);
  const [answerChars, setAnswerChars] = useState(0);

  useEffect(() => {
    setQuestionChars(question.length);
    setAnswerChars(answer.length);
  }, [question, answer]);

  // Function to handle auto-resizing and character limits
  const handleResize = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 300)}px`; 
  };

  const handleChange = (field: "question" | "answer", value: string) => {
    if (value.length <= MAX_CHARS) {
      onUpdate(id, field, value);
    }
  };

  return (
    <div id={`card-${id}`} className={`w-full max-w-4xl mx-auto flex flex-col mb-6 bg-blue-100 dark:bg-sky-600 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg ${isDeleting ? 'animate-fadeOutLeft' : 'animate-fadeInRight'}`}>
      <div className="p-4 border-b border-zinc-400 dark:border-slate-300">
        <div className="flex items-center justify-between">
          <p className="text-lg font-medium antialiased">{id + 1}</p>
          <button
            onClick={() => onDelete(id)}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full transition-colors"
            aria-label="Delete flashcard"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Question Section */}
          <div className="flex-1">
            <div className="relative">
              <textarea
                className="w-full bg-transparent border-b-2 placeholder-zinc-500 dark:placeholder-slate-300 border-zinc-500 dark:border-slate-300 dark:text-white focus:outline-none focus:ring-0 focus:border-zinc-900 dark:focus:border-white antialiased resize-none transition-colors peer"
                value={question}
                placeholder="Question"
                onInput={handleResize}
                onChange={(e) => handleChange("question", e.target.value)}
                rows={1}
                maxLength={MAX_CHARS}
              />
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-500 dark:text-slate-300">
                {questionChars}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Answer Section */}
          <div className="flex-1">
            <div className="relative">
              <textarea
                className="w-full bg-transparent border-b-2 placeholder-zinc-500 dark:placeholder-slate-300 border-zinc-500 dark:border-slate-300 dark:text-white focus:outline-none focus:ring-0 focus:border-zinc-900 dark:focus:border-white antialiased resize-none transition-colors peer"
                value={answer}
                placeholder="Answer"
                onInput={handleResize}
                onChange={(e) => handleChange("answer", e.target.value)}
                rows={1}
                maxLength={MAX_CHARS}
              />
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-500 dark:text-slate-300">
                {answerChars}/{MAX_CHARS}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardForm;