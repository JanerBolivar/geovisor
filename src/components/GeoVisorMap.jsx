import { MapContainer, TileLayer, LayersControl, GeoJSON, ZoomControl, useMap, Pane } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { fetchGeoJSONLayer, AVAILABLE_LAYERS } from '../services/geoServerService';

// Fix para los iconos de marcadores 
const FixLeafletIcons = () => {
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;

        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
    }, []);

    return null;
};

// Componente para el botón de centrar mapa
const CenterMapButton = ({ center, zoom }) => {
    const map = useMap();

    const handleCenterMap = () => {
        map.setView(center, zoom);
    };

    return (
        <div className="absolute bottom-24 right-2 z-[1000]">
            <button
                className="flex items-center justify-center w-8 h-8 bg-white rounded-md shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Volver al centro"
                aria-label="Volver al centro"
                onClick={handleCenterMap}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
            </button>
        </div>
    );
};

const GeoVisorMap = ({ activeLayers, layerOpacity }) => {
    const [layersData, setLayersData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Coordenadas iniciales (Bogotá, Colombia)
    const center = [4.7110, -74.0721];
    const zoom = 6;

    // Cargar capas cuando se activan
    useEffect(() => {
        const loadLayers = async () => {
            const layersToLoad = Object.entries(activeLayers)
                .filter(([layerId, isActive]) =>
                    isActive && !layersData[layerId] && layerId !== 'osm' && layerId !== 'googleSatellite'
                )
                .map(([layerId]) => layerId);

            if (layersToLoad.length === 0) return;

            setLoading(true);
            setError(null);

            try {
                const newLayers = {};

                for (const layerId of layersToLoad) {
                    const layerName = AVAILABLE_LAYERS[layerId.toUpperCase()];
                    if (layerName) {
                        newLayers[layerId] = await fetchGeoJSONLayer(layerName);
                    }
                }

                setLayersData(prev => ({ ...prev, ...newLayers }));
            } catch (err) {
                setError('Error al cargar algunas capas. Intente recargar la página.');
                console.error('Error loading layers:', err);
            } finally {
                setLoading(false);
            }
        };

        loadLayers();
    }, [activeLayers]);

    // Estilo para polígonos
    const getPolygonStyle = (color, opacity) => ({
        fillColor: color,
        weight: 1,
        opacity: 1,
        color: color,
        fillOpacity: opacity,
    });

    // Estilo para puntos
    const getPointStyle = (color, opacity) => ({
        radius: 6,
        fillColor: color,
        color: '#333',
        weight: 1,
        opacity: 1,
        fillOpacity: opacity,
    });

    // Definición de panes con z-index específico
    const PANES = {
        DEPARTAMENTOS: 'departamentos-pane',   // zIndex: 100 (fondo)
        MUNICIPIOS: 'municipios-pane',        // zIndex: 200
        VEREDAS: 'veredas-pane',              // zIndex: 300
        CENTROS_POBLADOS: 'centros-pane',     // zIndex: 300 (mismo nivel que veredas)
        ESTACIONES: 'estaciones-pane'         // zIndex: 400 (frente)
    };

    // Configuración de capas
    const layerStyles = {
        departamentos: {
            color: '#FF5733',
            type: 'polygon',
            pane: PANES.DEPARTAMENTOS
        },
        municipios: {
            color: '#3366FF',
            type: 'polygon',
            pane: PANES.MUNICIPIOS
        },
        centrosPoblados: {
            color: '#33FF57',
            type: 'polygon',
            pane: PANES.CENTROS_POBLADOS
        },
        veredas: {
            color: '#FFFF33',
            type: 'polygon',
            pane: PANES.VEREDAS
        },
        estaciones: {
            color: '#FF3366',
            type: 'point',
            pane: PANES.ESTACIONES
        }
    };

    // Orden definido de las capas
    const layerOrder = ['departamentos', 'municipios', 'veredas', 'centrosPoblados', 'estaciones'];

    return (
        <div className="w-full h-full relative">
            <FixLeafletIcons />
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                {/* Definición de los panes */}
                <Pane name={PANES.DEPARTAMENTOS} style={{ zIndex: 200 }} />
                <Pane name={PANES.MUNICIPIOS} style={{ zIndex: 250 }} />
                <Pane name={PANES.VEREDAS} style={{ zIndex: 300 }} />
                <Pane name={PANES.CENTROS_POBLADOS} style={{ zIndex: 300 }} />
                <Pane name={PANES.ESTACIONES} style={{ zIndex: 400 }} />


                {/* Botón para volver al centro */}
                <CenterMapButton center={center} zoom={zoom} />

                {/* Controlador de zoom en la esquina inferior derecha */}
                <ZoomControl position="bottomright" />

                {/* Capa base OSM */}
                {activeLayers.osm && (
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                )}

                {/* Capa base Google Satellite */}
                {activeLayers.googleSatellite && (
                    <TileLayer
                        url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                        attribution='Google Satellite'
                    />
                )}

                {/* Renderizar capas en orden específico */}
                {layerOrder.map(layerId => {
                    const style = layerStyles[layerId];
                    if (!activeLayers[layerId] || !layersData[layerId]) return null;

                    return (
                        <GeoJSON
                            key={layerId}
                            data={layersData[layerId]}
                            pane={style.pane}
                            style={() => style.type === 'polygon' ?
                                getPolygonStyle(style.color, layerOpacity[layerId] || 0.5) :
                                getPointStyle(style.color, layerOpacity[layerId] || 1)
                            }
                            pointToLayer={style.type === 'point' ? (feature, latlng) => {
                                return L.circleMarker(latlng, {
                                    ...getPointStyle(style.color, layerOpacity[layerId] || 1),
                                    pane: style.pane
                                });
                            } : undefined}
                            onEachFeature={(feature, layer) => {
                                layer.bindPopup(
                                    Object.entries(feature.properties)
                                        .map(([key, value]) => `<b>${key}:</b> ${value}`)
                                        .join('<br>')
                                );
                            }}
                        />
                    );
                })}

                {/* LayersControl para toggle en la UI */}
                <LayersControl position="topright">
                    {Object.entries(layerStyles).map(([layerId, style]) => (
                        <LayersControl.Overlay
                            key={layerId}
                            name={layerId.charAt(0).toUpperCase() + layerId.slice(1)}
                            checked={activeLayers[layerId]}
                        >
                            <div style={{ display: 'none' }}></div>
                        </LayersControl.Overlay>
                    ))}
                </LayersControl>
            </MapContainer>

            {/* Contenedor para los mensajes en el centro inferior */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col gap-2 z-[1000] w-64 md:w-72 lg:w-80">
                {/* Indicador de carga */}
                {loading && (
                    <div className="bg-white p-2 rounded shadow-md w-full">
                        <p className="text-sm flex items-center justify-center gap-2 text-gray-700">
                            <span className="animate-spin">⏳</span>
                            Cargando capas...
                        </p>
                    </div>
                )}

                {/* Mensaje de error */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded shadow-md w-full">
                        <p className="text-sm text-center">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeoVisorMap;