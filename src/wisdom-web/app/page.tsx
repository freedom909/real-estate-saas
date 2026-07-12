

import Hero from "./components/Hero";
import SearchBar from "./components/SearchBar";
import ListingCard from "./components/ListingCard";
import CategorySection from "./components/CategorySection";
import AIBanner from "./components/AIBanner";
import Footer from "./components/Footer";
import Navbar from "./components/navbar";

export default function Home() {
  return (
    <>
    <Navbar />
<Hero />
     <ListingCard title={""} address={""} price={0} />
      <CategorySection />
      <AIBanner />
       <Footer />
     {/* <FloatingChat /> */}
    </>
  );
}
