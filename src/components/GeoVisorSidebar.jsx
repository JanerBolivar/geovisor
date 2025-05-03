import {
    ChevronDown,
    ChevronRight,
    Layers,
    MapPin,
    Map as MapIcon,
    Menu,
    X,
    Info,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import LayerControl from "./LayerControl";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

const GeoVisorSidebar = ({
    activeLayers,
    toggleLayer,
    layerOpacity,
    setLayerOpacity,
    sidebarOpen,
    setSidebarOpen
}) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    // Estado para las secciones expandidas
    const [expandedSections, setExpandedSections] = useState({
        baseLayers: true,
        thematicLayers: true,
        stations: true
    });

    // Efecto para manejar el estado inicial del sidebar
    useEffect(() => {
        if (isDesktop) {
            setSidebarOpen(true);
        } else {
            setSidebarOpen(false);
        }
    }, [isDesktop, setSidebarOpen]);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Configuración de capas base
    const baseLayers = [
        {
            id: "osm",
            name: "OpenStreetMap",
            type: "base",
            icon: <MapIcon className="h-4 w-4 text-gray-700" />
        },
        {
            id: "googleSatellite",
            name: "Google Satellite",
            type: "base",
            icon: <MapIcon className="h-4 w-4 text-gray-700" />
        }
    ];

    // Configuración de capas temáticas
    const thematicLayers = [
        {
            id: "departamentos",
            name: "Departamentos",
            type: "polygon",
            color: "#FF5733"
        },
        {
            id: "municipios",
            name: "Municipios",
            type: "polygon",
            color: "#3366FF"
        },
        {
            id: "centrosPoblados",
            name: "Centros Poblados",
            type: "polygon",
            color: "#33FF57"
        },
        {
            id: "veredas",
            name: "Veredas",
            type: "polygon",
            color: "#FFFF33"
        }
    ];

    // Configuración de estaciones
    const stationLayers = [
        {
            id: "estaciones",
            name: "Estaciones de Temperatura",
            type: "point",
            color: "#FF3366"
        }
    ];

    return (
        <>
            {/* Botón para mostrar/ocultar sidebar */}
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "fixed top-4 left-4 z-[2000] bg-white shadow-md hover:bg-gray-100 transition-all",
                    sidebarOpen && isDesktop ? "hidden" : "",
                    sidebarOpen && !isDesktop ? "left-[17rem]" : "left-4"
                )}
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? (
                    <X className="h-5 w-5 text-gray-700" />
                ) : (
                    <Menu className="h-5 w-5 text-gray-700" />
                )}
            </Button>

            {/* Sidebar */}
            <div
                className={cn(
                    "w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed z-[1100] transition-transform duration-300",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Cabecera con botón de cerrar en móviles */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-[#1E40AF]">
                            <AvatarImage src="/logo-ideam.png" />
                            <AvatarFallback className="text-white">ID</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-medium text-gray-800">GeoVisor IDEAM</h3>
                            <p className="text-xs text-gray-500">Monitoreo de temperatura</p>
                        </div>
                    </div>
                    {!isDesktop && (
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 rounded-md hover:bg-gray-200"
                        >
                            <X className="h-4 w-4 text-gray-500" />
                        </button>
                    )}
                </div>

                {/* Sección de Capas Base */}
                <div className="p-2">
                    <button
                        onClick={() => toggleSection('baseLayers')}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded text-gray-700"
                    >
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-gray-600" />
                            <span>Capas Base</span>
                        </div>
                        {expandedSections.baseLayers ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.baseLayers && (
                        <div className="pl-6 space-y-2 mt-2">
                            {baseLayers.map(layer => (
                                <LayerControl
                                    key={layer.id}
                                    name={layer.name}
                                    type={layer.type}
                                    isActive={activeLayers[layer.id]}
                                    onToggle={() => toggleLayer(layer.id)}
                                    opacity={1}
                                    color="#3b82f6"
                                    showControls={false}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <Separator className="bg-gray-200" />

                {/* Sección de Capas Temáticas */}
                <div className="p-2">
                    <button
                        onClick={() => toggleSection('thematicLayers')}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded text-gray-700"
                    >
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-gray-600" />
                            <span>Capas Temáticas</span>
                        </div>
                        {expandedSections.thematicLayers ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.thematicLayers && (
                        <div className="pl-6 space-y-2 mt-2">
                            {thematicLayers.map(layer => (
                                <LayerControl
                                    key={layer.id}
                                    name={layer.name}
                                    type={layer.type}
                                    color={layer.color}
                                    isActive={activeLayers[layer.id]}
                                    onToggle={() => toggleLayer(layer.id)}
                                    opacity={layerOpacity[layer.id] || 0.7}
                                    onOpacityChange={(value) => setLayerOpacity(layer.id, value)}
                                    showControls={true}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Sección de Estaciones */}
                <div className="p-2">
                    <button
                        onClick={() => toggleSection('stations')}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded text-gray-700"
                    >
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-600" />
                            <span>Estaciones</span>
                        </div>
                        {expandedSections.stations ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.stations && (
                        <div className="pl-6 space-y-2 mt-2">
                            {stationLayers.map(layer => (
                                <LayerControl
                                    key={layer.id}
                                    name={layer.name}
                                    type={layer.type}
                                    color={layer.color}
                                    isActive={activeLayers[layer.id]}
                                    onToggle={() => toggleLayer(layer.id)}
                                    opacity={layerOpacity[layer.id] || 1}
                                    onOpacityChange={(value) => setLayerOpacity(layer.id, value)}
                                    showControls={true}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1" />

                {/* Pie de página - Usuario */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://avatars.githubusercontent.com/u/101657362?v=4&size=64" />
                            <AvatarFallback>JM</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium text-gray-800">Janer Muñoz</p>
                            <p className="text-xs text-gray-500">jane.munoz@udla.edu.co</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GeoVisorSidebar;