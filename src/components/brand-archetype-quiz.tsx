
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";

interface BrandArchetypeQuizProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuizComplete: (archetype: string, analysis: string) => void;
}

// Mapping of complementary archetypes based on natural affinities
const archetypeAffinities: Record<string, string[]> = {
  "Innocent": ["Jester", "Caregiver", "Everyman"],
  "Everyman": ["Innocent", "Caregiver", "Lover"],
  "Hero": ["Ruler", "Magician", "Explorer"],
  "Rebel": ["Explorer", "Creator", "Jester"],
  "Explorer": ["Rebel", "Sage", "Hero"],
  "Creator": ["Magician", "Rebel", "Sage"],
  "Ruler": ["Hero", "Sage", "Caregiver"],
  "Magician": ["Creator", "Hero", "Lover"],
  "Lover": ["Caregiver", "Jester", "Magician"],
  "Caregiver": ["Innocent", "Lover", "Ruler"],
  "Jester": ["Innocent", "Rebel", "Lover"],
  "Sage": ["Explorer", "Creator", "Ruler"]
};

const questions = [
  {
    question: "What is the main goal or purpose of your business?",
    options: [
      { key: 'a', text: "To help people feel safe and secure.", archetype: "Innocent" },
      { key: 'b', text: "To help people connect with each other and feel like they belong.", archetype: "Everyman" },
      { key: 'c', text: "To help people overcome challenges and succeed.", archetype: "Hero" },
      { key: 'd', text: "To challenge the usual way of doing things and offer something new or rebellious.", archetype: "Rebel" },
      { key: 'e', text: "To help people explore new possibilities and feel a sense of freedom.", archetype: "Explorer" },
      { key: 'f', text: "To create new and valuable things or ideas.", archetype: "Creator" },
      { key: 'g', text: "To be in charge and create order and stability.", archetype: "Ruler" },
      { key: 'h', text: "To make things happen or make dreams come true.", archetype: "Magician" },
      { key: 'i', text: "To create closeness, beauty, or passion.", archetype: "Lover" },
      { key: 'j', text: "To care for and protect others.", archetype: "Caregiver" },
      { key: 'k', text: "To bring joy and have fun.", archetype: "Jester" },
      { key: 'l', text: "To provide knowledge and truth.", archetype: "Sage" }
    ]
  },
  {
    question: "What do you want your customers to feel when they interact with your brand?",
    options: [
      { key: 'a', text: "Safe and trusting.", archetype: "Innocent" },
      { key: 'b', text: "Included and connected.", archetype: "Everyman" },
      { key: 'c', text: "Inspired and capable.", archetype: "Hero" },
      { key: 'd', text: "Excited and liberated.", archetype: "Rebel" },
      { key: 'e', text: "Adventurous and independent.", archetype: "Explorer" },
      { key: 'f', text: "Inspired and imaginative.", archetype: "Creator" },
      { key: 'g', text: "Confident and secure.", archetype: "Ruler" },
      { key: 'h', text: "Amazed and hopeful.", archetype: "Magician" },
      { key: 'i', text: "Desired and appreciated.", archetype: "Lover" },
      { key: 'j', text: "Cared for and supported.", archetype: "Caregiver" },
      { key: 'k', text: "Happy and entertained.", archetype: "Jester" },
      { key: 'l', text: "Informed and enlightened.", archetype: "Sage" }
    ]
  },
  {
    question: "How does your business typically solve problems or help customers?",
    options: [
      { key: 'a', text: "By being reliable and straightforward.", archetype: "Innocent" },
      { key: 'b', text: "By being friendly and accessible.", archetype: "Everyman" },
      { key: 'c', text: "By being strong and determined.", archetype: "Hero" },
      { key: 'd', text: "By breaking the rules or doing things differently.", archetype: "Rebel" },
      { key: 'e', text: "By exploring new solutions and pushing boundaries.", archetype: "Explorer" },
      { key: 'f', text: "By inventing or building something new.", archetype: "Creator" },
      { key: 'g', text: "By taking control and implementing a clear plan.", archetype: "Ruler" },
      { key: 'h', text: "By finding innovative or seemingly magical solutions.", archetype: "Magician" },
      { key: 'i', text: "By creating a desirable or appealing experience.", archetype: "Lover" },
      { key: 'j', text: "By providing support and looking after their needs.", archetype: "Caregiver" },
      { key: 'k', text: "By using humor and making things lighthearted.", archetype: "Jester" },
      { key: 'l', text: "By offering expert advice and information.", archetype: "Sage" }
    ]
  },
  {
    question: "What is your business most proud of?",
    options: [
      { key: 'a', text: "Our honesty and goodness.", archetype: "Innocent" },
      { key: 'b', text: "Our ability to connect with everyone.", archetype: "Everyman" },
      { key: 'c', text: "Our strength and impact.", archetype: "Hero" },
      { key: 'd', text: "Our courage to be different.", archetype: "Rebel" },
      { key: 'e', text: "Our spirit of discovery and independence.", archetype: "Explorer" },
      { key: 'f', text: "Our original ideas and creations.", archetype: "Creator" },
      { key: 'g', text: "Our leadership and success.", archetype: "Ruler" },
      { key: 'h', text: "Our ability to transform things.", archetype: "Magician" },
      { key: 'i', text: "The passion and connection we create.", archetype: "Lover" },
      { key: 'j', text: "The care and support we provide.", archetype: "Caregiver" },
      { key: 'k', text: "The joy and fun we bring.", archetype: "Jester" },
      { key: 'l', text: "Our knowledge and understanding.", archetype: "Sage" }
    ]
  },
  {
    question: "If your brand was a person, what would be their most noticeable personality trait?",
    options: [
      { key: 'a', text: "Optimistic and simple.", archetype: "Innocent" },
      { key: 'b', text: "Friendly and down-to-earth.", archetype: "Everyman" },
      { key: 'c', text: "Brave and strong.", archetype: "Hero" },
      { key: 'd', text: "Rebellious and bold.", archetype: "Rebel" },
      { key: 'e', text: "Adventurous and independent.", archetype: "Explorer" },
      { key: 'f', text: "Imaginative and inventive.", archetype: "Creator" },
      { key: 'g', text: "Confident and in control.", archetype: "Ruler" },
      { key: 'h', text: "Charismatic and visionary.", archetype: "Magician" },
      { key: 'i', text: "Passionate and captivating.", archetype: "Lover" },
      { key: 'j', text: "Compassionate and nurturing.", archetype: "Caregiver" },
      { key: 'k', text: "Humorous and playful.", archetype: "Jester" },
      { key: 'l', text: "Wise and knowledgeable.", archetype: "Sage" }
    ]
  }
];

