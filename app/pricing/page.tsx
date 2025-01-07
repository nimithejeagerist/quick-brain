"use client"

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Container } from "@mui/material";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CircleCheck, CircleX } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const { user } = useUser();
  const router = useRouter();

  const handleProButtonClick = () => {
    if (user) {
      // User is signed in, redirect directly to payment page
      router.push("/payment");
    } else {
      // User is not signed in, redirect to sign-in page with redirectUrl
      router.push("/sign-in?redirectUrl=/payment");
    }
  };

  return (
    <Container maxWidth="xl">
      {/* Hero Text for the page */}
      <div className="flex flex-col justify-center items-center text-center mt-20">
        <div>
          <h1 className="text-6xl text-zinc-900 dark:text-zinc-100 font-bold">
            Turn Ideas into Knowledge in Seconds
          </h1>
        </div>
        <div className="text-center w-8/12 mt-5">
          <p className="text-xl font-normal text-gray-600 dark:text-zinc-300 antialiased">
            QuickBrain helps you transform your study material into flashcards
            effortlessly. Whether you’re dealing with text, images, or
            documents, our tool simplifies learning so you can focus on what
            really matters.
          </p>
        </div>
      </div>

      {/* Cards for the two plans */}
      <div className="flex flex-row justify-center items-center mt-20 space-x-14">
        <Card className="pricing-card shadow-md hover:shadow-lg rounded-[15px] transition ease-in duration-300">
          <CardHeader>
            <CardTitle className="font-medium text-xl antialiased">
              Get Started with the Basics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-1">
              <span className="text-5xl font-bold text-blue-600 antialiased">
                Free
              </span>
            </div>
            <p className="mt-2 text-gray-600 dark:text-zinc-300">
              The basics for automating your design tokens and assets syncing.
            </p>
            <button className="mt-7 bg-blue-600 hover:bg-blue-700 text-white w-full rounded-lg button">
              <div className="text font-semibold leading-6 antialiased">
                <Link href="/sign-in">Start free</Link>
              </div>
            </button>
            <ul className="mt-14 space-y-3">
              <li className="flex items-center space-x-2">
                <CircleCheck className="w-5 h-5 text-blue-600" />
                <span className="antialiased font-medium">
                  Generate flashcards from any text input.
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <CircleCheck className="w-5 h-5 text-blue-600" />
                <span className="antialiased font-medium">
                  Convert images into study material
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <CircleCheck className="w-5 h-5 text-blue-600" />
                <span className="antialiased font-medium">
                  Upload and generate flashcards from documents
                </span>
                <span className="antialiased font-semibold">(trial basis)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CircleX className="w-5 h-5 text-blue-600" />
                <span className="antialiased font-medium">
                  Early Access to New Features
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="pricing-card shadow-md hover:shadow-lg rounded-[15px] transition ease-in duration-300">
          <CardHeader>
            <CardTitle className="font-medium text-xl antialiased">
              Unlimited Full Potential
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-1">
              <span className="text-5xl font-bold text-orange-600 antialiased">
                $5
              </span>
              <span className="text-gray-500 dark:text-zinc-300 text-lg antialiased">/month</span>
            </div>
            <p className="mt-2 text-gray-600 dark:text-zinc-300">
              The basics for automating your design tokens and assets syncing.
            </p>
            <button
              className="mt-7 bg-orange-600 hover:bg-orange-700 text-white w-full rounded-lg button"
              onClick={handleProButtonClick}
            >
              <div className="text font-semibold leading-6 antialiased">
                Unlock Pro Features
              </div>
            </button>
            <ul className="mt-14 space-y-3">
              <li className="flex items-center space-x-2">
                <CircleCheck className="w-5 h-5 text-orange-600" />
                <span className="antialiased font-medium">
                  Generate flashcards from any text input.
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <CircleCheck className="w-5 h-5 text-orange-600" />
                <span className="antialiased font-medium">
                  Convert images into study material
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <CircleCheck className="w-5 h-5 text-orange-600" />
                <span className="antialiased font-medium">
                  Upload and generate flashcards from documents
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <CircleCheck className="w-5 h-5 text-orange-600" />
                <span className="antialiased font-medium">
                  Early Access to New Features
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}