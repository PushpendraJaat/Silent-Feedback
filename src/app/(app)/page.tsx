"use client"

import React from 'react'
import AutoPlay from 'embla-carousel-autoplay'
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

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
    "Received a different item than ordered."
]

const Home = () => {
    return (
        <>
            <main className='flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12'>
                <section className='text-center mb-8 md:mb-12'>
                    <h1 className='text-3xl md:text-5xl font-bold'>Dive into the secret world!</h1>
                    <p className='mt-3 md:mt-4 text-base md:text-lg'>Explore Secret Message - Where your idendtity remains a mystery.</p>
                </section>
                <Carousel className="w-full max-w-xs"
                    plugins={[AutoPlay({ delay: 2000 })]}>
                    <CarouselContent>
                        {messages.map((message, index) => (
                            <CarouselItem key={index}>
                                <div className="p-1">
                                    <Card>
                                        <CardContent className="flex aspect-square items-center justify-center p-6">
                                            <span className="text-4xl font-semibold">{message}</span>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </main>
        </>
    )
}

export default Home
