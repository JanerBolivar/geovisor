import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

const ModalDepartamento = ({ departamento, isOpen, onClose }) => {
    if (!departamento) return null;

    return (
        <Transition appear show={isOpen} as="div">
            <Dialog as="div" className="relative z-[2000]" onClose={onClose}>
                <Transition.Child
                    as="div"
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as="div"
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                {/* Cabecera */}
                                <div className="flex justify-between items-center p-4 border-b">
                                    <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                                        {departamento.nombre}
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="p-1 rounded-md hover:bg-gray-100"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                {/* Contenido */}
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Imagen del departamento */}
                                        <div className="w-full md:w-1/2">
                                            <img
                                                src={`/images/departamentos/${departamento.codigo}.jpg`}
                                                alt={`Mapa de ${departamento.nombre}`}
                                                className="w-full h-auto rounded-lg shadow"
                                                onError={(e) => {
                                                    e.target.src = '/images/departamentos/default.jpg';
                                                }}
                                            />
                                        </div>

                                        {/* Información */}
                                        <div className="w-full md:w-1/2 space-y-4">
                                            <div>
                                                <h4 className="font-medium text-gray-700">Información General</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {departamento.descripcion || 'Información no disponible'}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Capital</p>
                                                    <p className="font-medium">{departamento.capital || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Población</p>
                                                    <p className="font-medium">{departamento.poblacion || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Área</p>
                                                    <p className="font-medium">
                                                        {departamento.area ? `${departamento.area} km²` : '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Temperatura Promedio</p>
                                                    <p className="font-medium">
                                                        {departamento.temperatura ? `${departamento.temperatura}°C` : '-'}
                                                    </p>
                                                </div>
                                            </div>

                                            {departamento.estaciones && (
                                                <div>
                                                    <h4 className="font-medium text-gray-700">Estaciones de Monitoreo</h4>
                                                    <ul className="mt-2 space-y-1 text-sm">
                                                        {departamento.estaciones.map((estacion, index) => (
                                                            <li key={index} className="flex items-center">
                                                                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                                                                {estacion.nombre} ({estacion.temperatura}°C)
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Pie */}
                                <div className="bg-gray-50 px-4 py-3 flex justify-end border-t">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ModalDepartamento;