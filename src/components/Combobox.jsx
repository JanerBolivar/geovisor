import { useState } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

export const Combobox = ({ options = [], selectedOption, onSelect, placeholder = "Seleccionar..." }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Manejo seguro de options undefined o null
    const safeOptions = Array.isArray(options) ? options : [];
    const selectedLabel = safeOptions.find(opt => opt.value === selectedOption)?.label || placeholder;

    return (
        <div className="relative w-full">
            <button
                className="w-full flex items-center justify-between p-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={selectedOption ? "text-gray-800" : "text-gray-500"}>
                    {selectedLabel}
                </span>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
            </button>

            {isOpen && safeOptions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 border border-gray-200 max-h-60 overflow-auto">
                    {safeOptions.map((option) => (
                        <button
                            key={option.value}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-blue-50 ${selectedOption === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                            onClick={() => {
                                onSelect(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                            {selectedOption === option.value && (
                                <Check className="h-4 w-4 text-blue-500" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};