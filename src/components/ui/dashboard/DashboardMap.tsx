'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { IoAdd } from 'react-icons/io5'
import { TbShield, TbAlertTriangle, TbBuildingSkyscraper, TbAlertCircle } from 'react-icons/tb'
import { IoMdPerson } from 'react-icons/io'
import { createRoot, Root } from 'react-dom/client'
import { HiLocationMarker } from 'react-icons/hi'
import axios from 'axios'
import { NewsItem } from '@/types'
import { MAPBOX_TOKEN, NEWS_ENDPOINTS } from '@/config'

interface DashboardMapProps {
  news: NewsItem[];
  center: [number, number];
  darkMode: boolean;
  setMapRef?: (mapRef: React.MutableRefObject<mapboxgl.Map | null>) => void;
  zoomLevel?: number;
}

// Funciones auxiliares para marcadores
const getMarkerColor = (type: string): string => {
  const colors: Record<string, string> = {
    crime: '#ef4444', infrastructure: '#2563eb', 
    hazard: '#f59e0b', social: '#16a34a'
  }
  return colors[type] || '#6b7280'
}

const getMarkerIcon = (type: string) => {
  switch (type) {
    case 'crime': return <TbShield className="h-5 w-5" />;
    case 'infrastructure': return <TbBuildingSkyscraper className="h-5 w-5" />;
    case 'hazard': return <TbAlertTriangle className="h-5 w-5" />;
    case 'social': return <IoMdPerson className="h-5 w-5" />;
    default: return <TbAlertCircle className="h-5 w-5" />;
  }
};

// Eliminar console.logs innecesarios
// En lugar de console.error, usar una función centralizada
const logError = (message: string, error: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`${message}:`, error);
  }
};

