import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap, Pane } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import L from 'leaflet';
import { useEffect, useState, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { fetchGeoJSONLayer, AVAILABLE_LAYERS } from '../services/geoServerService';
import MarkerCluster from './MarkerCluster';
import ReactDOM from 'react-dom/client';
import { createCustomPopup } from './CustomPopup';
import { createStationPopup } from './StationPopup';

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

const GeoVisorMap = ({
    activeLayers,
    layerOpacity,
    sidebarOpen,
    searchItems,
    setSearchItems,
    filterItems,
    setFilterItems
}) => {
    const [layersData, setLayersData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mapRef, setMapRef] = useState(null);
    const [filteredStations, setFilteredStations] = useState(null);
    const [highlightedStation, setHighlightedStation] = useState(null);
    const [availableThematicLayers, setAvailableThematicLayers] = useState([]);
    const [legendVisible, setLegendVisible] = useState(false);

    // Coordenadas iniciales (Bogotá, Colombia)
    const center = [4.6263, -74.0816];
    const zoom = 8;

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

                // Actualizar capas temáticas disponibles para filtrado
                const thematicLayers = ['departamentos', 'municipios', 'centrosPoblados', 'veredas']
                    .filter(layerId => newLayers[layerId])
                    .map(layerId => ({
                        value: layerId,
                        label: layerId.charAt(0).toUpperCase() + layerId.slice(1)
                    }));

                setAvailableThematicLayers(thematicLayers);
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

    // Estilo para estaciones resaltadas
    const getHighlightedStyle = () => ({
        radius: 8,
        fillColor: '#FF0000',
        color: '#000',
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
        className: 'highlighted-station'
    });

    // Definición de panes con z-index específico
    const PANES = {
        DEPARTAMENTOS: 'departamentos-pane',   // zIndex: 100 (fondo)
        MUNICIPIOS: 'municipios-pane',        // zIndex: 200
        VEREDAS: 'veredas-pane',              // zIndex: 300
        CENTROS_POBLADOS: 'centros-pane',     // zIndex: 300
        ESTACIONES: 'estaciones-pane'         // zIndex: 400 (frente)
    };

    // Configuración de capas
    const layerStyles = {
        departamentos: {
            color: '#FF5733',
            type: 'polygon',
            pane: PANES.DEPARTAMENTOS,
            label: 'Departamentos'
        },
        municipios: {
            color: '#3366FF',
            type: 'polygon',
            pane: PANES.MUNICIPIOS,
            label: 'Municipios'
        },
        centrosPoblados: {
            color: '#33FF57',
            type: 'polygon',
            pane: PANES.CENTROS_POBLADOS,
            label: 'Centros Poblados'
        },
        veredas: {
            color: '#FFFF33',
            type: 'polygon',
            pane: PANES.VEREDAS,
            label: 'Veredas'
        },
        estaciones: {
            color: '#FF3366',
            type: 'point',
            pane: PANES.ESTACIONES,
            label: 'Estaciones'
        },
        osm: {
            label: 'OpenStreetMap'
        },
        googleSatellite: {
            label: 'Google Satellite'
        }
    };

    // Orden definido de las capas
    const layerOrder = ['departamentos', 'municipios', 'veredas', 'centrosPoblados', 'estaciones'];

    // Toggle para la visibilidad de la leyenda
    const toggleLegend = () => {
        setLegendVisible(!legendVisible);
    };

    useEffect(() => {
        if (!searchItems.term || !layersData.estaciones || searchItems.results !== "pending") return;

        const term = searchItems.term.trim().toLowerCase();
        const stations = layersData.estaciones.features;

        const foundStation = stations.find(station => {
            // Modificación para manejar guiones y espacios
            const stationName = station.properties?.nom_emt?.toLowerCase().replace(/\s*-\s*/g, ' ');
            const searchTerm = term.replace(/\s*-\s*/g, ' ');
            return stationName?.includes(searchTerm);
        });

        if (foundStation) {
            setSearchItems(prev => ({
                ...prev,
                results: {
                    type: "FeatureCollection",
                    features: [foundStation]
                },
                highlighted: foundStation
            }));

            const [lng, lat] = foundStation.geometry.coordinates;
            mapRef?.flyTo([lat, lng], 14);
        } else {
            setSearchItems(prev => ({
                ...prev,
                results: null,
                highlighted: null
            }));

            // Corrección para mostrar el popup correctamente
            if (mapRef) {
                L.popup()
                    .setLatLng(mapRef.getCenter())
                    .setContent(`No se encontró la estación: ${searchItems.term}`)
                    .openOn(mapRef);
            }
        }
    }, [searchItems.term, searchItems.results, layersData.estaciones, mapRef]);

    const createStationMarker = (feature, latlng) => {
        const isHighlighted = highlightedStation?.properties?.nom_emt === feature.properties.nom_emt;

        const marker = L.circleMarker(
            latlng,
            isHighlighted ? getHighlightedStyle() : getPointStyle(layerStyles.estaciones.color, layerOpacity.estaciones || 1)
        );

        // Crear popup con referencia al mapa
        if (mapRef) {
            setTimeout(() => {
                createStationPopup(feature, marker, mapRef);
            }, 100);
        } else {
            createStationPopup(feature, marker, null);
        }

        if (isHighlighted) {
            marker.bringToFront();
        }

        return marker;
    };

    return (
        <div className="w-full h-full relative">
            <FixLeafletIcons />
            {/* Contenedor del mapa con margen para el sidebar */}
            <div className={cn(
                "absolute inset-0 transition-all duration-300",
                sidebarOpen ? "md:ml-64" : ""
            )}>
                <MapContainer
                    center={center}
                    zoom={zoom}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    whenCreated={(map) => {
                        setMapRef(map);
                        setTimeout(() => map.invalidateSize(), 300);
                    }}
                    ref={(mapInstance) => {
                        if (mapInstance) setMapRef(mapInstance);
                    }}
                >
                    {/* Definición de los panes */}
                    <Pane name={PANES.DEPARTAMENTOS} style={{ zIndex: 200 }} />
                    <Pane name={PANES.MUNICIPIOS} style={{ zIndex: 250 }} />
                    <Pane name={PANES.VEREDAS} style={{ zIndex: 300 }} />
                    <Pane name={PANES.CENTROS_POBLADOS} style={{ zIndex: 300 }} />
                    <Pane name={PANES.ESTACIONES} style={{ zIndex: 400 }} />

                    {/* Botón para volver al centro */}
                    <div className="absolute bottom-[4.5rem] right-2 z-[1001]">
                        <button
                            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg hover:bg-gray-100 border border-gray-200"
                            title="Centrar mapa"
                            onClick={() => mapRef?.setView(center, zoom)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                        </button>
                    </div>

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

                        // Caso especial para estaciones: usando MarkerCluster con popup personalizado
                        if (layerId === 'estaciones') {
                            const dataToShow = filteredStations || layersData[layerId];
                            return (
                                <MarkerCluster
                                    key={layerId}
                                    map={mapRef}
                                    data={dataToShow}
                                    pointToLayer={createStationMarker}
                                />
                            );
                        }

                        // Para el resto de las capas, usamos el popup existente
                        return (
                            <GeoJSON
                                key={layerId}
                                data={layersData[layerId]}
                                pane={style.pane}
                                style={() => getPolygonStyle(style.color, layerOpacity[layerId] || 0.5)}
                                onEachFeature={(feature, layer) => {
                                    // Usar el componente CustomPopup para mostrar la información
                                    createCustomPopup(feature, layer, layerId);

                                    // Añadir evento hover para resaltar el polígono
                                    layer.on({
                                        mouseover: (e) => {
                                            const layer = e.target;
                                            layer.setStyle({
                                                weight: 3,
                                                fillOpacity: layerOpacity[layerId] + 0.2,
                                            });
                                            layer.bringToFront();
                                        },
                                        mouseout: (e) => {
                                            const layer = e.target;
                                            layer.setStyle({
                                                weight: 1,
                                                fillOpacity: layerOpacity[layerId],
                                            });
                                        }
                                    });
                                }}
                            />
                        );
                    })}
                </MapContainer>
            </div>

            {/* Botón para mostrar/ocultar leyenda (en reemplazo del control de capas original) */}
            <div className="absolute top-2 right-2 z-[1001]">
                <button
                    className="flex items-center justify-center w-10 h-10 bg-white rounded-md shadow-lg hover:bg-gray-100 border border-gray-200"
                    title="Mostrar/Ocultar Leyenda"
                    onClick={toggleLegend}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
            </div>

            {/* Leyenda de capas */}
            {legendVisible && (
                <div className="absolute top-14 right-2 z-[1001] bg-white rounded-md shadow-lg p-3 max-w-xs w-full md:w-64 lg:w-72 transition-all duration-300 transform">
                    <div className="flex justify-between items-center mb-2 border-b pb-2">
                        <h3 className="font-medium text-gray-800">Leyenda de Capas</h3>
                        <button
                            className="text-gray-500 hover:text-gray-700"
                            onClick={toggleLegend}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* Sección de capas base */}
                    <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Capas Base</h4>
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="layer-osm"
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    checked={activeLayers.osm}
                                    onChange={() => { }}
                                    disabled
                                />
                                <label htmlFor="layer-osm" className="ml-2 text-sm text-gray-700">
                                    {layerStyles.osm.label}
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="layer-satellite"
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    checked={activeLayers.googleSatellite}
                                    onChange={() => { }}
                                    disabled
                                />
                                <label htmlFor="layer-satellite" className="ml-2 text-sm text-gray-700">
                                    {layerStyles.googleSatellite.label}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Sección de capas temáticas */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Capas Temáticas</h4>
                        <div className="space-y-2">
                            {layerOrder.map(layerId => {
                                const style = layerStyles[layerId];
                                if (!style) return null;

                                return (
                                    <div key={layerId} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`layer-${layerId}`}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            checked={activeLayers[layerId]}
                                            onChange={() => { }}
                                            disabled
                                        />
                                        <label htmlFor={`layer-${layerId}`} className="ml-2 text-sm text-gray-700 flex items-center">
                                            <span
                                                className="inline-block w-4 h-4 mr-2"
                                                style={{
                                                    backgroundColor: style.color,
                                                    borderRadius: style.type === 'point' ? '50%' : '0'
                                                }}
                                            ></span>
                                            {style.label}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Nota informativa */}
                    <div className="mt-3 text-xs text-gray-500 italic">
                        Para activar/desactivar capas, use el panel de control.
                    </div>
                </div>
            )}

            {/* Contenedor para los mensajes en el centro inferior */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] flex flex-col gap-2 z-[1000] w-64 md:w-72 lg:w-80">
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