const archetypeDescriptions: Record<string, string> = {
  "Innocent": "Your brand is seen as simple, good, and trustworthy. You bring a sense of ease and happiness.",
  "Everyman": "Your brand is relatable, friendly, and approachable. You make people feel included and understood.",
  "Hero": "Your brand is courageous and inspiring. You help people achieve great things and overcome obstacles.",
  "Rebel": "Your brand is bold and challenges the norm. You appeal to those who want to break free or do things differently.",
  "Explorer": "Your brand is adventurous and independent. You encourage discovery and new experiences.",
  "Creator": "Your brand is imaginative and innovative. You empower people to create and express themselves.",
  "Ruler": "Your brand is powerful and in control. You offer a sense of security and stability.",
  "Magician": "Your brand is visionary and transformative. You make things happen and bring dreams to life.",
  "Lover": "Your brand is passionate and creates connection. You evoke feelings of intimacy, desire, and appreciation.",
  "Caregiver": "Your brand is nurturing and supportive. You prioritize helping and protecting others.",
  "Jester": "Your brand is fun and lighthearted. You bring joy and entertain your audience.",
  "Sage": "Your brand is knowledgeable and wise. You provide insights and help people understand the world."
};

const archetypeColors: Record<string, string> = {
  "Innocent": "#FFFACD", // LemonChiffon
  "Everyman": "#90EE90", // LightGreen
  "Hero": "#FFD700",     // Gold
  "Rebel": "#DC143C",    // Crimson
  "Explorer": "#1E90FF", // DodgerBlue
  "Creator": "#FF8C00",  // DarkOrange
  "Ruler": "#800080",   // Purple
  "Magician": "#4B0082", // Indigo
  "Lover": "#FF69B4",    // HotPink
  "Caregiver": "#87CEEB",// SkyBlue
  "Jester": "#FF6347",   // Tomato
  "Sage": "#2E8B57"      // SeaGreen
};

