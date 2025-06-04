"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  initials: string;
  avatarBg: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechFirm Inc.",
    quote: "LogoGenius transformed our brand identity overnight. The AI-generated concepts were spot-on and saved us thousands in design costs.",
    initials: "SJ",
    avatarBg: "bg-primary/20",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Founder",
    company: "GreenStart",
    quote: "As a startup founder, I needed a professional logo quickly. LogoGenius delivered multiple concepts that perfectly captured our eco-friendly mission.",
    initials: "MC",
    avatarBg: "bg-accent/20",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "Creative Lead",
    company: "Artisan Collective",
    quote: "The brand guide generated alongside our logo gave us a complete brand identity system. Impressive AI technology with real creative intelligence.",
    initials: "ER",
    avatarBg: "bg-amber-200",
  },
  {
    id: 4,
    name: "David Wilson",
    role: "CEO",
    company: "NexGen Solutions",
    quote: "LogoGenius helped us rebrand in record time. The AI understood our industry and created a logo that stands out among our competitors.",
    initials: "DW",
    avatarBg: "bg-emerald-200",
  }
];

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1);
  };

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        nextTestimonial();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto px-4 py-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute -top-6 left-4 md:left-8 text-primary/20">
        <Quote size={50} strokeWidth={1} className="transform rotate-180" />
      </div>

      <div className="flex overflow-hidden relative">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id} 
              className="w-full flex-shrink-0 border-primary/10 bg-background/80 backdrop-blur-sm"
            >
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className={cn(
                    "flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-primary font-bold text-xl",
                    testimonial.avatarBg
                  )}>
                    {testimonial.initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg md:text-xl font-light mb-4 italic text-foreground/90">
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={prevTestimonial}
          className="h-9 w-9 rounded-full"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                index === activeIndex 
                  ? "bg-primary w-4" 
                  : "bg-primary/30"
              )}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={nextTestimonial}
          className="h-9 w-9 rounded-full"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}