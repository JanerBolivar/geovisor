import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const RegistroModal = ({ isOpen, onClose, onSubmit, estacionNombre }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        correo: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio';
        }

        if (!formData.apellido.trim()) {
            newErrors.apellido = 'El apellido es obligatorio';
        }

        if (!formData.correo.trim()) {
            newErrors.correo = 'El correo es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
            newErrors.correo = 'El correo no es válido';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error al registrar:', error);
            setErrors({ submit: 'Error al enviar el registro. Inténtalo de nuevo.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">

            {/* Contenido del modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200">
                {/* Encabezado */}
                <div className="bg-blue-600 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-white">
                            Registro para: {estacionNombre}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-blue-200 focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Cuerpo del formulario */}
                <div className="p-6 bg-white bg-opacity-200">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.nombre
                                        ? 'border-red-500 focus:ring-red-200'
                                        : 'border-gray-300 focus:ring-blue-200'
                                    } text-gray-800`}
                                placeholder="Ingrese su nombre"
                            />
                            {errors.nombre && (
                                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                            )}
                        </div>

                        <div className="mb-5">
                            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
                                Apellido
                            </label>
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.apellido
                                        ? 'border-red-500 focus:ring-red-200'
                                        : 'border-gray-300 focus:ring-blue-200'
                                    } text-gray-800`}
                                placeholder="Ingrese su apellido"
                            />
                            {errors.apellido && (
                                <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-2">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                id="correo"
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.correo
                                        ? 'border-red-500 focus:ring-red-200'
                                        : 'border-gray-300 focus:ring-blue-200'
                                    } text-gray-800`}
                                placeholder="Ingrese su correo electrónico"
                            />
                            {errors.correo && (
                                <p className="mt-1 text-sm text-red-600">{errors.correo}</p>
                            )}
                        </div>

                        {errors.submit && (
                            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                                <p className="text-sm">{errors.submit}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </span>
                                ) : (
                                    'Guardar'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RegistroModal;