export function BrandArchetypeQuiz({ open, onOpenChange, onQuizComplete }: BrandArchetypeQuizProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Record<string, number>>({});
  const [crossoverView, setCrossoverView] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Reset quiz when it's re-opened
    if (open) {
      resetQuizInternal();
    }
  }, [open]);
  
  useEffect(() => {
    if (showResults && crossoverView && canvasRef.current) {
      drawCrossoverMap();
    }
  }, [showResults, crossoverView, selectedArchetype, results]); // Added results to dependencies
  
  const drawCrossoverMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40; // Adjusted radius for labels
    
    ctx.clearRect(0, 0, width, height);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ccc'; // Lighter stroke
    ctx.lineWidth = 1;
    ctx.stroke();
    
    const archetypesList = Object.keys(archetypeDescriptions);
    const angleStep = (2 * Math.PI) / archetypesList.length;
    
    const currentDominantArchetype = getDominantArchetype();

    if (selectedArchetype && currentDominantArchetype) { // Ensure currentDominantArchetype is available
      const selectedIndex = archetypesList.indexOf(selectedArchetype);
      const complementary = archetypeAffinities[selectedArchetype] || [];
      
      const dominantX = centerX + (radius * 0.7) * Math.cos(archetypesList.indexOf(currentDominantArchetype) * angleStep - Math.PI / 2);
      const dominantY = centerY + (radius * 0.7) * Math.sin(archetypesList.indexOf(currentDominantArchetype) * angleStep - Math.PI / 2);


      archetypesList.forEach((archetype, i) => {
        if (complementary.includes(archetype)) {
          const angle = i * angleStep - Math.PI / 2;
          const x = centerX + (radius*0.7) * Math.cos(angle);
          const y = centerY + (radius*0.7) * Math.sin(angle);
          
          ctx.beginPath();
           // From selected archetype node center (smaller radius)
          const selectedAngle = selectedIndex * angleStep - Math.PI / 2;
          ctx.moveTo(
            centerX + (radius * 0.7) * Math.cos(selectedAngle), 
            centerY + (radius * 0.7) * Math.sin(selectedAngle)
          );
          ctx.lineTo(x, y);
          ctx.strokeStyle = 'rgba(65, 105, 225, 0.5)'; // Lighter blue
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }
    
    archetypesList.forEach((archetype, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const nodeX = centerX + radius * Math.cos(angle);
      const nodeY = centerY + radius * Math.sin(angle);
      
      ctx.beginPath();
      const nodeRadius = (archetype === selectedArchetype) ? 12 : 
                         (selectedArchetype && archetypeAffinities[selectedArchetype]?.includes(archetype)) ? 10 : 8;
      ctx.arc(nodeX, nodeY, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = archetypeColors[archetype] || 'rgba(200, 200, 200, 0.8)';
      if (archetype === selectedArchetype) {
         ctx.fillStyle = archetypeColors[selectedArchetype];
      } else if (selectedArchetype && archetypeAffinities[selectedArchetype]?.includes(archetype)) {
         ctx.fillStyle = archetypeColors[archetype];
         ctx.globalAlpha = 0.7;
      } else {
         ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
      }
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = '#888'; // Darker stroke for nodes
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.font = '10px Arial'; // Smaller font
      ctx.fillStyle = '#333'; // Darker text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const labelRadius = radius + 15; // Closer labels
      const labelX = centerX + labelRadius * Math.cos(angle);
      const labelY = centerY + labelRadius * Math.sin(angle);
      
      ctx.save();
      ctx.translate(labelX, labelY);
      let rotationAngle = angle;
      if (angle > Math.PI / 2 && angle < 3 * Math.PI / 2) {
        rotationAngle += Math.PI;
      }
      ctx.rotate(rotationAngle);
      ctx.fillText(archetype, 0, 0);
      ctx.restore();
    });
    
    if (currentDominantArchetype) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI); // Larger central node
      ctx.fillStyle = archetypeColors[currentDominantArchetype];
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = getContrastColor(archetypeColors[currentDominantArchetype]);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentDominantArchetype, centerX, centerY);
    }
  };

  const getContrastColor = (hexcolor: string): string => {
    if (hexcolor.startsWith('#')) {
        hexcolor = hexcolor.slice(1);
    }
    if (hexcolor.length === 3) {
        hexcolor = hexcolor.split('').map(char => char + char).join('');
    }
    const r = parseInt(hexcolor.substring(0, 2), 16);
    const g = parseInt(hexcolor.substring(2, 4), 16);
    const b = parseInt(hexcolor.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
  };


  const handleAnswer = (questionIndex: number, optionKey: string) => {
    const newAnswers = { ...answers, [questionIndex]: optionKey };
    setAnswers(newAnswers);
    
    // Do not automatically advance, let user click Next or See Results
    // if (questionIndex < questions.length - 1) {
    //   setCurrentQuestion(questionIndex + 1);
    // }
  };

  const calculateResults = () => {
    const archetypeCounts: Record<string, number> = {};
    Object.keys(archetypeDescriptions).forEach(archetype => {
      archetypeCounts[archetype] = 0;
    });
    
    Object.values(answers).forEach((optionKey, index) => { // Use index from Object.values
      const question = questions[Number(Object.keys(answers)[index])]; // Get original question index
      const selectedOption = question.options.find(option => option.key === optionKey);
      if (selectedOption) {
        archetypeCounts[selectedOption.archetype] = (archetypeCounts[selectedOption.archetype] || 0) + 1;
      }
    });
    
    const sortedResults = Object.entries(archetypeCounts)
      .sort((a, b) => b[1] - a[1])
      .reduce((result, [archetype, count]) => {
        result[archetype] = count;
        return result;
      }, {} as Record<string, number>);
    
    setResults(sortedResults);
    const dominant = Object.keys(sortedResults)[0];
    setSelectedArchetype(dominant); // Set dominant as initially selected for map
    setShowResults(true);
  };

  const resetQuizInternal = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setResults({});
    setSelectedArchetype(null);
    setCrossoverView(false);
  };

  const handleRestartQuiz = () => {
    resetQuizInternal();
    onOpenChange(true); // Keep dialog open
  }

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToNextQuestion = () => {
     if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }

  const getDominantArchetype = (): string | null => {
    if (Object.keys(results).length === 0) return null;
    return Object.keys(results)[0];
  };
  
  const getSecondaryArchetype = (): string | null => {
    if (Object.keys(results).length < 2) return null;
    return Object.keys(results)[1];
  };
  
  const getTertiaryArchetype = (): string | null => {
    if (Object.keys(results).length < 3) return null;
    return Object.keys(results)[2];
  };
  
  const getComplementaryArchetypes = (): string[] => {
    const dominant = getDominantArchetype();
    if (!dominant || !archetypeAffinities[dominant]) return [];
    return archetypeAffinities[dominant];
  };
  
  const isNaturalBlend = (): boolean => {
    const dominant = getDominantArchetype();
    const secondary = getSecondaryArchetype();
    const tertiary = getTertiaryArchetype();
    
    if (!dominant || !secondary) return false;
    
    const complementary = archetypeAffinities[dominant] || [];
    return complementary.includes(secondary) || (tertiary != null && complementary.includes(tertiary));
  };

  const canCalculateResults = Object.keys(answers).length === questions.length;

  const handleConfirmArchetype = () => {
    const dominant = getDominantArchetype();
    if (dominant && archetypeDescriptions[dominant]) {
      onQuizComplete(dominant, archetypeDescriptions[dominant]);
      onOpenChange(false);
    }
  };

  if (!open) return null;

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="p-2 md:p-4 space-y-6 max-h-[80vh] overflow-y-auto"> {/* Adjusted padding */}
      {!showResults ? (
        <>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold text-center">Brand Archetype Quiz</h3>
              <span className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</span>
            </div>
            <Progress value={progressPercentage} className="w-full h-2" />
          </div>
          
          <div className="mb-6 min-h-[200px]"> {/* Min height for question area */}
            <h2 className="text-lg font-medium mb-4">{questions[currentQuestion].question}</h2>
            <div className="grid gap-3">
              {questions[currentQuestion].options.map((option) => (
                <Button
                  key={option.key}
                  variant={answers[currentQuestion] === option.key ? "default" : "outline"}
                  onClick={() => handleAnswer(currentQuestion, option.key)}
                  className="p-3 text-left justify-start h-auto whitespace-normal"
                >
                  <span className="font-semibold mr-2">{option.key.toUpperCase()}:</span> {option.text}
                </Button>
              ))}
            </div>
          </div>
          
          <DialogFooter className="mt-auto pt-4">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            {currentQuestion < questions.length - 1 && (
               <Button
                onClick={goToNextQuestion}
                disabled={answers[currentQuestion] === undefined}
              >
                Next
              </Button>
            )}
            {currentQuestion === questions.length - 1 && (
              <Button
                onClick={calculateResults}
                disabled={!canCalculateResults}
              >
                See Results
              </Button>
            )}
             <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Your Brand Archetype Results</h2>
          
          {getDominantArchetype() && (
            <div 
              className="mb-6 p-4 rounded-lg shadow"
              style={{ backgroundColor: archetypeColors[getDominantArchetype()!] || '#e0e0e0' }}
            >
              <h3 className="text-xl font-bold mb-2 text-center" style={{color: getContrastColor(archetypeColors[getDominantArchetype()!] || '#e0e0e0')}}>
                Your dominant archetype is: The {getDominantArchetype()}
              </h3>
              <p className="text-md text-center" style={{color: getContrastColor(archetypeColors[getDominantArchetype()!] || '#e0e0e0')}}>
                {archetypeDescriptions[getDominantArchetype()!]}
              </p>
              
              {getSecondaryArchetype() && (
                <div className="mt-4">
                  <h4 className="text-lg font-semibold mb-2" style={{color: getContrastColor(archetypeColors[getDominantArchetype()!] || '#e0e0e0')}}>Archetype Blend</h4>
                  <div className="bg-white bg-opacity-90 p-3 rounded-md">
                    <p className="mb-2 text-sm">
                      <span className="font-bold">Primary:</span> The {getDominantArchetype()} ({results[getDominantArchetype()!]}/{questions.length})
                    </p>
                    <p className="mb-2 text-sm">
                      <span className="font-bold">Secondary:</span> The {getSecondaryArchetype()} ({results[getSecondaryArchetype()!]}/{questions.length})
                    </p>
                    {getTertiaryArchetype() && (
                      <p className="text-sm">
                        <span className="font-bold">Tertiary:</span> The {getTertiaryArchetype()} ({results[getTertiaryArchetype()!]}/{questions.length})
                      </p>
                    )}
                    
                    {isNaturalBlend() ? (
                      <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded-md text-sm">
                        <p className="font-semibold text-green-800">
                          Great combination! Your top archetypes naturally complement each other.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded-md text-sm">
                        <p className="font-semibold text-yellow-800">
                          Your top archetypes offer a unique blend. Consider how to harmonize these traits.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Your Full Archetype Profile:</h3>
            <div className="space-y-3">
              {Object.entries(results).map(([archetype, count]) => (
                <div key={archetype} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2 shrink-0"
                    style={{ backgroundColor: archetypeColors[archetype] }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="font-medium">The {archetype}</span>
                      <span>{count} / {questions.length}</span>
                    </div>
                    <Progress value={(count / questions.length) * 100} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-center">Archetype Crossover Mapping</h3>
            
            <div className="flex justify-center mb-3">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setCrossoverView(!crossoverView)}
              >
                {crossoverView ? 'Hide Visual Map' : 'Show Visual Map'}
              </Button>
            </div>
            
            {crossoverView && (
              <div className="mb-4">
                <div className="text-center mb-2 text-xs text-muted-foreground">
                  Click an archetype name below to see its affinities on the map.
                </div>
                <div className="flex justify-center mb-3">
                  <canvas 
                    ref={canvasRef}
                    id="crossoverCanvas" 
                    width="300"  // Reduced size for dialog
                    height="300" 
                    className="max-w-full border rounded-md"
                  ></canvas>
                </div>
                <div className="flex flex-wrap justify-center gap-1 mb-3">
                  {Object.keys(archetypeDescriptions).map(archetype => (
                    <Button
                      key={archetype}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedArchetype(archetype)}
                      className="text-xs h-7 px-2"
                      style={{ 
                        backgroundColor: archetype === selectedArchetype ? 
                          archetypeColors[archetype] : 
                          'transparent',
                        borderColor: archetypeColors[archetype],
                        color: archetype === selectedArchetype ? getContrastColor(archetypeColors[archetype]) : archetypeColors[archetype]
                      }}
                    >
                      {archetype}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {getDominantArchetype() && (
              <div>
                <h4 className="font-semibold text-md mb-1">Complementary Archetypes for The {getDominantArchetype()}:</h4>
                <div className="flex flex-wrap gap-1 mb-4">
                  {getComplementaryArchetypes().map(archetype => (
                    <div 
                      key={archetype}
                      className="px-2 py-0.5 rounded-full text-xs font-medium text-white" // Assuming white text is okay on most archetypeColors
                      style={{ backgroundColor: archetypeColors[archetype], color: getContrastColor(archetypeColors[archetype]) }}
                    >
                      The {archetype}
                    </div>
                  ))}
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-md mb-1">How to Apply Your Archetype Blend:</h4>
                  <ol className="list-decimal pl-5 space-y-1 text-xs">
                    <li><strong>Core Identity:</strong> Lead with your {getDominantArchetype()} qualities.</li>
                    <li><strong>Supporting Elements:</strong> Incorporate aspects of your {getSecondaryArchetype() || "secondary"} archetype.</li>
                    <li><strong>Brand Expression:</strong> Use this blend in messaging, visuals, and interactions.</li>
                    <li><strong>Consistency:</strong> Ensure all brand touchpoints reflect this blend.</li>
                  </ol>
                </div>
              </div>
            )}
            
            <div className="text-center text-xs">
              <h4 className="font-semibold mb-1">Benefits of Archetype Crossover:</h4>
              <ul className="list-disc list-inside inline-block text-left mb-3">
                <li>More nuanced brand personality</li>
                <li>Enhanced storytelling</li>
                <li>Broader appeal</li>
                <li>Differentiation</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="mt-auto pt-4">
            <Button variant="outline" onClick={handleRestartQuiz}>
              Take Quiz Again
            </Button>
            <Button onClick={handleConfirmArchetype} disabled={!getDominantArchetype()}>
              Use This Archetype & Close
            </Button>
             <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      )}
    </div>
  );
}
