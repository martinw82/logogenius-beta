
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { DialogFooter, DialogClose } from "@/components/ui/dialog"; // Added DialogClose

// This is a placeholder component. Replace with your actual quiz logic.

interface BrandArchetypeQuizProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuizComplete: (archetype: string, analysis: string) => void;
}

// Example questions and archetypes - replace with your actual quiz structure
const quizSteps = [
  {
    question: "What is your brand's primary motivation?",
    options: [
      { text: "To provide safety and stability", archetypePoints: { Caregiver: 2, Ruler: 1 } },
      { text: "To innovate and create new things", archetypePoints: { Creator: 2, Sage: 1 } },
      { text: "To challenge the status quo", archetypePoints: { Outlaw: 2, Hero: 1 } },
      { text: "To connect with others", archetypePoints: { Lover: 2, Jester: 1 } },
    ],
  },
  {
    question: "How does your brand communicate?",
    options: [
      { text: "With empathy and understanding", archetypePoints: { Caregiver: 2, Innocent: 1 } },
      { text: "With wisdom and expertise", archetypePoints: { Sage: 2, Ruler: 1 } },
      { text: "With boldness and rebellion", archetypePoints: { Outlaw: 2, Magician: 1 } },
      { text: "With fun and humor", archetypePoints: { Jester: 2, Everyman: 1 } },
    ],
  },
  {
    question: "What is your brand's biggest fear?",
    options: [
      { text: "Instability or harm to others", archetypePoints: { Caregiver: 2 } },
      { text: "Mediocrity or stagnation", archetypePoints: { Creator: 2, Explorer: 1 } },
      { text: "Being powerless or controlled", archetypePoints: { Outlaw: 2, Hero: 1 } },
      { text: "Being alone or unloved", archetypePoints: { Lover: 2 } },
    ],
  },
];

const archetypesData: { [key: string]: string } = {
  Innocent: "Seeks happiness and simplicity. Values honesty and optimism.",
  Everyman: "Relatable and friendly. Values belonging and equality.",
  Hero: "Courageous and competent. Values mastery and making an impact.",
  Outlaw: "Rebellious and disruptive. Values liberation and revolution.",
  Explorer: "Adventurous and independent. Values freedom and discovery.",
  Creator: "Imaginative and innovative. Values creativity and self-expression.",
  Ruler: "Authoritative and responsible. Values control and order.",
  Magician: "Visionary and transformative. Values power and making dreams real.",
  Lover: "Intimate and passionate. Values connection and appreciation.",
  Caregiver: "Nurturing and compassionate. Values service and protecting others.",
  Jester: "Playful and humorous. Values enjoyment and living in the moment.",
  Sage: "Wise and knowledgeable. Values truth and understanding.",
};


export function BrandArchetypeQuiz({ open, onOpenChange, onQuizComplete }: BrandArchetypeQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [scores, setScores] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Reset quiz when it's re-opened
    if (open) {
      setCurrentStep(0);
      setAnswers({});
      setScores({});
    }
  }, [open]);

  const handleOptionSelect = (optionText: string) => {
    setAnswers(prev => ({ ...prev, [currentStep]: optionText }));
  };

  const calculateScores = () => {
    const newScores: { [key: string]: number } = {};
    Object.values(answers).forEach((answerText, index) => {
      const step = quizSteps[index];
      const selectedOption = step.options.find(opt => opt.text === answerText);
      if (selectedOption?.archetypePoints) {
        for (const archetype in selectedOption.archetypePoints) {
          newScores[archetype] = (newScores[archetype] || 0) + selectedOption.archetypePoints[archetype];
        }
      }
    });
    return newScores;
  };

  const determineArchetype = (finalScores: { [key: string]: number }) => {
    let maxScore = 0;
    let dominantArchetype = "Everyman"; // Default archetype
    for (const archetype in finalScores) {
      if (finalScores[archetype] > maxScore) {
        maxScore = finalScores[archetype];
        dominantArchetype = archetype;
      }
    }
    return dominantArchetype;
  };

  const handleNext = () => {
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Quiz finished
      const finalScores = calculateScores();
      setScores(finalScores);
      const archetype = determineArchetype(finalScores);
      const analysis = archetypesData[archetype] || "No specific analysis available.";
      onQuizComplete(archetype, analysis);
      onOpenChange(false); // Close the dialog
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!open) return null;

  const progressPercentage = ((currentStep + 1) / quizSteps.length) * 100;

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-[400px] flex flex-col">
      <h3 className="text-xl font-semibold text-center">Discover Your Brand Archetype</h3>
      
      <div className="space-y-1">
        <Progress value={progressPercentage} className="w-full h-2" />
        <p className="text-xs text-muted-foreground text-center">Step {currentStep + 1} of {quizSteps.length}</p>
      </div>

      <div className="flex-grow">
        <p className="text-lg font-medium mb-4">{quizSteps[currentStep].question}</p>
        <RadioGroup
          value={answers[currentStep]}
          onValueChange={handleOptionSelect}
          className="space-y-3"
        >
          {quizSteps[currentStep].options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors">
              <RadioGroupItem value={option.text} id={`q${currentStep}-option${index}`} />
              <Label htmlFor={`q${currentStep}-option${index}`} className="flex-1 cursor-pointer">{option.text}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <DialogFooter className="mt-auto pt-4">
        {currentStep > 0 && (
          <Button variant="outline" onClick={handlePrevious}>Previous</Button>
        )}
        <Button 
          onClick={handleNext} 
          disabled={!answers[currentStep]}
          className="ml-auto"
        >
          {currentStep < quizSteps.length - 1 ? 'Next' : 'Finish Quiz'}
        </Button>
         <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
}
