import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import L from 'leaflet';
import 'leaflet-routing-machine';
import RegistroModal from './RegistroModal';
import { registrarUsuarioEnEstacion } from '../services/registroService';

// Variable para almacenar la referencia al control de enrutamiento activo
let activeRoutingControl = null;

// Control de enrutamiento como componente de React
const RoutingControl = ({ startPoint, endPoint, map }) => {
    useEffect(() => {
        if (!map || !startPoint || !endPoint) return;

        // Si ya existe un control de enrutamiento, eliminarlo antes de crear uno nuevo
        if (activeRoutingControl) {
            map.removeControl(activeRoutingControl);
        }

        // Crear una instancia del control de enrutamiento
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(startPoint[0], startPoint[1]),
                L.latLng(endPoint[0], endPoint[1])
            ],
            routeWhileDragging: false,
            showAlternatives: true,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: '#6366F1', weight: 5 }]
            },
            createMarker: function () {
                return null;
            },
            router: L.Routing.osrmv1({
                language: 'es', // Configurar lenguaje a español
                profile: 'car'
            })
        }).addTo(map);

        // Guardar la referencia al control activo
        activeRoutingControl = routingControl;

        // Limpiar cuando el componente se desmonte
        return () => {
            map.removeControl(routingControl);
            activeRoutingControl = null;
        };
    }, [map, startPoint, endPoint]);

    return null;
};

// Componente para el popup de estaciones
const StationPopup = ({ feature, map }) => {
    const [showRoute, setShowRoute] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [registroStatus, setRegistroStatus] = useState(null);

    const properties = feature.properties;

    // Función para calcular la ruta con Leaflet
    const handleRouteCalculation = () => {
        setIsLoading(true);
        setError(null);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setShowRoute(true);
                    setIsLoading(false);
                },
                (error) => {
                    console.error("Error obteniendo ubicación:", error);
                    setError("No se pudo obtener tu ubicación actual. Por favor, activa los servicios de ubicación.");
                    setIsLoading(false);
                }
            );
        } else {
            setError("Tu navegador no soporta geolocalización");
            setIsLoading(false);
        }
    };

    // Función para cancelar la ruta
    const handleCancelRoute = () => {
        setShowRoute(false);
        if (activeRoutingControl && map) {
            map.removeControl(activeRoutingControl);
            activeRoutingControl = null;
        }
    };

    // Función para manejar el registro de usuario
    const handleRegistration = () => {
        setShowModal(true);
    };

    // Función para manejar el envío del formulario
    const handleFormSubmit = async (formData) => {
        try {
            setIsLoading(true);
            setError(null);

            // Enviar los datos al servidor
            const result = await registrarUsuarioEnEstacion(
                formData,
                properties
            );

            // Mostrar mensaje de éxito temporalmente
            setRegistroStatus({
                success: true,
                message: 'Registro completado exitosamente'
            });

            // Ocultar el mensaje después de unos segundos
            setTimeout(() => {
                setRegistroStatus(null);
            }, 3000);

            return result;
        } catch (err) {
            console.error('Error al registrar:', err);
            setError('No se pudo completar el registro. Por favor, inténtalo de nuevo.');

            // Re-lanzar el error para que el componente modal lo maneje
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Limpiar la ruta cuando se desmonta el componente
    useEffect(() => {
        return () => {
            if (activeRoutingControl && map) {
                map.removeControl(activeRoutingControl);
                activeRoutingControl = null;
            }
        };
    }, [map]);

    return (
        <div className="station-popup">
            {/* Imagen del encabezado */}
            <div className="popup-header">
                <img
                    src="/image.jpg"
                    alt="Imagen de referencia"
                    className="popup-image"
                />
                <h3 className="popup-title">Estación: {properties.nom_emt}</h3>
            </div>

            {/* Tabla de información */}
            <div className="popup-content">
                <table className="popup-table">
                    <tbody>
                        <tr>
                            <td className="field-label">Código:</td>
                            <td className="field-value">{properties.cod_emt || 'No aplica'}</td>
                        </tr>
                        <tr>
                            <td className="field-label">Departamento:</td>
                            <td className="field-value">{properties.nom_depart || 'No aplica'}</td>
                        </tr>
                        <tr>
                            <td className="field-label">Municipio:</td>
                            <td className="field-value">{properties.nom_muni || 'No aplica'}</td>
                        </tr>
                        <tr>
                            <td className="field-label">Tipo:</td>
                            <td className="field-value">{properties.type_emt || 'No aplica'}</td>
                        </tr>
                        <tr>
                            <td className="field-label">Zona Hidrográfica:</td>
                            <td className="field-value">{properties.zona_hidro || 'No aplica'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Estado de carga o error */}
            {isLoading && (
                <div className="popup-status">
                    <p className="text-center text-sm">Procesando solicitud...</p>
                </div>
            )}

            {error && (
                <div className="popup-status error">
                    <p className="text-center text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Mensaje de éxito */}
            {registroStatus && registroStatus.success && (
                <div className="popup-status success bg-green-100 border-l-4 border-green-500 p-2 mb-3">
                    <p className="text-center text-sm text-green-700">{registroStatus.message}</p>
                </div>
            )}

            {/* Botones de acción */}
            <div className="popup-actions">
                {!showRoute ? (
                    <button
                        className="popup-button route-button"
                        onClick={handleRouteCalculation}
                        disabled={isLoading}
                    >
                        Cómo llegar
                    </button>
                ) : (
                    <button
                        className="popup-button cancel-button"
                        onClick={handleCancelRoute}
                    >
                        Cancelar ruta
                    </button>
                )}
                <button
                    className="popup-button register-button"
                    onClick={handleRegistration}
                    disabled={isLoading}
                >
                    Registrar
                </button>
            </div>

            {/* Modal de registro */}
            <RegistroModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleFormSubmit}
                estacionNombre={properties.nom_emt}
                estacionLocation={[parseFloat(properties.latitud), parseFloat(properties.longitud)]}
            />

            {/* Renderizar el control de ruta si showRoute es true */}
            {showRoute && userLocation && map && (
                <RoutingControl
                    startPoint={userLocation}
                    endPoint={[parseFloat(properties.latitud), parseFloat(properties.longitud)]}
                    map={map}
                />
            )}
        </div>
    );
};

// Función para crear un popup para estaciones
export const createStationPopup = (feature, layer) => {
    let mapInstance = null;

    // Obtener la instancia del mapa
    if (layer && layer._map) {
        mapInstance = layer._map;
    }

    layer.bindPopup(() => {
        // Crear un elemento DOM para el popup
        const popupElement = document.createElement('div');

        const root = ReactDOM.createRoot(popupElement);
        root.render(<StationPopup feature={feature} map={mapInstance} />);

        return popupElement;
    }, {
        maxWidth: 300,
        className: 'custom-station-popup'
    });
};

export default StationPopup;