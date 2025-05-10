'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HiLocationMarker } from 'react-icons/hi'
import { FaSearch } from 'react-icons/fa'
import { MdLightMode, MdDarkMode } from 'react-icons/md'
import { BsList, BsChevronDown } from 'react-icons/bs'
import { TbChartBar, TbShield, TbBuildingSkyscraper, TbAlertTriangle } from 'react-icons/tb'
import { IoMdPerson } from 'react-icons/io'
import axios from 'axios'

interface DashboardHeaderProps {
  onFilterChange: (filter: string) => void
  activeFilter: string
  onLocationSelect: (coordinates: [number, number]) => void
  darkMode: boolean
  toggleDarkMode: () => void
}

export default function DashboardHeader({ 
  onFilterChange, 
  activeFilter, 
  onLocationSelect,
  darkMode,
  toggleDarkMode
}: DashboardHeaderProps) {
  const [searchInput, setSearchInput] = useState<string>("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const filterMenuRef = useRef<HTMLDivElement>(null)
  
  // Mapbox access token - you should store this in an environment variable
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "your_mapbox_token"

  const filterOptions = [
    { 
      id: 'all', 
      label: 'All', 
      icon: (
        <TbChartBar className="h-5 w-5" />
      ),
      ariaLabel: 'All incidents',
      color: 'bg-gray-800'
    },
    { 
      id: 'crime', 
      label: 'Crime', 
      icon: (
        <TbShield className="h-5 w-5" />
      ), 
      ariaLabel: 'Crime incidents',
      color: 'bg-red-600'
    },
    { 
      id: 'infrastructure', 
      label: 'Infrastructure', 
      icon: (
        <TbBuildingSkyscraper className="h-5 w-5" />
      ), 
      ariaLabel: 'Infrastructure issues',
      color: 'bg-blue-600'
    },
    { 
      id: 'hazard', 
      label: 'Hazard', 
      icon: (
        <TbAlertTriangle className="h-5 w-5" />
      ), 
      ariaLabel: 'Hazard warnings',
      color: 'bg-amber-500'
    },
    { 
      id: 'social', 
      label: 'Social', 
      icon: (
        <IoMdPerson className="h-5 w-5" />
      ), 
      ariaLabel: 'Social events',
      color: 'bg-green-600'
    }
  ]

  // Function to fetch location suggestions from Mapbox API
  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    setLoading(true)
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
      )
      
      if (response.data && response.data.features) {
        setSuggestions(response.data.features)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput) {
        fetchSuggestions(searchInput)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  // Handle click outside to close suggestions and filter menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
      
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Function to handle location selection
  const handleSelectLocation = (location: any) => {
    // First close suggestions
    setShowSuggestions(false);
    
    // Then set search input and trigger location change
    setSearchInput(location.place_name);
    
    // Extract coordinates
    const coordinates = location.geometry.coordinates;
    onLocationSelect([coordinates[0], coordinates[1]]);
  }

  // Handle search submission (via Enter key)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (suggestions.length > 0) {
        handleSelectLocation(suggestions[0])
      }
    }
  }
  
  // Handle filter selection from dropdown
  const handleFilterSelect = (filterId: string) => {
    setShowFilterMenu(false);
    onFilterChange(filterId);
  }
  
  // Get current active filter
  const getActiveFilter = () => {
    return filterOptions.find(f => f.id === activeFilter) || filterOptions[0];
  }

  return (
    <header className={`${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'} shadow-sm py-3 md:py-4 px-3 md:px-6 border-b`}>
      <div className="max-w-full mx-auto flex items-center justify-between">
        {/* Logo and site name */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center">
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
          </Link>
        </div>

        {/* Search bar - moved to center and made larger */}
        <div className="w-1/2 max-w-2xl relative mx-2 md:mx-4 flex-grow" ref={searchRef}>
          <div className={`relative flex items-center rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'} shadow-sm`}>
            <input
              type="text"
              placeholder="Search location"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => searchInput && suggestions.length > 0 && setShowSuggestions(true)}
              className={`w-full rounded-lg pl-3 md:pl-4 pr-8 md:pr-10 py-2 md:py-3 text-sm lg:text-base ${darkMode ? 'text-white placeholder-gray-400 bg-gray-700' : 'text-gray-800 placeholder-gray-500 bg-transparent'} outline-none`}
            />
            <button 
              className={`absolute right-2 md:right-3 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
              onClick={() => {
                if (searchInput) {
                  fetchSuggestions(searchInput);
                  if (suggestions.length > 0) {
                    handleSelectLocation(suggestions[0]);
                  }
                }
              }}
            >
              <FaSearch className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            {loading && (
              <div className="absolute right-8 md:right-12">
                <div className={`h-4 w-4 md:h-5 md:w-5 border-2 ${darkMode ? 'border-gray-600 border-t-blue-400' : 'border-gray-300 border-t-blue-500'} rounded-full animate-spin`}></div>
              </div>
            )}
          </div>
          
          {/* Location Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute mt-1 w-full rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'} shadow-lg z-50 overflow-hidden border`}>
              <ul className="py-1">
                {suggestions.map((suggestion) => (
                  <li 
                    key={suggestion.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectLocation(suggestion);
                    }}
                    className={`px-4 py-2 ${darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-50 text-gray-800'} flex items-start cursor-pointer transition-colors`}
                  >
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <HiLocationMarker className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {suggestion.text}
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                        {suggestion.place_name}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Filter buttons for larger screens */}
        <div className="hidden md:flex items-center space-x-2 shrink-0">
          {filterOptions.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              aria-label={filter.ariaLabel}
              className={`flex items-center rounded-lg px-3 py-2 ${
                activeFilter === filter.id 
                  ? `${filter.color} text-white` 
                  : darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors focus:outline-none text-sm font-medium`}
            >
              <span className="mr-1.5">{filter.icon}</span>
              <span className="hidden xl:inline">{filter.label}</span>
            </button>
          ))}
        </div>
        
        {/* Filter dropdown for mobile */}
        <div className="md:hidden relative shrink-0" ref={filterMenuRef}>
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`flex items-center space-x-1 rounded-lg px-2 py-2 ${
              darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            } transition-colors`}
            aria-label="Filter options"
          >
            <span>{getActiveFilter().icon}</span>
            <BsChevronDown className="h-3 w-3" />
          </button>
          
          {showFilterMenu && (
            <div className={`absolute right-0 mt-1 w-48 rounded-md shadow-lg z-50 overflow-hidden ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'
            } border`}>
              <div className="py-1">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterSelect(filter.id)}
                    className={`flex items-center w-full px-4 py-2 text-left ${
                      activeFilter === filter.id
                        ? `${darkMode ? 'bg-gray-600' : 'bg-gray-100'} font-medium`
                        : darkMode
                          ? 'text-gray-200 hover:bg-gray-600'
                          : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`mr-3 rounded-full p-1 ${
                      filter.id === 'all' ? 'bg-gray-800' :
                      filter.id === 'crime' ? 'bg-red-600' :
                      filter.id === 'infrastructure' ? 'bg-blue-600' :
                      filter.id === 'hazard' ? 'bg-amber-500' :
                      'bg-green-600'
                    } text-white`}>
                      {filter.icon}
                    </span>
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark mode toggle - larger */}
        <button
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          className={`p-2 md:p-3 ml-2 rounded-full ${
            darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {darkMode ? <MdLightMode size={20} className="md:w-6 md:h-6" /> : <MdDarkMode size={20} className="md:w-6 md:h-6" />}
        </button>
      </div>
    </header>
  )
} 