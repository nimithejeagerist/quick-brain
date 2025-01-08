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
      icon: <Brain className="w-6 h-6" />,
      title: "Smart Learning",
      description: "Create and study flashcards efficiently with our intelligent system"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Quick Creation", 
      description: "Generate flashcard sets instantly using AI assistance"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Collaborative",
      description: "Share and study with friends to enhance your learning experience"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-transparent to-gray-50 dark:to-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div 
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-violet-500"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Welcome to QuickBrain
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            {...fadeIn}
          >
            Supercharge your learning with AI-powered flashcards
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link href={isSignedIn ? "/text-generations" : "/sign-in"}>
              <button className="px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium text-lg flex items-center gap-2 transition-colors">
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <button 
              onClick={() => router.push('/demo-collection')}
              className="px-8 py-4 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl font-medium text-lg transition-colors"
            >
              View Demo
            </button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-24 grid md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="p-6 rounded-2xl bg-white dark:bg-zinc-800 shadow-xl hover:shadow-2xl transition-shadow"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
