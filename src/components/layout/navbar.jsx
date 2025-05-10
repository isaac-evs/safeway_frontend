'use client'

import Image from "next/image";
import Link from "next/link";
import { HiLocationMarker } from 'react-icons/hi';
import { MdLightMode, MdDarkMode } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../contexts/ThemeContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Check if user is logged in
    const authToken = localStorage.getItem('authToken');
    setIsLoggedIn(!!authToken);
    
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Listen for storage events to detect login/logout in other tabs
  useEffect(() => {
    const checkLoginStatus = () => {
      const authToken = localStorage.getItem('authToken');
      setIsLoggedIn(!!authToken);
    };

    // This event listener ensures the Navbar updates if localStorage changes in another tab
    window.addEventListener('storage', checkLoginStatus);

    // Initial check
    checkLoginStatus();

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    router.push('/');
  };

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-between p-6 lg:px-12 bg-white shadow-sm">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center">
              <div className="h-8 w-8 relative mr-2 overflow-visible">
                <Image 
                  src={darkMode ? "/dark-logo.png" : "/normal-logo.png"}
                  alt="SafeWay Logo" 
                  layout="fill"
                  objectFit="contain"
                  className="rounded-full"
                  style={{ transform: 'scale(4)', transformOrigin: 'center' }}
                />
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:inline-block">SafeWay</h1>
            </div>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-between p-6 lg:px-12 transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-800 text-white' 
        : scrolled ? 'bg-white shadow-sm' : 'bg-transparent'
    }`}>
      <div className="flex items-center shrink-0">
        <Link href="/">
          <div className="flex items-center">
            <div className="h-8 w-8 relative mr-2 overflow-visible md:h-10 md:w-10 lg:h-12 lg:w-12">
              <Image 
                src={darkMode ? "/dark-logo.png" : "/normal-logo.png"} 
                alt="SafeWay Logo" 
                layout="fill"
                objectFit="contain"
                className="rounded-full"
                style={{ transform: 'scale(4)', transformOrigin: 'center' }}
              />
            </div>
            <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} lg:text-2xl md:text-xl hidden sm:inline-block`}>
              SafeWay
            </span>
          </div>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center space-x-8">
        <Link href="/#features" className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Features</Link>
        <Link href="/#how-it-works" className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>How it Works</Link>
        <Link href="/#safety-map" className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Safety Map</Link>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Botón de cambio de tema */}
        <button
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          className={`p-2 rounded-full transition-colors z-10 ${
            darkMode 
              ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {darkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>
        
        {/* Conditional rendering based on login status */}
        {isLoggedIn ? (
          <>
            <Link 
              href="/dashboard"
              className={`rounded-full px-4 py-2 sm:px-6 md:px-8 md:py-3 text-sm sm:text-base transition-all duration-300 font-medium ${
                darkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : scrolled ? 'bg-gray-50 hover:bg-gray-100 text-gray-900' : 'bg-white/90 hover:bg-white text-gray-900'
              }`}
            >
              Dashboard
            </Link>
            <button 
              onClick={handleLogout}
              className={`rounded-full px-4 py-2 sm:px-6 md:px-8 md:py-3 text-sm sm:text-base transition-all duration-300 font-medium ${
                darkMode 
                  ? 'bg-gray-600 text-white hover:bg-gray-500' 
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link 
              href="/login"
              className={`rounded-full px-4 py-2 sm:px-6 md:px-8 md:py-3 text-sm sm:text-base transition-all duration-300 font-medium ${
                darkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : scrolled ? 'bg-gray-50 hover:bg-gray-100 text-gray-900' : 'bg-white/90 hover:bg-white text-gray-900'
              }`}
            >
              Log In
            </Link>
            <Link 
              href="/signup"
              className={`rounded-full px-4 py-2 sm:px-6 md:px-8 md:py-3 text-sm sm:text-base transition-all duration-300 font-medium ${
                darkMode 
                  ? 'bg-gray-600 text-white hover:bg-gray-500' 
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}