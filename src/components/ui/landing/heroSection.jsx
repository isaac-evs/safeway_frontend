'use client'

import { HiLocationMarker } from 'react-icons/hi';
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { useTheme } from '../../../contexts/ThemeContext';

export default function HeroSection() {
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const searchRef = useRef(null);
  const router = useRouter();
  
  // Mapbox access token - you should store this in an environment variable
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Function to fetch location suggestions from Mapbox API
  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
        {
          params: {
            access_token: MAPBOX_TOKEN,
            autocomplete: true,
            types: 'place,address,poi',
            limit: 5
          }
        }
      );
      
      if (response.data && response.data.features) {
        setSuggestions(response.data.features);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput) {
        fetchSuggestions(searchInput);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to navigate to dashboard with coordinates
  const navigateToDashboard = (lng, lat) => {
    router.push(`/dashboard?lng=${lng}&lat=${lat}&zoom=16`);
  };

  // Function to handle location selection
  const handleSelectLocation = (location) => {
    setSearchInput(location.place_name || location.text);
    setShowSuggestions(false);
    
    // Extract coordinates and navigate to dashboard
    const coordinates = location.geometry.coordinates; // [longitude, latitude]
    navigateToDashboard(coordinates[0], coordinates[1]);
  };

  // Handle search submission (via Enter key)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (suggestions.length > 0) {
        handleSelectLocation(suggestions[0]);
      }
    }
  };

  // Handle search button click
  const handleSearchButtonClick = () => {
    if (suggestions.length > 0) {
      handleSelectLocation(suggestions[0]);
    } else if (searchInput.trim()) {
      fetchSuggestions(searchInput).then(() => {
        if (suggestions.length > 0) {
          handleSelectLocation(suggestions[0]);
        }
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50">
      {/* Background city image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg.jpg"
          alt="City skyline backdrop"
          fill
          style={{ objectFit: "cover" }}
          quality={90}
          priority
        />
        <div className={`absolute inset-0 ${darkMode ? 'bg-black/60' : 'bg-white/60'}`} />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex min-h-[90vh] md:min-h-screen flex-col">
        {/* Main Content */}
        <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 py-12 mt-16 md:mt-0">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="w-full max-w-[90vw] md:max-w-4xl mx-auto flex flex-col items-center"
          >
            <motion.h2 
              variants={fadeIn} 
              className="mb-6 md:mb-10 text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-black tracking-tight text-center"
            >
              What's your <span className="font-bold">destination</span>?
            </motion.h2>

            <motion.div 
              variants={fadeIn}
              className="relative w-full max-w-xl sm:max-w-2xl"
              ref={searchRef}
            >
              {/* Search Input */}
              <div className="relative flex items-center rounded-full border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="absolute left-5 text-gray-400">
                  <HiLocationMarker className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <input
                  type="text"
                  placeholder="Type a location"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => searchInput && suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full rounded-full pl-14 sm:pl-16 pr-14 py-3 sm:py-4 text-base sm:text-lg text-gray-800 placeholder-gray-400 outline-none"
                />
                <div className="absolute right-3 flex">
                  <button 
                    onClick={handleSearchButtonClick}
                    className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Location Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute mt-2 w-full rounded-lg bg-white shadow-lg z-50 overflow-hidden border border-gray-100">
                  <ul className="py-1">
                    {suggestions.map((suggestion) => (
                      <li 
                        key={suggestion.id}
                        onClick={() => handleSelectLocation(suggestion)}
                        className="px-4 py-3 hover:bg-gray-50 flex items-start cursor-pointer transition-colors"
                      >
                        <div className="flex-shrink-0 mr-3 mt-1">
                          <HiLocationMarker className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-800 font-medium">
                            {suggestion.text}
                          </span>
                          <span className="text-sm text-gray-500 truncate">
                            {suggestion.place_name}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Loading indicator */}
              {loading && (
                <div className="absolute right-20 top-4">
                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full border-t-blue-500 animate-spin"></div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}