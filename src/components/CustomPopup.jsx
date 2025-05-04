import React from 'react';
import L from 'leaflet';
import ReactDOM from 'react-dom/client';

// Componente para mostrar la información del polígono
const CustomPopup = ({ feature, layerType }) => {
    // Definición de los campos a mostrar según el tipo de capa
    const fieldMappings = {
        departamentos: [
            { key: 'cod_depart', label: 'Código Departamento' },
            { key: 'nom_depart', label: 'Nombre' },
            { key: 'area_depar', label: 'Área (km²)', isArea: true },
            { key: 'cap_depart', label: 'Capital' },
        ],
        municipios: [
            { key: 'cod_muni', label: 'Código Municipio' },
            { key: 'nom_muni', label: 'Nombre' },
            { key: 'area_muni', label: 'Área (km²)', isArea: true },
            { key: 'cod_depart', label: 'Código Departamento' },
        ],
        veredas: [
            { key: 'cod_vereda', label: 'Código Vereda' },
            { key: 'nom_vereda', label: 'Nombre' },
            { key: 'area_vered', label: 'Área (km²)', isArea: true },
            { key: 'nom_muni', label: 'Municipio' },
            { key: 'nom_depart', label: 'Departamento' },
            { key: 'cod_muni', label: 'Código Municipio' },
            { key: 'cod_depart', label: 'Código Departamento' },
        ],
        centrosPoblados: [
            { key: 'cod_centro', label: 'Código Centro Poblado' },
            { key: 'nom_centro', label: 'Nombre' },
            { key: 'cod_muni', label: 'Código Municipio' },
            { key: 'cod_depart', label: 'Código Departamento' },
            { key: 'cod_dane', label: 'Código DANE' },
        ],
        estaciones: [
            { key: 'nombre', label: 'Nombre' },
            { key: 'tipo', label: 'Tipo' },
            { key: 'ubicacion', label: 'Ubicación' },
        ],
    };

    // Obtener los campos para el tipo de capa actual
    const fields = fieldMappings[layerType] || [];

    // Función para formatear valores de área
    const formatAreaValue = (value) => {
        if (!value) return 'No aplica';
        return parseFloat(value).toLocaleString('es-CO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Obtener el título según el tipo de capa
    const getLayerTitle = () => {
        const titles = {
            departamentos: 'Departamento',
            municipios: 'Municipio',
            veredas: 'Vereda',
            centrosPoblados: 'Centro Poblado',
            estaciones: 'Estación',
        };
        return titles[layerType] || 'Información';
    };

    // Obtener el nombre principal según el tipo de capa
    const getMainName = () => {
        const nameKeys = {
            departamentos: 'nom_depart',
            municipios: 'nom_muni',
            veredas: 'nom_vereda',
            centrosPoblados: 'nom_centro',
            estaciones: 'nombre',
        };
        const key = nameKeys[layerType];
        return feature.properties[key] || 'Sin nombre';
    };

    return (
        <div className="custom-popup">
            {/* Imagen del encabezado */}
            <div className="popup-header">
                <img
                    src="/image.jpg"
                    alt="Imagen de referencia"
                    className="popup-image"
                />
                <h3 className="popup-title">{getLayerTitle()}: {getMainName()}</h3>
            </div>

            {/* Tabla de información */}
            <div className="popup-content">
                <table className="popup-table">
                    <tbody>
                        {fields.map((field) => (
                            <tr key={field.key}>
                                <td className="field-label">{field.label}:</td>
                                <td className="field-value">
                                    {field.isArea
                                        ? formatAreaValue(feature.properties[field.key])
                                        : feature.properties[field.key] || 'No aplica'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Función para crear un popup personalizado
export const createCustomPopup = (feature, layer, layerType) => {
    layer.bindPopup(() => {
        // Crear un elemento DOM para el popup
        const popupElement = document.createElement('div');
        
        const root = ReactDOM.createRoot(popupElement);
        root.render(<CustomPopup feature={feature} layerType={layerType} />);

        return popupElement;
    }, {
        maxWidth: 300,
        className: 'custom-feature-popup'
    });
};

export default CustomPopup;