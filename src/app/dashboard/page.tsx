'use client'

import DashboardMap from '@/components/ui/dashboard/DashboardMap'
import NewsPanel from '@/components/ui/dashboard/NewsPanel'
import DashboardHeader from '@/components/ui/dashboard/DashboardHeader'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import mapboxgl from 'mapbox-gl'
import { useTheme } from '@/contexts/ThemeContext'
import { NewsItem } from '@/types'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { NEWS_ENDPOINTS } from '@/config'

// Separate component for using search params
function DashboardContent() {
  const router = useRouter();
  const [newsData, setNewsData] = useState<NewsItem[]>([])
  const [filteredNewsData, setFilteredNewsData] = useState<NewsItem[]>([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-103.3496, 20.6767]) // Default: Guadalajara, Mexico
  const [zoomLevel, setZoomLevel] = useState(14)
  const { darkMode, toggleDarkMode } = useTheme()
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const searchParams = useSearchParams()
  const [mapReady, setMapReady] = useState(false)

  // Check for coordinates in URL query parameters
  useEffect(() => {
    const lng = searchParams.get('lng')
    const lat = searchParams.get('lat')
    const zoom = searchParams.get('zoom')
    
    if (lng && lat) {
      const parsedLng = parseFloat(lng)
      const parsedLat = parseFloat(lat)
      if (!isNaN(parsedLng) && !isNaN(parsedLat)) {
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

  // Fetch real news data from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          router.push('/login');
          // return;
        }
        
        const response = await fetch(NEWS_ENDPOINTS.GET_ALL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || errorData.message || 'Failed to fetch news');
        }

        const data = await response.json();
        
        // Process coordinates from POINT format to [lng, lat] array
        const processedData = data.map((item: any) => {
          if (typeof item.coordinates === 'string' && item.coordinates.startsWith('POINT')) {
            const coordString = item.coordinates.replace('POINT (', '').replace(')', '');
            const [lng, lat] = coordString.split(' ').map(Number);
            return { ...item, coordinates: [lng, lat] as [number, number] };
          }
          return item;
        });
        
        setNewsData(processedData);
        setFilteredNewsData(processedData);
      } catch (error) {
        // Fallback to mock data in case of error
        const mockNews: NewsItem[] = [
          {
            id: 1,
            title: "Car Theft Report",
            description: "Vehicle theft reported in Chapultepec neighborhood parking lot.",
            coordinates: [-103.3814, 20.6721] as [number, number],
            type: "crime",
            date: "2023-05-15",
          },
        ];
        
        setNewsData(mockNews);
        setFilteredNewsData(mockNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [router]);

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
    // Forzar renovación del componente del mapa al cambiar el centro
    setMapReady(prev => !prev);
    setMapCenter(coordinates);
    setZoomLevel(16); // Increase zoom level when searching for a location
  };

  // Set the map reference
  const setMapReference = (ref: React.MutableRefObject<mapboxgl.Map | null>) => {
    mapRef.current = ref.current;
    setMapReady(true); // Marcar que el mapa está listo
  };
  
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
          key={`map-${mapCenter[0]}-${mapCenter[1]}-${zoomLevel}`}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="flex items-center justify-center h-screen w-full bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
} 