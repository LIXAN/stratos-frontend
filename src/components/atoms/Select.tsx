import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
    value: string;
    label: string | React.ReactNode;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export const Select: React.FC<SelectProps> = ({
    value,
    onChange,
    options,
    placeholder = "Seleccionar...",
    required,
    disabled,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div
                className={`w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 flex items-center justify-between cursor-pointer outline-none theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 transition-colors focus-within:ring-2 focus-within:ring-saas-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                tabIndex={disabled ? -1 : 0}
            >
                <span className={selectedOption ? '' : 'text-gray-400 theme-light:text-slate-400 truncate pr-4 block'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg className={`h-4 w-4 text-gray-400 theme-light:text-slate-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>

            {required && (
                <input
                    type="text"
                    className="h-0 w-0 opacity-0 absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
                    value={value || ''}
                    required
                    onChange={() => { }}
                    tabIndex={-1}
                />
            )}

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-dark-800 border border-white/10 rounded-lg shadow-xl py-1 max-h-60 overflow-auto theme-light:bg-white theme-light:border-slate-200 shadow-black/50 theme-light:shadow-slate-300/50 outline-none">
                    {options.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 italic">No hay opciones</div>
                    ) : (
                        options.map(option => (
                            <div
                                key={option.value}
                                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${value === option.value ? 'bg-saas-500/20 text-saas-400 theme-light:bg-saas-50 theme-light:text-saas-700 font-medium' : 'text-gray-300 hover:bg-white/5 theme-light:text-slate-700 theme-light:hover:bg-slate-50'}`}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                {option.label}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
