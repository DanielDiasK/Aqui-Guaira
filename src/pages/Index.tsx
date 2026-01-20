import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SearchSection from "@/components/SearchSection";
import MapSearch from "@/components/MapSearch";
import CategoriesSection from "@/components/CategoriesSection";
import RecentLocations from "@/components/RecentLocations";
import ActionCards from "@/components/ActionCards";
import QuickStats from "@/components/QuickStats";
import CityOverviewCard from "@/components/CityOverviewCard";
import OfficialLinks from "@/components/OfficialLinks";
import { useEffect } from "react";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    if (window.location.hash === "#sobre-guaira") {
      const el = document.getElementById("sobre-guaira");
      if (el) {
        const target = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: target, behavior: "smooth" });
        el.classList.add("anchor-highlight");
        const timeout = setTimeout(() => {
          el.classList.remove("anchor-highlight");
        }, 2500);
        return () => clearTimeout(timeout);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <SearchSection />
        <MapSearch />
      
      <div className="container mx-auto px-4 py-16 space-y-12">
        {/* Categories and Recent Locations */}
        <div className="grid lg:grid-cols-2 gap-8">
          <CategoriesSection />
          <RecentLocations />
        </div>

        {/* City Overview full width */}
        <CityOverviewCard />

        {/* Quick Stats and Official Links */}
        <div className="grid lg:grid-cols-2 gap-8">
          <QuickStats />
          <OfficialLinks />
        </div>

        {/* Action Cards */}
        <ActionCards />
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
