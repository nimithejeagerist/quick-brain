"use client";

import { useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  NotebookPen,
  ChevronDownIcon,
  Type,
  Image,
  FileText,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { setTheme } = useTheme();

  const handleMenuClose = () => {
    setOpen(false);
  };

  return (
    <header className="bg-white dark:bg-zinc-900">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
              QuickBrain
            </h1>
          </Link>

          {/* Main Navigation */}
          <div className="flex items-center gap-8">
            <Link 
              href="/collections"
              className="text-gray-700 dark:text-zinc-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
            >
              Collections
            </Link>

            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 dark:text-zinc-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors">
                Generations
                <ChevronDownIcon className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem onClick={handleMenuClose} className="py-2">
                  <NotebookPen className="mr-2 h-4 w-4" />
                  <Link href="/create-flashcards" className="flex-1">Create</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMenuClose} className="py-2">
                  <Type className="mr-2 h-4 w-4" />
                  <Link href="/text-generations" className="flex-1">Text</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMenuClose} className="py-2">
                  <Image className="mr-2 h-4 w-4" />
                  <Link href="/image-generations" className="flex-1">Image</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMenuClose} className="py-2">
                  <FileText className="mr-2 h-4 w-4" />
                  <Link href="/document-generations" className="flex-1">Document</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link 
              href="/hub"
              className="text-gray-700 dark:text-zinc-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
            >
              Hub
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <div className="flex gap-3">
                <Link href="/sign-in">
                  <Button className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-800 text-white font-medium px-6">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium px-6">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </SignedOut>
            
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="ml-2">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
      <div className="border-t border-gray-200 dark:border-zinc-800" />
    </header>
  );
}
