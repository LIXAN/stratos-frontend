import React, { useState } from 'react';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';

interface TorreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    loading: boolean;
    esCasas: boolean;
    initialData?: any;
}

export const TorreModal: React.FC<TorreModalProps> = ({ isOpen, onClose, onSubmit, loading, esCasas, initialData }) => {
    const [nombre, setNombre] = useState('');
    const [pisos, setPisos] = useState<number | ''>('');

    React.useEffect(() => {
        if (initialData) {
            setNombre(initialData.nombre);
            setPisos(initialData.numero_pisos);
        } else {
            setNombre('');
            setPisos('');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-dark-900/90 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative theme-light:bg-white theme-light:border-slate-200">
                <Typography variant="h2" className="mb-4">{initialData ? 'Editar' : 'Nueva'} {esCasas ? 'Manzana' : 'Torre'}</Typography>
                <form onSubmit={e => { e.preventDefault(); onSubmit({ nombre, numero_pisos: esCasas ? 1 : Number(pisos) }); }}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Nombre de la {esCasas ? 'Manzana' : 'Torre'}</label>
                            <input className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-saas-500 outline-none theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white theme-light:placeholder-slate-400" placeholder={esCasas ? "Ej. Manzana 1" : "Ej. Torre 1"} value={nombre} onChange={e => setNombre(e.target.value)} required />
                        </div>
                        {!esCasas && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Número de Pisos</label>
                                <input type="number" className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-saas-500 outline-none theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white theme-light:placeholder-slate-400" placeholder="" value={pisos} onChange={e => setPisos(e.target.value ? Number(e.target.value) : '')} required min="1" />
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : (initialData ? 'Guardar Cambios' : `Crear ${esCasas ? 'Manzana' : 'Torre'}`)}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
