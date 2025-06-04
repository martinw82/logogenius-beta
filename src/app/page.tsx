"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Laptop, Palette, Sparkles, Zap, Users, BrainCircuit, 
  MousePointer, PenTool, Hexagon, Award, ArrowDown, BarChart3, 
  Layers, Lightbulb, RefreshCw
} from "lucide-react";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { LogoShowcase } from "@/components/logo-showcase";
import { ScrollToTopButton } from "@/components/ui/scroll-button";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function LandingPage() {
  // Intersection Observer setup for animation triggers
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="container mx-auto px-4 pt-6 md:pt-12 pb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 animate-float">
            <Image
              src="/logogenius-logo.png"
              alt="LogoGenius Logo"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <span className="text-xl font-bold text-primary">LogoGenius</span>
        </div>
        <nav className="hidden md:block">
          <ul className="flex items-center gap-6">
            <li>
              <Link href="/create" className="text-muted-foreground hover:text-foreground transition-colors">
                Create Logo
              </Link>
            </li>
            <li>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
            </li>
            <li>
              <a href="#showcase" className="text-muted-foreground hover:text-foreground transition-colors">
                Showcase
              </a>
            </li>
          </ul>
        </nav>
        <Link href="/create" passHref>
          <Button size="sm" className="md:hidden">Get Started</Button>
        </Link>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/50 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-40 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="relative w-32 h-32 mb-6 animate-float"
            >
              <Image
                src="/logogenius-logo.png"
                alt="LogoGenius App Logo"
                layout="fill"
                objectFit="contain"
              />
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Transform Your <span className="text-primary">Brand Identity</span> with AI
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Generate stunning logo concepts tailored to your brand's unique vision with our AI-powered design platform.
            </motion.p>
            <motion.div 
              className="flex gap-4 flex-col sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link href="/create" passHref>
                <Button size="lg" className="gap-2 cta-button">
                  <Zap className="w-4 h-4" />
                  Create Your Logo
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="gap-2">
                  <ArrowDown className="w-4 h-4" />
                  See How It Works
                </Button>
              </a>
            </motion.div>
            
            <motion.div 
              className="mt-16 relative w-full max-w-4xl aspect-video bg-card rounded-lg shadow-xl overflow-hidden border"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="font-medium">   <Image
              src="/logogenius-screenshot.png"
              alt="LogoGenius Screenshot"
              layout="fill"
              objectFit="contain"
            /></p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">Features</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Powerful Features for Perfect Logos
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform combines cutting-edge AI with intuitive design tools to help you create the perfect logo for your brand.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-primary/10 hover:shadow-md transition-shadow feature-card">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">AI-Powered Generation</h3>
                    <p className="text-muted-foreground">
                      Leverages cutting-edge AI to transform your brand vision into multiple logo concepts.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/10 hover:shadow-md transition-shadow feature-card">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <Palette className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Customizable Styles</h3>
                    <p className="text-muted-foreground">
                      Control every aspect from color palettes to typography with our intuitive interface.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/10 hover:shadow-md transition-shadow feature-card">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <BrainCircuit className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Intelligent Refinement</h3>
                    <p className="text-muted-foreground">
                      AI learns from your feedback to improve logo concepts with each iteration.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/10 hover:shadow-md transition-shadow feature-card">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <Layers className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Complete Brand Package</h3>
                    <p className="text-muted-foreground">
                      Generate not just logos, but comprehensive brand identity guides with typography and color recommendations.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/10 hover:shadow-md transition-shadow feature-card">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Professional Quality</h3>
                    <p className="text-muted-foreground">
                      Get studio-quality logos that are ready for print, digital use, and merchandise.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/10 hover:shadow-md transition-shadow feature-card">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <RefreshCw className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Unlimited Iterations</h3>
                    <p className="text-muted-foreground">
                      Refine and regenerate until you find the perfect logo for your brand with no limitations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Logo Showcase Section */}
        <section id="showcase" className="py-12 md:py-20 bg-muted/30">
          <LogoShowcase />
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">Process</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-center text-muted-foreground mb-4 max-w-2xl mx-auto">
                Create professional logo designs in minutes with our simple four-step process
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center how-it-works-card">
                <div className="bg-primary/10 p-4 rounded-full mb-4 relative">
                  <PenTool className="h-8 w-8 text-primary" />
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                </div>
                <h3 className="text-lg font-bold mb-2">Define Your Brand</h3>
                <p className="text-muted-foreground">
                  Enter your business details and describe your vision for the perfect logo.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center how-it-works-card">
                <div className="bg-primary/10 p-4 rounded-full mb-4 relative">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                </div>
                <h3 className="text-lg font-bold mb-2">AI Generation</h3>
                <p className="text-muted-foreground">
                  Our AI creates multiple logo concepts based on your requirements.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center how-it-works-card">
                <div className="bg-primary/10 p-4 rounded-full mb-4 relative">
                  <MousePointer className="h-8 w-8 text-primary" />
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                </div>
                <h3 className="text-lg font-bold mb-2">Select & Refine</h3>
                <p className="text-muted-foreground">
                  Choose your favorite design and provide feedback for refinements.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center how-it-works-card">
                <div className="bg-primary/10 p-4 rounded-full mb-4 relative">
                  <Laptop className="h-8 w-8 text-primary" />
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                </div>
                <h3 className="text-lg font-bold mb-2">Complete Brand Package</h3>
                <p className="text-muted-foreground">
                  Download your logo and receive a complete brand identity guide.
                </p>
              </div>
            </div>

            <div className="mt-16 md:mt-20 text-center">
              <Link href="/create" passHref>
                <Button size="lg" className="gap-2 cta-button">
                  <Lightbulb className="w-5 h-5" />
                  Start Your Logo Design Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">Testimonials</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Our Customers Say
              </h2>
            </div>
            
            <TestimonialCarousel />
          </div>
        </section>

        {/* Special Features Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">Beyond Logos</span>
                <h2 className="text-3xl font-bold mb-6">Beyond Just Logos</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full shrink-0 mt-1">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Complete Brand Identity</h3>
                      <p className="text-muted-foreground">
                        Get a comprehensive brand archetype analysis, color palette recommendations, 
                        and brand voice guidelines alongside your logo.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full shrink-0 mt-1">
                      <Hexagon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Web3 Ready</h3>
                      <p className="text-muted-foreground">
                        Special options for blockchain projects, including token symbol ideas, 
                        ENS domain suggestions, and NFT-ready aesthetics.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full shrink-0 mt-1">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Brand Analytics</h3>
                      <p className="text-muted-foreground">
                        Get insights on how your brand positioning compares to competitors and 
                        recommendations for differentiating your visual identity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded-xl p-6 border border-border/50 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-50"></div>
                
                <div className="mb-6 relative z-10">
                  <p className="text-sm text-muted-foreground mb-1">Featured Testimonial</p>
                  <div className="flex items-start gap-2">
                    <div className="bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center text-primary font-bold">JD</div>
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-muted-foreground">Founder, TechStartup</p>
                    </div>
                  </div>
                </div>
                <p className="italic relative z-10">
                  "LogoGenius saved us thousands in design costs. Within minutes, we had a professional logo
                  that perfectly captured our brand identity. The additional brand guidelines were invaluable."
                </p>
                
                <div className="mt-6 flex justify-end">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-background flex items-center justify-center text-xs text-white">AK</div>
                    <div className="w-8 h-8 rounded-full bg-emerald-400 border-2 border-background flex items-center justify-center text-xs text-white">MR</div>
                    <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-background flex items-center justify-center text-xs text-white">SL</div>
                    <div className="w-8 h-8 rounded-full bg-rose-400 border-2 border-background flex items-center justify-center text-xs text-white">+5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRTMJL4IEzMsNGMtMi4yMSAwLTQgMS43OS00IDRzMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Create Your Perfect Logo?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses who have transformed their brand identity with LogoGenius.
            </p>
            <Link href="/create" passHref>
              <Button size="lg" variant="secondary" className="gap-2 text-primary cta-button">
                <Zap className="w-4 h-4" />
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="relative w-8 h-8">
                <Image
                  src="/logogenius-logo.png"
                  alt="LogoGenius Logo"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <span className="text-lg font-semibold text-primary">LogoGenius</span>
            </div>
            
            <div className="flex gap-8 mb-4 md:mb-0">
              <Link href="/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Create Logo</Link>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#showcase" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Showcase</a>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} LogoGenius. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                AI-powered logo generation for modern brands | Pretty-fied by bolt.new
              </p>
            </div>
          </div>
        </div>
      </footer>
      
      <ScrollToTopButton />
    </div>
  );
}