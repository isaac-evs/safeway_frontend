'use client'

import { useState, ReactNode, useEffect, useCallback } from 'react'
import { IoMdPerson } from 'react-icons/io'
import { TbAlertCircle, TbBuildingSkyscraper, TbAlertTriangle, TbShield, TbChartBar, TbExternalLink, TbUser } from 'react-icons/tb'
import mapboxgl from 'mapbox-gl'
import { BsList, BsX, BsChevronLeft, BsChevronRight } from 'react-icons/bs'
import { NewsItem } from '@/types'

interface NewsPanelProps {
  news: NewsItem[];
  loading: boolean;
  darkMode: boolean;
  mapRef?: React.MutableRefObject<mapboxgl.Map | null>;
}

// Function to get icon based on news type
const getNewsIcon = (type: string): ReactNode => {
  const icons: Record<string, ReactNode> = {
    crime: <TbShield className="h-5 w-5" />,
    infrastructure: <TbBuildingSkyscraper className="h-5 w-5" />,
    hazard: <TbAlertTriangle className="h-5 w-5" />,
    social: <IoMdPerson className="h-5 w-5" />
  }
  
  return icons[type] || <TbAlertCircle className="h-5 w-5" />
}

// Function to get color based on news type
const getNewsColor = (type: string): string => {
  const colors: Record<string, string> = {
    crime: 'bg-red-600 text-white',
    infrastructure: 'bg-blue-600 text-white',
    hazard: 'bg-amber-500 text-white',
    social: 'bg-green-600 text-white'
  }
  
  return colors[type] || 'bg-gray-500 text-white'
}

// Format date to readable format
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Calculate time ago string
const timeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hr ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
}

// Function to check if marker is covered by sidebar
const isMarkerCoveredBySidebar = (coordinates: [number, number], map: mapboxgl.Map, isCollapsed: boolean, sidebarWidthPercent: number): boolean => {
  if (isCollapsed) return false; // If sidebar is collapsed, markers are not covered
  
  try {
    // Convert geographic coordinates to pixel coordinates
    const point = map.project(coordinates);
    
    // Get the width of the viewport
    const viewportWidth = map.getContainer().offsetWidth;
    
    // Calculate sidebar width in pixels based on percentage
    const sidebarWidth = (viewportWidth * sidebarWidthPercent) / 100;
    
    // Check if the point is within the sidebar area (left side of the screen)
    return point.x < sidebarWidth;
  } catch (err) {
    console.error('Error checking if marker is covered by sidebar:', err);
    return false;
  }
}

