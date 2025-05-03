import { useState } from 'react';
import GeoVisorSidebar from './components/GeoVisorSidebar';
import GeoVisorMap from './components/GeoVisorMap';

function App() {
  // Estado para las capas activas
  const [activeLayers, setActiveLayers] = useState({
    osm: true,                // OpenStreetMap base layer
    googleSatellite: false,   // Google Satellite base layer
    departamentos: true,      // Capa temática (nivel más bajo)
    municipios: false,        // Capa temática
    veredas: false,           // Capa temática
    centrosPoblados: false,   // Capa temática
    estaciones: true          // Capa de puntos (nivel más alto)
  });

  // Estado para las opacidades de las capas
  const [layerOpacity, setLayerOpacity] = useState({
    departamentos: 0.6,
    municipios: 0.6,
    centrosPoblados: 0.6,
    veredas: 0.6,
    estaciones: 1.0
  });

  // Función para alternar capas base
  const toggleLayer = (layerId) => {
    if (layerId === 'osm' || layerId === 'googleSatellite') {
      if (!activeLayers[layerId]) {
        setActiveLayers(prev => ({
          ...prev,
          osm: layerId === 'osm',
          googleSatellite: layerId === 'googleSatellite'
        }));
      }
      return;
    }

    setActiveLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  // Función para cambiar opacidad
  const handleOpacityChange = (layerId, value) => {
    setLayerOpacity(prev => ({
      ...prev,
      [layerId]: value
    }));
  };

  // Estado para controlar el sidebar en móviles
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <GeoVisorSidebar
        activeLayers={activeLayers}
        toggleLayer={toggleLayer}
        layerOpacity={layerOpacity}
        setLayerOpacity={handleOpacityChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Área principal del mapa */}
      <main className="flex-1 relative overflow-hidden">
        <GeoVisorMap
          activeLayers={activeLayers}
          layerOpacity={layerOpacity}
        />
      </main>
    </div>
  );
}

export default App;