export default function DashboardMap({ news, center, darkMode, setMapRef, zoomLevel = 16 }: DashboardMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const markerRoots = useRef<Map<string, Root>>(new Map())
  const [mapLoaded, setMapLoaded] = useState(false)
  const mountedRef = useRef(true)
  const initializedRef = useRef(false)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    location: '',
    type: '',
    date: '',
    url: '',
    coordinates: [] as [number, number] | []
  })
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  
  const MAPBOX_TOKEN_VALUE = MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "your_mapbox_token"
  mapboxgl.accessToken = MAPBOX_TOKEN_VALUE
  
  // Función para desmontar raíces de marcadores
  const safelyUnmountRoots = useCallback(() => {
    if (markerRoots.current.size === 0) return;
    
    const rootsArray = Array.from(markerRoots.current.values());
    markerRoots.current.clear();
    
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        rootsArray.forEach(root => {
          try { root.unmount(); } catch (_) { /* Silent catch */ }
        });
      }
    });
  }, []);
  
  // Compartir referencia del mapa con el componente padre
  useEffect(() => {
    if (setMapRef && map.current) setMapRef(map);
  }, [setMapRef, map.current, mapLoaded])
  
  // Rastrear el estado de montaje para limpieza
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  
  // Inicializar mapa - removido darkMode de las dependencias para que no se reinicie el mapa al cambiar el modo
  useEffect(() => {
    if (initializedRef.current || !mapContainer.current) return;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: darkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
        center: center,
        zoom: zoomLevel,
        attributionControl: false
      });
      
      map.current.on('load', () => {
        if (mountedRef.current && map.current) {
          setMapLoaded(true);
          initializedRef.current = true;
        }
      });
      
      map.current.addControl(new mapboxgl.NavigationControl({
        showCompass: false
      }), 'bottom-right');
    } catch (error) {
      logError('Error al inicializar el mapa:', error);
      if (map.current) {
        try { map.current.remove(); } catch (err) { /* Silently ignore */ }
      }
      map.current = null;
    }
    
    // Limpieza al desmontar
    return () => {
      markers.current.forEach(marker => {
        try { marker.remove(); } catch (err) { /* Silently ignore */ }
      });
      markers.current = [];
      
      safelyUnmountRoots();
      
      if (map.current) {
        try { map.current.remove(); } catch (error) { /* Silently ignore */ }
        map.current = null;
      }
      
      initializedRef.current = false;
    }
  }, [center, zoomLevel, safelyUnmountRoots])
  
  // Manejar cambio de centro
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    try {
      map.current.flyTo({
        center: center,
        zoom: zoomLevel,
        essential: true,
        duration: 1000
      });
    } catch (error) {
      logError('Error durante flyTo del mapa:', error);
    }
  }, [center, mapLoaded, zoomLevel])
  
  // Actualizar estilo del mapa cuando cambia el modo oscuro
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    // Capturar la posición y zoom actuales antes de cambiar el estilo
    const currentCenter = map.current.getCenter();
    const currentZoom = map.current.getZoom();
    const currentBearing = map.current.getBearing();
    const currentPitch = map.current.getPitch();
    
    const timer = setTimeout(() => {
      try {
        // Cambiar el estilo y restaurar la posición después
        map.current?.setStyle(
          darkMode 
            ? 'mapbox://styles/mapbox/dark-v11' 
            : 'mapbox://styles/mapbox/light-v11'
        );
        
        // Restaurar la posición y zoom después de que el estilo se cargue
        map.current?.once('style.load', () => {
          if (map.current) {
            try {
              map.current.setCenter([currentCenter.lng, currentCenter.lat]);
              map.current.setZoom(currentZoom);
              map.current.setBearing(currentBearing);
              map.current.setPitch(currentPitch);
            } catch (err) {
              logError('Error al restaurar la posición del mapa:', err);
            }
          }
        });
      } catch (error) {
        logError('Error al cambiar estilo del mapa:', error);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [darkMode, mapLoaded]);
  
  // Añadir marcadores para noticias
  useEffect(() => {
    if (!map.current || !mapLoaded || !mountedRef.current) return;
    
    // Limpiar marcadores anteriores
    markers.current.forEach(marker => {
      try { marker.remove(); } catch (err) { /* Silently ignore */ }
    });
    markers.current = [];
    
    safelyUnmountRoots();
    const newMarkerRoots = new Map<string, Root>();
    const newMarkers: mapboxgl.Marker[] = [];
    
    news.forEach((item) => {
      if (!mountedRef.current || !map.current) return;
      
      try {
        // Procesar coordenadas si vienen como string en formato "POINT (lng lat)"
        let coordinates: [number, number];
        
        if (typeof item.coordinates === 'string') {
          // Si es string, asumir formato POINT
          const coordString = (item.coordinates as string).replace(/POINT\s*\(/, '').replace(/\)/, '');
          const [lng, lat] = coordString.split(/\s+/).map(Number);
          coordinates = [lng, lat];
        } else {
          // Si no es string, asumir que ya es un array [lng, lat]
          coordinates = item.coordinates as [number, number];
        }
        
        // Crear elemento del marcador
        const markerEl = document.createElement('div');
        markerEl.className = 'marker-pin';
        markerEl.style.width = '40px';
        markerEl.style.height = '40px';
        markerEl.style.borderRadius = '50%';
        markerEl.style.backgroundColor = darkMode ? '#374151' : 'white';
        markerEl.style.border = '2px solid';
        markerEl.style.borderColor = getMarkerColor(item.type);
        markerEl.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
        markerEl.style.display = 'flex';
        markerEl.style.alignItems = 'center';
        markerEl.style.justifyContent = 'center';
        markerEl.style.color = getMarkerColor(item.type);
        
        // Crear contenedor de icono
        const iconContainer = document.createElement('div');
        markerEl.appendChild(iconContainer);
        
        // Crear raíz de React
        const markerId = `marker-${item.id}`;
        const root = createRoot(iconContainer);
        
        // Renderizar icono
        root.render(getMarkerIcon(item.type));
        
        // Almacenar raíz para limpieza
        newMarkerRoots.set(markerId, root);
        
        // Crear popup con contenido
        const popupHtml = `
          <div style="padding: 15px; background-color: ${darkMode ? '#374151' : 'white'}; border-radius: 8px; color: ${darkMode ? '#f3f4f6' : '#1f2937'};">
            <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${item.title}</h3>
            <p style="font-size: 14px; margin-bottom: 10px; color: ${darkMode ? '#d1d5db' : '#4b5563'};">${item.description}</p>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; margin-top: 10px;">
              <span style="color: ${darkMode ? '#9ca3af' : '#6b7280'}; padding: 3px 8px; border-radius: 4px; background-color: ${darkMode ? '#1f2937' : '#f3f4f6'};">
                ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </span>
            </div>
          </div>
        `;
        
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: true,
          maxWidth: '320px',
          className: 'custom-popup'
        }).setHTML(popupHtml);
        
        // Crear marcador
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat(coordinates)
          .setPopup(popup);
        
        if (mountedRef.current && map.current) {
          marker.addTo(map.current);
          newMarkers.push(marker);
        } else {
          try { root.unmount(); } catch (err) { /* Silently ignore */ }
        }
      } catch (error) {
        logError('Error al añadir marcador:', error);
      }
    });
    
    // Actualizar referencias
    markers.current = newMarkers;
    markerRoots.current = newMarkerRoots;
    
    return () => {
      newMarkers.forEach(marker => {
        try { marker.remove(); } catch (err) { /* Silently ignore */ }
      });
      safelyUnmountRoots();
    };
  }, [news, mapLoaded, darkMode, safelyUnmountRoots]);
  
  // Fetch location suggestions
  const fetchLocationSuggestions = async (query: string) => {
    if (!query.trim()) {
      setLocationSuggestions([])
      return
    }

    setLoadingSuggestions(true)
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
        {
          params: {
            access_token: MAPBOX_TOKEN_VALUE,
            autocomplete: true,
            types: 'place,address,poi',
            limit: 5
          }
        }
      )
      
      if (response.data && response.data.features) {
        setLocationSuggestions(response.data.features)
        setShowSuggestions(true)
      }
    } catch (error) {
      logError("Error fetching location suggestions:", error)
      setLocationSuggestions([])
    } finally {
      setLoadingSuggestions(false)
    }
  }
  
  // Debounce for location search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (newIssue.location) {
        fetchLocationSuggestions(newIssue.location)
      } else {
        setLocationSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [newIssue.location])
  
  // Handle location selection from suggestions
  const handleSelectLocation = (location: any) => {
    setShowSuggestions(false);
    setNewIssue({
      ...newIssue,
      location: location.place_name,
      coordinates: location.geometry.coordinates
    });
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create date if not provided
    const issueDate = newIssue.date || new Date().toISOString().split('T')[0];
    
    // Prepare data for submission (omit 'location')
    const { location, ...rest } = newIssue;
    const formData = {
      ...rest,
      date: issueDate,
      coordinates: `POINT(${newIssue.coordinates[0]} ${newIssue.coordinates[1]})`, // Cambiado a formato POINT
    };
  
    try {
      // Obtener el token de autenticación
      const token = localStorage.getItem('authToken');
      
      // Post to backend using correct endpoint
      const response = await fetch(NEWS_ENDPOINTS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        logError('Error creando noticia:', errorData);
        throw new Error(errorData.detail ? JSON.stringify(errorData.detail) : errorData.message || 'Failed to create news item');
      }
      
      // Reset form and close modal
      setNewIssue({
        title: '',
        description: '',
        location: '',
        type: '',
        date: '',
        url: '',
        coordinates: [] as [number, number] | []
      });
      setIsModalOpen(false);
      
      // TODO: Refresh news data or add to local news state
      
    } catch (error) {
      logError('Error submitting news item:', error);
      // Handle error (show notification, etc.)
    }
  }
  
  return (
    <div className="flex-1 w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full absolute inset-0" />
      
      {/* Estilos CSS para el mapa */}
      <style jsx global>{`
        .mapboxgl-popup-content {
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          border: none;
          border-radius: 10px;
          padding: 0;
        }
        .mapboxgl-ctrl-logo { display: none !important; }
        .dark .mapboxgl-popup-content {
          background-color: #374151;
          color: #f3f4f6;
        }
        .dark .mapboxgl-popup-tip {
          border-top-color: #374151;
          border-bottom-color: #374151;
        }
        .mapboxgl-ctrl-bottom-right {
          bottom: 12px;
          right: 12px;
        }
        @media (max-width: 640px) {
          .mapboxgl-ctrl-bottom-right {
            bottom: 80px;
            right: 10px;
          }
          .mapboxgl-ctrl-group {
            transform: scale(0.9);
            transform-origin: bottom right;
          }
        }
        
        /* Fix for iOS height issues */
        html, body, #__next {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        
        @supports (-webkit-touch-callout: none) {
          .h-screen {
            height: -webkit-fill-available;
          }
        }
      `}</style>
      
      {!mapLoaded && (
        <div className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-100 bg-opacity-50'}`}>
          <div className={`h-12 w-12 border-4 ${darkMode ? 'border-gray-700 border-t-blue-400' : 'border-gray-200 border-t-blue-500'} rounded-full animate-spin`}></div>
        </div>
      )}
      
      {/* Botón para agregar nueva noticia */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <button 
          onClick={() => setIsModalOpen(true)} 
          className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} flex items-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-full shadow-lg text-white focus:outline-none transition-colors`}
        >
          <IoAdd className="h-5 w-5 sm:h-6 sm:w-6 mr-1.5 sm:mr-2" />
          <span className="text-sm sm:text-base font-medium">Add News to Map</span>
        </button>
      </div>
      
      {/* Modal para añadir nueva noticia */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            <div 
              className="fixed inset-0 bg-opacity-60 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsModalOpen(false)}
            ></div>
            
            <div className={`relative inline-block align-bottom ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <form onSubmit={handleSubmit}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className={`text-lg leading-6 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Report an Issue
                      </h3>
                      <div className="mt-4 space-y-4">
                        {/* Título */}
                        <div>
                          <label htmlFor="title" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Title
                          </label>
                          <input
                            type="text"
                            id="title"
                            required
                            placeholder="Enter incident title"
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} py-2 px-3 border focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            value={newIssue.title}
                            onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
                          />
                        </div>
                        
                        {/* Descripción */}
                        <div>
                          <label htmlFor="description" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Description
                          </label>
                          <textarea
                            id="description"
                            rows={3}
                            required
                            placeholder="Describe what happened"
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} py-2 px-3 border focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            value={newIssue.description}
                            onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                          />
                        </div>
                        
                        {/* Ubicación con sugerencias */}
                        <div className="relative">
                          <label htmlFor="location" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Location
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="location"
                              required
                              placeholder="Enter or search for a location"
                              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} py-2 px-3 border focus:outline-none focus:ring-1 focus:ring-blue-500`}
                              value={newIssue.location}
                              onChange={(e) => setNewIssue({...newIssue, location: e.target.value})}
                              onFocus={() => newIssue.location && locationSuggestions.length > 0 && setShowSuggestions(true)}
                            />
                            {loadingSuggestions && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className={`h-4 w-4 border-2 ${darkMode ? 'border-gray-600 border-t-blue-400' : 'border-gray-300 border-t-blue-500'} rounded-full animate-spin`}></div>
                              </div>
                            )}
                          </div>
                          
                          {/* Sugerencias de ubicación */}
                          {showSuggestions && locationSuggestions.length > 0 && (
                            <div className={`absolute z-10 mt-1 w-full rounded-md shadow-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border overflow-auto max-h-60`}>
                              <ul className="py-1">
                                {locationSuggestions.map((suggestion) => (
                                  <li 
                                    key={suggestion.id}
                                    onClick={() => handleSelectLocation(suggestion)}
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
                        
                        {/* Tipo de noticia */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Type
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { id: 'crime', label: 'Crime', icon: <TbShield className="h-5 w-5" />, color: 'bg-red-600' },
                              { id: 'infrastructure', label: 'Infrastructure', icon: <TbBuildingSkyscraper className="h-5 w-5" />, color: 'bg-blue-600' },
                              { id: 'hazard', label: 'Hazard', icon: <TbAlertTriangle className="h-5 w-5" />, color: 'bg-amber-500' },
                              { id: 'social', label: 'Social', icon: <IoMdPerson className="h-5 w-5" />, color: 'bg-green-600' }
                            ].map((type) => (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => setNewIssue({...newIssue, type: type.id})}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                                  newIssue.type === type.id 
                                    ? `${type.color} text-white border-transparent` 
                                    : darkMode 
                                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <div className="mb-1">{type.icon}</div>
                                <span className="text-xs font-medium">{type.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Fecha */}
                        <div>
                          <label htmlFor="date" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Date <span className="text-xs font-normal opacity-70">(leave empty for current date)</span>
                          </label>
                          <input
                            type="date"
                            id="date"
                            placeholder="Select a date"
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} py-2 px-3 border focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            value={newIssue.date}
                            onChange={(e) => setNewIssue({...newIssue, date: e.target.value})}
                          />
                        </div>

                        {/* URL */}
                        <div>
                          <label htmlFor="url" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Source URL
                          </label>
                          <input
                            type="text"
                            id="url"
                            required
                            placeholder="Enter incident url"
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} py-2 px-3 border focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            value={newIssue.url}
                            onChange={(e) => setNewIssue({...newIssue, url: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-gray-50 border-t border-gray-200'}`}>
                  <button
                    type="submit"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm`}
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`mt-3 w-full inline-flex justify-center rounded-md shadow-sm px-4 py-2 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'} text-base font-medium focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}