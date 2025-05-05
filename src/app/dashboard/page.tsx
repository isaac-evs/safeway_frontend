'use client'

import DashboardMap from '@/components/ui/dashboard/DashboardMap'
import NewsPanel from '@/components/ui/dashboard/NewsPanel'
import DashboardHeader from '@/components/ui/dashboard/DashboardHeader'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import mapboxgl from 'mapbox-gl'
import { useTheme } from '@/contexts/ThemeContext'

// Define the news item type
interface NewsItem {
  id: number;
  title: string;
  description: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: 'crime' | 'infrastructure' | 'hazard' | 'social'; // Updated types
  date: string;
  url?: string; // Optional URL for the news source
}

export default function Dashboard() {
  const [newsData, setNewsData] = useState<NewsItem[]>([])
  const [filteredNewsData, setFilteredNewsData] = useState<NewsItem[]>([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-103.3496, 20.6767]) // Default: Guadalajara, Mexico
  const [zoomLevel, setZoomLevel] = useState(14)
  const { darkMode, toggleDarkMode } = useTheme() // Usar ThemeContext en lugar de estado local
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const searchParams = useSearchParams()
  const [mapReady, setMapReady] = useState(false) // Estado para controlar cuando el mapa está listo

  // Check for coordinates in URL query parameters
  useEffect(() => {
    const lng = searchParams.get('lng')
    const lat = searchParams.get('lat')
    const zoom = searchParams.get('zoom')
    
    console.log('URL params:', { lng, lat, zoom })
    
    if (lng && lat) {
      const parsedLng = parseFloat(lng)
      const parsedLat = parseFloat(lat)
      if (!isNaN(parsedLng) && !isNaN(parsedLat)) {
        console.log('Setting map center:', [parsedLng, parsedLat])
        setMapCenter([parsedLng, parsedLat])
        if (zoom) {
          const parsedZoom = parseFloat(zoom)
          if (!isNaN(parsedZoom)) {
            setZoomLevel(parsedZoom)
          } else {
            setZoomLevel(16) // Default higher zoom when coming from search
          }
        } else {
          setZoomLevel(16) // Default higher zoom when coming from search
        }
      }
    }
  }, [searchParams])

  // Mock data - In a real application, this would be fetched from an API
  useEffect(() => {
    // Simulating API call with setTimeout
    setTimeout(() => {
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
      
      setNewsData(mockNews);
      setFilteredNewsData(mockNews);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      setFilteredNewsData(newsData);
    } else {
      const filtered = newsData.filter(item => item.type === filter);
      setFilteredNewsData(filtered);
    }
  };

  // Handle location selection from search
  const handleLocationSelect = (coordinates: [number, number]) => {
    console.log('Location selected, updating center to:', coordinates);
    // Forzar renovación del componente del mapa al cambiar el centro
    setMapReady(prev => !prev);
    setMapCenter(coordinates);
    setZoomLevel(16); // Increase zoom level when searching for a location
  };

  // Set the map reference
  const setMapReference = (ref: React.MutableRefObject<mapboxgl.Map | null>) => {
    mapRef.current = ref.current;
    setMapReady(true); // Marcar que el mapa está listo
    console.log('Map reference updated:', mapRef.current ? 'Map object received' : 'Map is null');
  };

  // Debuggear cuando cambia mapRef para asegurarnos de que se pasa correctamente
  useEffect(() => {
    console.log('Dashboard page: mapRef changed', mapRef.current ? 'Map exists' : 'Map is null');
  }, [mapRef.current]);
  
  // Aplicar theme class al body para remediar problemas de altura en móviles
  useEffect(() => {
    document.body.classList.add('h-full');
    document.documentElement.classList.add('h-full', 'overflow-hidden');
    
    return () => {
      document.body.classList.remove('h-full');
      document.documentElement.classList.remove('h-full', 'overflow-hidden');
    };
  }, []);
  
  return (
    <div className={`h-screen w-full flex flex-col ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <DashboardHeader 
        onFilterChange={handleFilterChange} 
        activeFilter={activeFilter}
        onLocationSelect={handleLocationSelect}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      
      <div className="flex flex-1 relative overflow-hidden">
        <NewsPanel 
          news={filteredNewsData} 
          loading={loading}
          darkMode={darkMode} 
          mapRef={mapRef}
        />
        <DashboardMap 
          news={filteredNewsData} 
          center={mapCenter}
          darkMode={darkMode}
          setMapRef={setMapReference}
          zoomLevel={zoomLevel}
          key={`map-${mapCenter[0]}-${mapCenter[1]}-${zoomLevel}`} // Eliminar darkMode de la key para evitar recreación al cambiar el modo
        />
      </div>
    </div>
  );
} 