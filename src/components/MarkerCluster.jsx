import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const MarkerCluster = ({ map, data, pointStyle }) => {
    useEffect(() => {
        if (!map || !data || !data.features || data.features.length === 0) {
            console.log('No se puede renderizar clusters:', { map, data });
            return;
        }

        console.log('Datos recibidos para clustering:', data); // Debug

        const markers = L.markerClusterGroup({
            chunkedLoading: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            spiderfyOnMaxZoom: true,
            disableClusteringAtZoom: 15,
            iconCreateFunction: (cluster) => {
                const count = cluster.getChildCount();
                return L.divIcon({
                    html: `<div class="cluster-marker">${count}</div>`,
                    className: 'marker-cluster-custom',
                    iconSize: L.point(40, 40, true)
                });
            }
        });

        // Validar estructura de datos
        data.features.forEach(feature => {
            if (!feature.geometry || !feature.geometry.coordinates) {
                console.warn('Feature inválida:', feature);
                return;
            }

            try {
                const marker = L.circleMarker(
                    [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
                    {
                        ...pointStyle,
                        pane: 'estaciones-pane' // Asegurar que use el pane correcto
                    }
                ).bindPopup(
                    Object.entries(feature.properties || {})
                        .map(([key, value]) => `<b>${key}:</b> ${value}`)
                        .join('<br>')
                );
                markers.addLayer(marker);
            } catch (error) {
                console.error('Error creando marcador:', error);
            }
        });

        map.addLayer(markers);
        console.log('Capas de cluster añadidas al mapa'); // Debug

        return () => {
            if (map && markers) {
                map.removeLayer(markers);
                console.log('Capas de cluster removidas'); // Debug
            }
        };
    }, [map, data, pointStyle]);

    return null;
};

export default MarkerCluster;