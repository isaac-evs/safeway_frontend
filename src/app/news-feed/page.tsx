'use client'

import { useState, useEffect } from 'react'
import { TbShield, TbBuildingSkyscraper, TbAlertTriangle, TbExternalLink } from 'react-icons/tb'
import { IoMdPerson } from 'react-icons/io'

// Type definitions
interface NewsItem {
    id: number;
    title: string;
    description: string;
    coordinates: [number, number]; // [longitude, latitude]
    type: 'crime' | 'infrastructure' | 'hazard' | 'social'; // Updated types
    date: string;
    url?: string; // Optional URL for the news source
  }

export default function NewsFeed() {
  const [searchTerm, setSearchTerm] = useState('')
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Load news (mocked for now)
  useEffect(() => {
    // TODO: Replace with real API call
    const mockNews: NewsItem[] = [
        {
          id: 1,
          title: "Car Theft Report",
          description: "Vehicle theft reported in Chapultepec neighborhood parking lot.",
          coordinates: [-103.3814, 20.6721],
          type: "crime",
          date: "2023-05-15",
          // No url means it's a user report
        },
        {
          id: 2,
          title: "Community Festival",
          description: "Annual cultural gathering at Plaza Guadalajara downtown area.",
          coordinates: [-103.3464, 20.6764],
          type: "social",
          date: "2023-05-16",
          url: "https://guadalajara.gob.mx/events/festival-2023"
        },
        {
          id: 3,
          title: "Road Construction",
          description: "Lane closures on Avenida Patria due to infrastructure improvements.",
          coordinates: [-103.4028, 20.7096],
          type: "infrastructure",
          date: "2023-05-17",
          url: "https://obras-publicas.jalisco.gob.mx/projects/patria-2023"
        },
        {
          id: 4,
          title: "Fire Alert",
          description: "Building fire reported in Zapopan, emergency services on scene.",
          coordinates: [-103.4067, 20.7264],
          type: "hazard",
          date: "2023-05-18",
          // No url means it's a user report
        },
        {
          id: 5,
          title: "Armed Robbery",
          description: "Armed robbery at convenience store in Tlaquepaque, suspect fled.",
          coordinates: [-103.3114, 20.6401],
          type: "crime",
          date: "2023-05-19",
          url: "https://jalisco.fiscalia.gob.mx/reports/tlq-052023"
        },
        {
          id: 6,
          title: "Flash Flood Warning",
          description: "Heavy rain causing potential flash floods in Providencia area.",
          coordinates: [-103.3694, 20.6971],
          type: "hazard",
          date: "2023-05-20",
          url: "https://conagua.gob.mx/alerts/jalisco-052023"
        },
        {
          id: 7,
          title: "Charity Fundraiser",
          description: "Local charity event at Parque Metropolitano.",
          coordinates: [-103.4126, 20.6912],
          type: "social",
          date: "2023-05-21",
          // No url means it's a user report
        },
        {
          id: 8,
          title: "Bridge Maintenance",
          description: "Bridge maintenance work on Periférico causing delays.",
          coordinates: [-103.3290, 20.6590],
          type: "infrastructure",
          date: "2023-05-22",
          url: "https://sct.gob.mx/jalisco/maintenance/periferico-may2023"
        },
    ];
    
    setTimeout(() => {
      setNewsItems(mockNews)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter news by search and category
  const filteredNews = newsItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      !selectedCategory || 
      (selectedCategory === 'social' && item.type === 'social') ||
      (selectedCategory === 'hazard' && item.type === 'hazard') ||
      (selectedCategory === 'crime' && item.type === 'crime') ||
      (selectedCategory === 'infrastructure' && item.type === 'infrastructure');
    
    return matchesSearch && matchesCategory;
  });

  // Handle category click
  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get icon based on news type
  const getNewsIcon = (type: string) => {
    switch (type) {
      case 'crime':
        return <TbShield className="h-5 w-5" />
      case 'infrastructure':
        return <TbBuildingSkyscraper className="h-5 w-5" />
      case 'hazard':
        return <TbAlertTriangle className="h-5 w-5" />
      case 'social':
        return <IoMdPerson className="h-5 w-5" />
      default:
        return null
    }
  }

  // Get background color based on news type
  const getNewsBackgroundColor = (type: string): string => {
    const colors: Record<string, string> = {
      crime: 'bg-red-600/20',
      infrastructure: 'bg-blue-600/20',
      hazard: 'bg-amber-500/20',
      social: 'bg-green-600/20'
    }
    
    return colors[type] || 'bg-gray-50';
  }

  // Get category specific colors
  const getCategoryColor = (type: string, isSelected: boolean): string => {
    if (!isSelected) return 'bg-white hover:bg-gray-50';
    
    const colors: Record<string, string> = {
      crime: 'bg-red-600 text-white',
      infrastructure: 'bg-blue-600 text-white',
      hazard: 'bg-amber-500 text-white',
      social: 'bg-green-600 text-white'
    }
    
    return colors[type] || 'bg-gray-100';
  }

  // Categories with their corresponding types (reordered)
  const categories = [
    { name: 'Crime', type: 'crime', icon: <TbShield className="h-5 w-5 mx-auto mb-1" /> },
    { name: 'Infrastructure', type: 'infrastructure', icon: <TbBuildingSkyscraper className="h-5 w-5 mx-auto mb-1" /> },
    { name: 'Hazard', type: 'hazard', icon: <TbAlertTriangle className="h-5 w-5 mx-auto mb-1" /> },
    { name: 'Social', type: 'social', icon: <IoMdPerson className="h-5 w-5 mx-auto mb-1" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-28">
      <main className="container mx-auto px-4 py-6 ">
        {/* Search bar */}
        <div className="mb-6">
          <div className="flex items-center w-full max-w-lg mx-auto p-2 rounded-full bg-white border-gray-200 border shadow-sm">
            <input
              type="text"
              placeholder="Search news..."
              className="w-full pl-3 pr-10 py-2 rounded-full focus:outline-none bg-white text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="mr-1 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <svg className="w-5 h-5 text-gray-500 -ml-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className={`p-3 sm:p-5 rounded-md shadow-sm text-center transition-colors cursor-pointer
                ${getCategoryColor(category.type, selectedCategory === category.type)}
              `}
              onClick={() => handleCategoryClick(category.type)}
            >
              {category.icon}
              <span className="font-medium text-sm sm:text-base">{category.name}</span>
            </div>
          ))}
        </div>

        {selectedCategory && (
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Filtering by: <span className="font-medium">{categories.find(c => c.type === selectedCategory)?.name}</span>
            </div>
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* News list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-10">
              <div className="h-8 w-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredNews.length > 0 ? (
            filteredNews.map((item) => (
              <div 
                key={item.id} 
                className={`rounded-lg shadow-sm overflow-hidden ${getNewsBackgroundColor(item.type)}`}
              >
                <div className="p-4">
                  <h3 className="font-bold text-base mb-1.5">{item.title}</h3>
                  <p className="text-sm mb-3 text-gray-600">
                    {item.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {formatDate(item.date)}
                    </span>
                    <div className="flex items-center">
                      {item.url && (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <TbExternalLink className="h-4 w-4 text-blue-600" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-lg text-gray-500">
                No results found for "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 