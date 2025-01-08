import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FlashcardProps {
  flashcard: {
    front: string;
    back: string;
  };
}

const Preview: React.FC<FlashcardProps> = ({ flashcard }) => {
  return (
    <div className="w-full p-2 sm:p-3 md:p-4">
      <Card className="w-full bg-sky-700/60 hover:bg-sky-600/60 transition-colors duration-200">
        <CardContent className="p-4 sm:p-5 md:p-6">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            {/* Question Section */}
            <div className="text-white">
              <h4 className="text-lg sm:text-xl md:text-2xl font-semibold mb-1 sm:mb-2 antialiased">Question</h4>
              <p className="text-base sm:text-lg md:text-xl antialiased">
                {flashcard.front}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-sky-300/30 my-1 sm:my-2"></div>

            {/* Answer Section */}
            <div className="text-white">
              <h4 className="text-lg sm:text-xl md:text-2xl font-semibold mb-1 sm:mb-2 antialiased">Answer</h4>
              <p className="text-base sm:text-lg md:text-xl antialiased">
                {flashcard.back}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Preview;