import { useState, useEffect } from 'react';
import { fetchGeoJSONLayer } from '../services/geoServerService';

export const useGeoServerLayers = (activeLayers) => {
    const [layers, setLayers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadLayers = async () => {
            // Lógica de carga similar a la del componente
        };

        loadLayers();
    }, [activeLayers]);

    return { layers, loading, error };
};