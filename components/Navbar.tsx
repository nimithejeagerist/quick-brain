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
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setTheme } = useTheme();

  const handleMenuClose = () => {
    setOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-zinc-900 relative">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
              QuickBrain
            </h1>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
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

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-4">
            <SignedOut>
              <div className="flex gap-3">
                <Link href="/sign-in">
                  <Button className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-800 text-white font-medium px-4 sm:px-6">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium px-4 sm:px-6">
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

        {/* Mobile Menu */}
        <div className={`lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'} absolute top-full left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 shadow-lg z-50`}>
          <div className="flex flex-col space-y-4 px-4 py-6">
            <Link 
              href="/collections"
              className="text-gray-700 dark:text-zinc-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Collections
            </Link>
            
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-zinc-300 font-medium">Generations</p>
              <div className="flex flex-col space-y-2 pl-4">
                <Link 
                  href="/create-flashcards"
                  className="text-gray-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create
                </Link>
                <Link 
                  href="/text-generations"
                  className="text-gray-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Text
                </Link>
                <Link 
                  href="/image-generations"
                  className="text-gray-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Image
                </Link>
                <Link 
                  href="/document-generations"
                  className="text-gray-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Document
                </Link>
              </div>
            </div>

            <Link 
              href="/hub"
              className="text-gray-700 dark:text-zinc-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Hub
            </Link>

            <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
              <SignedOut>
                <div className="flex flex-col space-y-3">
                  <Link href="/sign-in" className="w-full">
                    <Button className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-800 text-white font-medium">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up" className="w-full">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </SignedOut>

              <div className="flex items-center justify-between mt-4">
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
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
          </div>
        </div>
      </nav>
      <div className="border-t border-gray-200 dark:border-zinc-800" />
    </header>
  );
}
