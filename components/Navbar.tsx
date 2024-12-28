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
    <header className="bg-transparent">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4 relative">
        <div>
          <Button
            variant="ghost"
            className="hover:bg-transparent hover:text-current"
          >
            <Link href="/" passHref>
              <p className="text-2xl font-bold antialiased">QuickBrain</p>
            </Link>
          </Button>
        </div>

        {/* Centered Section */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
          <Button
            variant="ghost"
            className="hover:bg-transparent hover:text-current"
          >
            <Link href="/collections" passHref>
              <p className="text-base font-medium antialiased">Collections</p>
            </Link>
          </Button>
          <div className="flex items-center">
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild className="focus:bg-transparent">
                <Button
                  variant="ghost"
                  className="border-hidden hover:bg-transparent hover-text-current"
                >
                  <p className="text-base font-medium antialiased">
                    Generations
                  </p>
                  <ChevronDownIcon className="mx-1 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
              <DropdownMenuItem
                  onClick={handleMenuClose}
                  className="w-full p-0"
                >
                  <NotebookPen className="pl-2 h-4 w-6" />
                  <Link href="/create-flashcards" passHref className="w-full">
                    <p className="block w-full py-2 pl-2 text-sm font-medium antialiased">
                      From scratch
                    </p>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleMenuClose}
                  className="w-full p-0"
                >
                  <Type className="pl-2 h-4 w-6" />
                  <Link href="/text-generations" passHref className="w-full">
                    <p className="block w-full py-2 pl-2 text-sm font-medium antialiased">
                      Text
                    </p>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleMenuClose}
                  className="w-full p-0"
                >
                  <Image className="pl-2 h-4 w-6" />
                  <Link href="/image-generations" passHref className="w-full">
                    <p className="block w-full py-2 pl-2 text-sm font-medium antialiased">
                      Image
                    </p>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleMenuClose}
                  className="w-full p-0"
                >
                  <FileText className="pl-2 h-4 w-6" />
                  <Link
                    href="/document-generations"
                    passHref
                    className="w-full"
                  >
                    <p className="block w-full py-2 pl-2 text-sm font-medium antialiased">
                      Document
                    </p>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              className="hover:bg-transparent hover:text-current ml-[-4px]"
            >
              <Link href="/pricing" passHref>
                <p className="text-base font-medium antialiased">Pricing</p>
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <SignedOut>
            <div className="space-x-4 ">
              <Link href="/sign-in" passHref>
                <Button className="text-white bg-sky-500 hover:bg-sky-600 text-normal font-semibold rounded-lg antialiased w-20 leading-6 button-two">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" passHref>
                <Button className="text-white bg-orange-500 hover:bg-orange-600 text-normal font-semibold rounded-lg antialiased w-20 leading-6 button-two">
                  Sign Up
                </Button>
              </Link>
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton />
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
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <hr className="border-t-2 border-gray-200 mt-1 w-3/4 mx-auto" />
    </header>
  );
}
