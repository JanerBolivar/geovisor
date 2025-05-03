import axios from 'axios';

const BASE_URL = 'http://131.100.50.247:8085/geoserver/proyecto_lineab/ows';

// Lista de capas disponibles
export const AVAILABLE_LAYERS = {
    CENTROSPOBLADOS: 'centro_poblado',
    DEPARTAMENTOS: 'departamento',
    ESTACIONES: 'estacion',
    MUNICIPIOS: 'municipio',
    VEREDAS: 'vereda'
};

// Función para obtener una capa específica
export const fetchGeoJSONLayer = async (layerName) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                service: 'WFS',
                version: '1.0.0',
                request: 'GetFeature',
                typeName: `proyecto_lineab:${layerName}`,
                outputFormat: 'application/json'
            },
            timeout: 15000 // 15 segundos de timeout
        });

        if (response.status !== 200) {
            throw new Error(`Error al obtener la capa ${layerName}: ${response.statusText}`);
        }

        return response.data;
    } catch (error) {
        console.error(`Error en fetchGeoJSONLayer (${layerName}):`, error);
        throw new Error(`No se pudo cargar la capa ${layerName}. Por favor, intente más tarde.`);
    }
};

// Función para obtener múltiples capas a la vez
export const fetchMultipleLayers = async (layerNames) => {
    const requests = layerNames.map(layer =>
        fetchGeoJSONLayer(layer).catch(error => {
            console.error(`Error al cargar ${layer}:`, error);
            return { layer, error: error.message };
        })
    );

    const results = await Promise.all(requests);

    return results.reduce((acc, result, index) => {
        if (result.error) {
            console.error(`Error en capa ${layerNames[index]}:`, result.error);
            return acc;
        }
        return { ...acc, [layerNames[index]]: result };
    }, {});
};