/**
 * Servicio para gestionar los registros de usuarios en estaciones
 */

// Configuración de conexión a GeoServer
import { baseUrl, workspace, layerName, namespaceUri, username, password } from '../config/envs';

// URL completa para transacciones WFS
const WFS_TRANSACTION_URL = `${baseUrl}/${workspace}/ows?service=WFS&version=1.1.0&request=Transaction`;

/**
 * Función para escapar caracteres especiales en XML
 * @param {*} value - Valor a convertir y escapar
 * @returns {string} - Cadena escapada para XML
 */
function encodeXML(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Analiza la respuesta XML para verificar si la transacción fue exitosa
 * @param {string} xmlResponse - Respuesta XML de GeoServer
 * @returns {Object} - Resultados del análisis
 */
function parseWFSResponse(xmlResponse) {
    try {
        // Verificar si hay excepciones o errores
        if (xmlResponse.includes('ServiceExceptionReport') ||
            xmlResponse.includes('ServiceException') ||
            xmlResponse.includes('ExceptionReport') ||
            xmlResponse.includes('ExceptionText')) {

            // Extraer mensaje de error
            let errorMatch = xmlResponse.match(/<ExceptionText>(.*?)<\/ExceptionText>/s) ||
                xmlResponse.match(/<ServiceException>(.*?)<\/ServiceException>/s) ||
                xmlResponse.match(/<ows:ExceptionText>(.*?)<\/ows:ExceptionText>/s);

            let errorMsg = errorMatch ? errorMatch[1].trim() : 'Error desconocido en GeoServer';
            return { success: false, message: errorMsg };
        }

        // Verificar transacción exitosa
        const insertSuccess = xmlResponse.includes('totalInserted="1"') ||
            /<wfs:totalInserted>1<\/wfs:totalInserted>/.test(xmlResponse);

        if (insertSuccess) {
            return { success: true, message: 'Registro completado exitosamente' };
        } else {
            return { success: false, message: 'No se confirmó la inserción del registro' };
        }
    } catch (error) {
        return { success: false, message: 'Error al procesar la respuesta del servidor' };
    }
}

/**
 * Registra un usuario en una estación mediante WFS-T
 * @param {Object} userData - {nombre, apellido, correo}
 * @param {Object} estacionData - Datos de la estación
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const registrarUsuarioEnEstacion = async (userData, estacionData) => {
    try {
        // Validación de parámetros
        if (!userData || !estacionData) {
            throw new Error('Datos de entrada incompletos');
        }

        // Validar y normalizar datos del usuario
        const datosUsuario = {
            nombre: userData.nombre?.trim() || '',
            apellido: userData.apellido?.trim() || '',
            correo: userData.correo?.trim() || ''
        };

        // Validar campos obligatorios
        if (!datosUsuario.nombre || !datosUsuario.apellido || !datosUsuario.correo) {
            throw new Error('Nombre, apellido y correo son obligatorios');
        }

        // Validar formato de correo
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosUsuario.correo)) {
            throw new Error('Formato de correo electrónico inválido');
        }

        // Validar y normalizar coordenadas
        const latitud = parseFloat(estacionData.latitud);
        const longitud = parseFloat(estacionData.longitud);

        if (isNaN(latitud) || isNaN(longitud)) {
            throw new Error('Coordenadas de la estación inválidas');
        }

        // Construir el XML para la transacción WFS-T
        const transactionXML = `<?xml version="1.0" encoding="UTF-8"?>
<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs"
                 xmlns:gml="http://www.opengis.net/gml"
                 xmlns:${workspace}="${namespaceUri}"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 version="1.1.0"
                 service="WFS">
  <wfs:Insert>
    <${workspace}:${layerName}>
      <${workspace}:nombre>${encodeXML(datosUsuario.nombre)}</${workspace}:nombre>
      <${workspace}:apellido>${encodeXML(datosUsuario.apellido)}</${workspace}:apellido>
      <${workspace}:correo>${encodeXML(datosUsuario.correo)}</${workspace}:correo>
      <${workspace}:estacion_id>${encodeXML(estacionData.cod_emt || '')}</${workspace}:estacion_id>
      <${workspace}:estacion_nombre>${encodeXML(estacionData.nom_emt || '')}</${workspace}:estacion_nombre>
      <${workspace}:fecha_registro>${new Date().toISOString()}</${workspace}:fecha_registro>
      <${workspace}:geom>
        <gml:Point srsName="EPSG:4326">
          <gml:pos>${longitud} ${latitud}</gml:pos>
        </gml:Point>
      </${workspace}:geom>
    </${workspace}:${layerName}>
  </wfs:Insert>
</wfs:Transaction>`;

        // Configurar y enviar la petición
        const response = await fetch(WFS_TRANSACTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml',
                'Accept': 'application/xml',
                'Authorization': 'Basic ' + btoa(`${username}:${password}`)
            },
            body: transactionXML,
            credentials: 'include',
            mode: 'cors'
        });

        // Procesar la respuesta
        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(`GeoServer respondió con estado ${response.status}`);
        }

        // Analizar respuesta para verificar si la inserción fue exitosa
        const result = parseWFSResponse(responseText);

        if (!result.success) {
            throw new Error(result.message || 'Error al procesar la transacción en GeoServer');
        }

        return {
            success: true,
            message: result.message,
            data: responseText
        };

    } catch (error) {
        throw new Error(`Error al registrar usuario: ${error.message}`);
    }
};

export default {
    registrarUsuarioEnEstacion
};