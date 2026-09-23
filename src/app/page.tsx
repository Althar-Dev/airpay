'use client';

import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { FirebaseClientProvider } from "@/firebase";

/**
 * LandingPage - Main page for AirPay with Neo-Brutalism UI
 * Optimized for 100% Mobile & Desktop responsiveness.
 */
export default function LandingPage() {
  return (
    <FirebaseClientProvider>
      <div className="bg-[#FFFDF5] dark:bg-[#0c0c0e] text-black dark:text-zinc-100 selection:bg-neo-yellow flex flex-col min-h-screen font-body w-full overflow-x-hidden transition-colors">
        <Navbar />
        <main className="flex-grow w-full overflow-x-hidden flex flex-col items-center">
          <Hero />
          <Features />
          <Pricing />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
    </FirebaseClientProvider>
  );
}
