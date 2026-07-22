"use client";

import { useState } from "react";
import Hero from "./components/Hero";
import SearchBar from "./components/SearchBar";
import ChatWindow from "./components/ChatWindow";
import FeaturedListings from "./components/FeaturedListings";
import CategorySection from "./components/CategorySection";
import AIBanner from "./components/AIBanner";
import Footer from "./components/Footer";
import Navbar from "./components/navbar";

type SearchResult = {
  success: boolean;
  summary: string | null;
  artifacts: { type: string; content: any }[];
};

export default function Home() {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  return (
    <>
      <Navbar />
      <Hero onSearchResults={setSearchResult} />
      <ChatWindow result={searchResult} />
      <FeaturedListings />
      <CategorySection />
      <AIBanner />
      <Footer />
    </>
  );
}
