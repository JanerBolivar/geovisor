import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Componente para agrupar marcadores en clusters
const MarkerCluster = ({ map, data, pointToLayer }) => {
    useEffect(() => {
        if (!map || !data) return;

        // Crear un grupo de marcadores clusterizados
        const markers = L.markerClusterGroup({
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            spiderfyOnMaxZoom: true,
            removeOutsideVisibleBounds: true,
            maxClusterRadius: 80,
            iconCreateFunction: (cluster) => {
                const count = cluster.getChildCount();
                // Personalizar el icono del cluster según la cantidad de marcadores
                let size = 'small';
                if (count > 50) size = 'large';
                else if (count > 10) size = 'medium';

                return L.divIcon({
                    html: `<div class="cluster-marker ${size}"><span>${count}</span></div>`,
                    className: 'custom-cluster-icon',
                    iconSize: L.point(40, 40)
                });
            }
        });

        // Crear marcadores GeoJSON y añadirlos al cluster
        const geoJsonLayer = L.geoJSON(data, {
            pointToLayer: pointToLayer || ((feature, latlng) => {
                // Si no se proporciona una función personalizada, usar marcador por defecto
                return L.circleMarker(latlng, {
                    radius: 6,
                    fillColor: '#ff3366',
                    color: '#333',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            })
        });

        // Añadir los marcadores al cluster y el cluster al mapa
        markers.addLayer(geoJsonLayer);
        map.addLayer(markers);

        // Cleanup al desmontar
        return () => {
            map.removeLayer(markers);
        };
    }, [map, data, pointToLayer]);

    return null;
};

export default MarkerCluster;