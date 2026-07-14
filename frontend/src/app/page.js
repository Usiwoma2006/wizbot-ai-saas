import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import TrustedCompanies from "@/components/landing/TrustedCompanies";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks"
import Product from "@/components/landing/Product";
import WhyWizAI from "@/components/landing/WhyWizAi";
import Price from "@/components/landing/Price";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ"
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer"

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustedCompanies />
      <Features />
      <HowItWorks />
      <Product />
      <WhyWizAI />
      <Price />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}