// Function to open the news source URL in a new tab
const openNewsUrl = (e: React.MouseEvent, url?: string) => {
  e.stopPropagation(); // Prevent toggle expand when clicking the button
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

export default function NewsPanel({ news, loading, darkMode, mapRef }: NewsPanelProps) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [visibleNews, setVisibleNews] = useState<NewsItem[]>(news)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showLegendModal, setShowLegendModal] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState<number>(35);
  
  // Update sidebar width based on screen size
  useEffect(() => {
    const updateSidebarWidth = () => {
      // Responsive width: wider on mobile, narrower on larger screens
      if (window.innerWidth < 640) { // Small mobile
        setSidebarWidth(30);
      } else if (window.innerWidth < 768) { // Mobile
        setSidebarWidth(30);
      } else if (window.innerWidth < 1024) { // Tablet
        setSidebarWidth(30);
      } else if (window.innerWidth < 1280) { // Small desktop
        setSidebarWidth(30);
      } else if (window.innerWidth < 1536) { // Desktop
        setSidebarWidth(30);
      } else { // Large desktop
        setSidebarWidth(20);
      }
    };
    
    // Set initial width
    updateSidebarWidth();
    
    // Update width on resize
    window.addEventListener('resize', updateSidebarWidth);
    return () => window.removeEventListener('resize', updateSidebarWidth);
  }, []);
  
  // Calculate sidebar width in pixels for use in calculations
  const getSidebarPixelWidth = useCallback((): number => {
    if (typeof window !== 'undefined') {
      return (window.innerWidth * sidebarWidth) / 100;
    }
    return 450; // Fallback default
  }, [sidebarWidth]);
  
  // Function to update visible news based on map bounds
  const updateVisibleNews = useCallback(() => {
    // Si no hay referencia al mapa o no hay noticias, no hay nada que filtrar
    if (!mapRef?.current || !news || news.length === 0) {
      setVisibleNews([]);
      return;
    }

    try {
      const map = mapRef.current;
      
      // Si el mapa no está cargado, no hay nada que filtrar
      if (!map.loaded()) {
        setVisibleNews([]);
        return;
      }
      
      const bounds = map.getBounds();
      // Si no hay bounds, no hay nada que filtrar
      if (!bounds) {
        setVisibleNews([]);
        return;
      }
      
      // Filtrar las noticias que están dentro de los límites del mapa y no cubiertas por la barra lateral
      const filteredNews = news.filter(item => {
        try {
          // Procesar coordenadas si son string o array
          let coords: [number, number];
          if (typeof item.coordinates === 'string') {
            const coordString = (item.coordinates as string).replace(/POINT\s*\(/, '').replace(/\)/, '');
            const [lng, lat] = coordString.split(/\s+/).map(Number);
            coords = [lng, lat];
          } else {
            coords = item.coordinates as [number, number];
          }
          
          // Verificar si está dentro de los límites y no cubierto por la barra lateral
          return bounds.contains({ lng: coords[0], lat: coords[1] }) && 
            !isMarkerCoveredBySidebar(coords, map, isCollapsed, sidebarWidth);
        } catch (error) {
          return false; // Excluir si no podemos determinar la visibilidad
        }
      });
      
      // Actualizar el estado con las noticias filtradas
      setVisibleNews(filteredNews);
    } catch (error) {
      setVisibleNews([]);
    }
  }, [news, mapRef, isCollapsed, sidebarWidth]);

  // Update visible news when the component mounts and when news or mapRef changes
  useEffect(() => {
    // Initially show empty array
    setVisibleNews([]);
    
    // No map reference yet, just show no news
    if (!mapRef?.current) {
      setVisibleNews([]);
      return;
    }
    
    const map = mapRef.current;
    
    // Update visible news immediately
    updateVisibleNews();
    
    // Add event listeners for map movements - these are the critical events that should trigger updates
    const events = ['moveend', 'zoomend', 'load', 'idle', 'style.load', 'dragend', 'touchend'];
    
    // Remove existing listeners before adding new ones
    events.forEach(event => {
      map.off(event, updateVisibleNews);
      map.on(event, updateVisibleNews);
    });
    
    // Force an update after a short delay to ensure the map is fully loaded
    const initialUpdateTimer = setTimeout(() => {
      updateVisibleNews();
    }, 300);
    
    // Additional forced update after a longer delay
    const secondUpdateTimer = setTimeout(() => {
      updateVisibleNews();
    }, 1000);
    
    // Clean up
    return () => {
      clearTimeout(initialUpdateTimer);
      clearTimeout(secondUpdateTimer);
      
      if (map) {
        events.forEach(event => {
          map.off(event, updateVisibleNews);
        });
      }
    };
  }, [updateVisibleNews, mapRef, news]);
  
  // Update visible news when sidebar collapse state changes
  useEffect(() => {
    if (mapRef?.current) {
      updateVisibleNews();
    }
  }, [isCollapsed, updateVisibleNews]);
  
  // Toggle expanded state for a news item
  const toggleExpand = (id: number) => {
    if (expanded === id) {
      setExpanded(null)
    } else {
      setExpanded(id)
    }
  }

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  }

  // Handle legend click
  const handleLegendClick = () => {
    setShowLegendModal(true)
  }
  
  // Event categories for legend modal
  const eventCategories = [
    {
      type: 'crime',
      title: 'Crime Incidents',
      description: 'Safety alerts and crime reports',
      icon: <TbShield className="h-5 w-5" />,
      iconColor: 'text-red-600',
      borderColor: 'border-red-200 dark:border-red-900',
      bgColor: 'bg-red-50'
    },
    {
      type: 'infrastructure',
      title: 'Infrastructure Projects',
      description: 'Construction and development updates',
      icon: <TbBuildingSkyscraper className="h-5 w-5" />,
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200 dark:border-blue-900',
      bgColor: 'bg-blue-50'
    },
    {
      type: 'hazard',
      title: 'Hazard Warnings',
      description: 'Weather and environmental alerts',
      icon: <TbAlertTriangle className="h-5 w-5" />,
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-200 dark:border-amber-900',
      bgColor: 'bg-amber-50'
    },
    {
      type: 'social',
      title: 'Social Events',
      description: 'Community gatherings and festivals',
      icon: <IoMdPerson className="h-5 w-5" />,
      iconColor: 'text-green-600',
      borderColor: 'border-green-200 dark:border-green-900',
      bgColor: 'bg-green-50'
    }
  ]
  
  // Calculate toggle button position based on sidebar width
  const toggleButtonLeft = isCollapsed 
    ? '1rem' 
    : `calc(${sidebarWidth}vw + 1rem)`;
  
  return (
    <>
      {/* Sidebar toggle button */}
      <button 
        onClick={toggleSidebar} 
        className="fixed top-24 z-30 p-2 rounded-full transition-all duration-300 shadow-md"
        style={{ 
          left: toggleButtonLeft,
          backgroundColor: darkMode ? '#374151' : 'white',
          color: darkMode ? 'white' : '#1f2937'
        }}
        aria-label={isCollapsed ? "Show sidebar" : "Hide sidebar"}
      >
        {isCollapsed ? <BsChevronRight size={20} /> : <BsChevronLeft size={20} />}
      </button>
      
      {/* Main panel - responsive and always visible unless user collapses it */}
      <div 
        className={`
          ${isCollapsed ? '-translate-x-full' : 'translate-x-0'} 
          transform transition-transform duration-300 ease-in-out
          h-full fixed z-20
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
          border-r shadow-sm overflow-hidden flex flex-col
        `}
        style={{ width: `${sidebarWidth}vw` }}
      >
        <div className={`p-2 sm:p-3 md:p-4 lg:p-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-sm sm:text-base md:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Incident Feed</h2>
          <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-0.5 sm:mt-1`}>Live updates</p>
          
          <a 
            href="/news-feed" 
            className={`flex items-center justify-center mt-2 py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            View News Feed
          </a>
        </div>
        
        {/* Legend section - redesigned */}
        <div className={`p-2 sm:p-3 md:p-4 lg:p-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center mb-1.5 sm:mb-3">
            <h3 className={`text-xs sm:text-sm md:text-base font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Legend</h3>
            <button 
              onClick={handleLegendClick}
              className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              View
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-3 mt-1 sm:mt-2">
            {eventCategories.map((category) => (
              <div 
                key={category.type} 
                className={`flex items-center p-1 sm:p-1.5 md:p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <div className={`w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center ${category.iconColor} mr-1 sm:mr-1.5 md:mr-2`}>
                  {category.icon}
                </div>
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} hidden sm:inline`}>
                  {category.title.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className={`h-6 w-6 sm:h-8 sm:w-8 border-3 sm:border-4 ${darkMode ? 'border-gray-700 border-t-blue-400' : 'border-gray-200 border-t-blue-500'} rounded-full animate-spin`}></div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {visibleNews.length === 0 ? (
              <div className={`p-3 sm:p-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p className="text-xs sm:text-sm">No incidents</p>
              </div>
            ) : (
              <ul>
                {visibleNews.map((item) => (
                  <li 
                    key={item.id}
                    className={`p-2 sm:p-3 md:p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'} transition-colors cursor-pointer`}
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex">
                      <div className={`rounded-full w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex items-center justify-center mr-1.5 sm:mr-2 md:mr-3 flex-shrink-0 ${getNewsColor(item.type)}`}>
                        {getNewsIcon(item.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col">
                        <h3 className={`font-medium text-xs sm:text-sm break-words ${darkMode ? 'text-white' : 'text-gray-900'} pr-1`}>
                          {item.title}
                        </h3>
                        
                        <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'} break-words`}>
                          {item.description}
                        </p>
                        
                        <div className="flex justify-between items-center mt-1 sm:mt-2">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] sm:text-xs ${getNewsColor(item.type)}`}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                          <span className={`text-[10px] sm:text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {timeAgo(item.date)}
                          </span>
                        </div>
                        
                        {expanded === item.id && (
                          <div className={`mt-2 sm:mt-3 text-[10px] sm:text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div className="flex flex-col space-y-2 border-t pt-1 sm:pt-2 mt-1 sm:mt-2 border-gray-200 dark:border-gray-700">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Date:</span>
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                  {formatDate(item.date)}
                                </span>
                              </div>
                              
                              {item.url ? (
                                <button
                                  onClick={(e) => openNewsUrl(e, item.url)}
                                  className={`flex items-center justify-center w-full mt-1 py-1.5 px-3 rounded-md text-xs font-medium ${
                                    darkMode 
                                      ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600' 
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                                  } transition-colors`}
                                >
                                  <TbExternalLink className="mr-1.5" />
                                  View Source
                                </button>
                              ) : (
                                <div className={`flex items-center text-[10px] sm:text-xs mt-1 p-1.5 rounded-md ${
                                  darkMode ? 'bg-gray-700 text-gray-300 border border-gray-600' : 'bg-gray-100 text-gray-600 border border-gray-200'
                                }`}>
                                  <TbUser className="mr-1.5 flex-shrink-0" />
                                  <span>
                                    User-reported incident
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      
      {/* Legend Modal */}
      {showLegendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div 
            className="absolute inset-0  backdrop-blur-sm pointer-events-auto transition-all duration-300"
            onClick={() => setShowLegendModal(false)}
          ></div>
          
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-xl w-full max-w-md mx-auto z-10 overflow-hidden pointer-events-auto transition-transform duration-300 transform scale-100`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white mr-3">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12L8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 12V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 12V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 16V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 16V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Mexico News Globe</h3>
              </div>
              <button 
                onClick={() => setShowLegendModal(false)}
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
              >
                <BsX size={24} />
              </button>
            </div>
            
            <div className="px-6 py-4">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Explore news and events across Mexico on an interactive 3D globe
              </p>
              
              <h4 className="text-sm font-medium mb-3">Event Categories:</h4>
              
              <div className="space-y-3">
                {eventCategories.map((category) => (
                  <div 
                    key={category.type}
                    className={`rounded-lg p-3 border ${category.borderColor} flex items-center ${darkMode ? '' : category.bgColor}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${category.iconColor} ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm`}>
                      {category.icon}
                    </div>
                    <div className="ml-3">
                      <h5 className="font-medium text-sm">{category.title}</h5>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {category.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`px-6 py-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <button
                onClick={() => setShowLegendModal(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                Explore Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}