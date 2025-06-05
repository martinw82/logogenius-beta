"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface LogoShowcaseProps {
  className?: string;
}

// Sample showcase logos - these would normally come from an API or database
const showcaseLogos = [
  {
    id: 1,
    businessName: "Brand Buidler",
    industry: "Buisiness branding",
    imageUrl: "/brandbuidler_logo_1.png",
  },
  {
    id: 2,
    businessName: "Buidl Framework",
    industry: "Startup Business Guidance WEB3",
    imageUrl: "/buidl_logo_1.png",
  },
  {
    id: 3, 
    businessName: "Gut Feeling",
    industry: "gut Health tracker",
    imageUrl: "/gut_feeling_c655c8c1.png",
  },
  {
    id: 4,
    businessName: "LogoGenius",
    industry: "Branding and Design",
    imageUrl: "logogeni_us_70fb47ae.png",
  },
  {
    id: 5,
    businessName: "LogoGenius",
    industry: "graphics, logo, design, branding",
    imageUrl: "/logogeni_us_ded8b761.png",
  },
  {
    id: 6,
    businessName: "tokengatr",
    industry: "Web 3/Blockchain",
    imageUrl: "/tokengatr_66f7c027.png",
  }
];

export function LogoShowcase({ className }: LogoShowcaseProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className={cn("py-12", className)}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stunning Logos Created with LogoGenius</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse through our gallery of AI-generated logos to see what's possible with our platform.
            Each logo was created in minutes using our intuitive design tools.
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {showcaseLogos.map((logo) => (
            <motion.div 
              key={logo.id} 
              className="group relative aspect-square overflow-hidden rounded-lg border bg-background shadow-md transition-all hover:shadow-lg"
              variants={item}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={logo.imageUrl}
                  alt={`Logo for ${logo.businessName}`}
                  width={300}
                  height={300}
                  className="object-contain p-4"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-semibold">{logo.businessName}</h3>
                <p className="text-white/80 text-xs">{logo.industry}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}