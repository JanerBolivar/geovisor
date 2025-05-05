import { useState, useEffect, useCallback } from 'react';
import GeoVisorSidebar from './components/GeoVisorSidebar';
import GeoVisorMap from './components/GeoVisorMap';
import { useMediaQuery } from "@/hooks/use-media-query";

function App() {
  // Estado para las capas activas (existente)
  const [activeLayers, setActiveLayers] = useState({
    osm: true,
    googleSatellite: false,
    departamentos: true,
    municipios: false,
    veredas: false,
    centrosPoblados: false,
    estaciones: true
  });

  // Estado para las opacidades (existente)
  const [layerOpacity, setLayerOpacity] = useState({
    departamentos: 0.6,
    municipios: 0.6,
    centrosPoblados: 0.6,
    veredas: 0.6,
    estaciones: 1.0
  });

  // Estado para el sidebar (existente)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Nuevos estados compartidos
  const [searchItems, setSearchItems] = useState({
    term: "",
    results: null,
    highlighted: null
  });

  const [filterItems, setFilterItems] = useState({
    layerId: null,
    results: null
  });

  // Función para alternar capas base (existente)
  const toggleLayer = useCallback((layerId) => {
    if (layerId === 'osm' || layerId === 'googleSatellite') {
      setActiveLayers(prev => ({
        ...prev,
        osm: layerId === 'osm',
        googleSatellite: layerId === 'googleSatellite'
      }));
      return;
    }
    setActiveLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  }, []);

  // Función para cambiar opacidad (existente)
  const handleOpacityChange = useCallback((layerId, value) => {
    setLayerOpacity(prev => ({
      ...prev,
      [layerId]: value
    }));
  }, []);

  // Efecto para manejar el estado inicial del sidebar (existente)
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  return (
    <div className="relative h-screen bg-gray-100 overflow-hidden">
      <GeoVisorSidebar
        activeLayers={activeLayers}
        toggleLayer={toggleLayer}
        layerOpacity={layerOpacity}
        setLayerOpacity={handleOpacityChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        searchItems={searchItems}
        setSearchItems={setSearchItems}
        filterItems={filterItems}
        setFilterItems={setFilterItems}
      />

      <main className="h-full w-full relative">
        <GeoVisorMap
          activeLayers={activeLayers}
          layerOpacity={layerOpacity}
          sidebarOpen={sidebarOpen}
          searchItems={searchItems}
          setSearchItems={setSearchItems}
          filterItems={filterItems}
          setFilterItems={setFilterItems}
        />
      </main>
    </div>
  );
}

export default App;