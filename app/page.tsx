"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Brain, Zap, Users } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const features = [
    {
      icon: <Brain className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Smart Learning",
      description: "Create and study flashcards efficiently with our intelligent system"
    },
    {
      icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Quick Creation", 
      description: "Generate flashcard sets instantly using AI assistance"
    },
    {
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Collaborative",
      description: "Share and study with friends to enhance your learning experience"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-transparent to-gray-50 dark:to-zinc-900">
      <div className="max-w-[95%] xs:max-w-[90%] sm:max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 pt-12 xs:pt-16 sm:pt-20 pb-12 sm:pb-16">
        <motion.div 
          className="text-center space-y-4 xs:space-y-6 sm:space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-violet-500 px-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Welcome to QuickBrain
          </motion.h1>
          
          <motion.p 
            className="text-lg xs:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2"
            {...fadeIn}
          >
            Supercharge your learning with AI-powered flashcards
          </motion.p>

          <motion.div 
            className="flex flex-col xs:flex-row gap-3 xs:gap-4 justify-center items-center px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link href={isSignedIn ? "/text-generations" : "/sign-in"} className="w-full xs:w-auto">
              <button className="w-full xs:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium text-base sm:text-lg flex items-center justify-center gap-2 transition-colors">
                Get Started <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Link>
            <button 
              onClick={() => router.push('/demo-collection')}
              className="w-full xs:w-auto px-6 sm:px-8 py-3 sm:py-4 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl font-medium text-base sm:text-lg transition-colors"
            >
              View Demo
            </button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-16 sm:mt-20 md:mt-24 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-2"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-800 shadow-xl hover:shadow-2xl transition-shadow"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-3 sm:mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 dark:text-white">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
