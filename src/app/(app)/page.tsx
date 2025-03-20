"use client";

import React from "react";
import AutoPlay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const messages = [
  "Great service, will use again!",
  "The product quality could be improved.",
  "Customer support was very helpful.",
  "Delivery was faster than expected.",
  "Not satisfied with the purchase.",
  "Amazing experience, highly recommend!",
  "The website is user-friendly.",
  "Had issues with the payment process.",
  "The packaging was damaged.",
  "Received a different item than ordered.",
];

const Home = () => {
  return (
    <main className="flex-grow flex flex-col items-center justify-center px-6 md:px-16 py-16 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Dive into the Secret World
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300">
          Explore Silent Feedback — Where your identity remains a mystery.
        </p>
      </section>

      {/* Carousel Section */}
      <Carousel
        className="w-full max-w-lg"
        plugins={[AutoPlay({ delay: 2500 })]}
      >
        <CarouselContent>
          {messages.map((message, index) => (
            <CarouselItem key={index}>
              <div className="p-2">
                <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl transition-transform duration-300 hover:scale-[1.05] hover:shadow-xl dark:hover:shadow-2xl">
                  <CardContent className="flex aspect-square items-center justify-center p-8">
                    <span className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200 text-center leading-relaxed">
                      {message}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hover:bg-gray-300 dark:hover:bg-gray-700 transition-all rounded-full shadow-md dark:shadow-gray-700" />
        <CarouselNext className="hover:bg-gray-300 dark:hover:bg-gray-700 transition-all rounded-full shadow-md dark:shadow-gray-700" />
      </Carousel>
    </main>
  );
};

export default Home;
