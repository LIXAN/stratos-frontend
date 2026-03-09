import React, { useState, useEffect } from 'react';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { getFullImageUrl } from '../../services/api';

interface TipoPlantillaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    loading: boolean;
    initialData?: any;
    error?: string | null;
}

export const TipoPlantillaModal: React.FC<TipoPlantillaModalProps> = ({ isOpen, onClose, onSubmit, loading, initialData, error }) => {
    const [nombre, setNombre] = useState(initialData?.nombre || '');
    const [areaConstruida, setAreaConstruida] = useState<number | ''>(initialData?.area_construida || '');
    const [areaPrivada, setAreaPrivada] = useState<number | ''>(initialData?.area_privada || '');
    const [habitaciones, setHabitaciones] = useState<number | ''>(initialData?.habitaciones || '');
    const [banos, setBanos] = useState<number | ''>(initialData?.banos || '');
    const [imagenUrl, setImagenUrl] = useState(initialData?.imagen_url || '');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setNombre(initialData.nombre);
            setAreaConstruida(initialData.area_construida);
            setAreaPrivada(initialData.area_privada);
            setHabitaciones(initialData.habitaciones);
            setBanos(initialData.banos);
            setImagenUrl(initialData.imagen_url || '');
            setImageFile(null);
            setImagePreview(null);
        } else {
            setNombre(''); setAreaConstruida(''); setAreaPrivada(''); setHabitaciones(''); setBanos(''); setImagenUrl(''); setImageFile(null); setImagePreview(null);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-dark-900/90 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative theme-light:bg-white theme-light:border-slate-200">
                <Typography variant="h2" className="mb-4">{initialData ? 'Editar Tipo' : 'Nuevo Tipo'}</Typography>
                <form onSubmit={e => {
                    e.preventDefault();
                    onSubmit({
                        nombre,
                        area_construida: Number(areaConstruida),
                        area_privada: Number(areaPrivada),
                        habitaciones: Number(habitaciones),
                        banos: Number(banos),
                        imagen_url: imagenUrl,
                        imageFile: imageFile
                    });
                }}>
                    {error && (
                        <div className="mb-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg theme-light:bg-red-50 theme-light:border-red-200">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Nombre del Tipo</label>
                            <input className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-saas-500 outline-none theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white theme-light:placeholder-slate-400" placeholder="Ej. Tipo A" value={nombre} onChange={e => setNombre(e.target.value)} required />
                        </div>
                        <div className="flex space-x-2">
                            <div className="w-1/2">
                                <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Área Construida (m²)</label>
                                <input type="number" step="0.01" className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-saas-500 outline-none theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white theme-light:placeholder-slate-400" placeholder="" value={areaConstruida} onChange={e => setAreaConstruida(e.target.value ? Number(e.target.value) : '')} required min="0" />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Área Privada (m²)</label>
                                <input type="number" step="0.01" className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-saas-500 outline-none theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white theme-light:placeholder-slate-400" placeholder="" value={areaPrivada} onChange={e => setAreaPrivada(e.target.value ? Number(e.target.value) : '')} required min="0" />
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <div className="w-1/2">
                                <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Habitaciones</label>
                                <input type="number" className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-saas-500 outline-none theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white theme-light:placeholder-slate-400" placeholder="" value={habitaciones} onChange={e => setHabitaciones(e.target.value ? Number(e.target.value) : '')} required min="1" />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Baños</label>
                                <input type="number" className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-saas-500 outline-none theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white theme-light:placeholder-slate-400" placeholder="" value={banos} onChange={e => setBanos(e.target.value ? Number(e.target.value) : '')} required min="1" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Imagen del Tipo (Opcional)</label>
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center justify-center w-full min-h-[100px] border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-saas-500/50 transition-colors bg-dark-900/50 theme-light:bg-slate-50 theme-light:border-slate-300 theme-light:hover:border-saas-500">
                                    {imagePreview || imagenUrl ? (
                                        <div className="relative w-full p-2 h-32 flex items-center justify-center">
                                            <img src={imagePreview || getFullImageUrl(imagenUrl)} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6">
                                            <svg className="w-8 h-8 text-gray-400 mb-2 theme-light:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                            <p className="text-sm text-gray-400 theme-light:text-slate-500">Click para subir foto del plano</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setImageFile(e.target.files[0]);
                                                setImagePreview(URL.createObjectURL(e.target.files[0]));
                                                setImagenUrl(''); // Clear URL if file is selected
                                            }
                                        }}
                                    />
                                </label>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500 whitespace-nowrap">o usa Link:</span>
                                    <input
                                        type="text"
                                        value={imagenUrl}
                                        onChange={(e) => {
                                            setImagenUrl(e.target.value);
                                            // Clear file if URL is provided
                                            if (e.target.value) {
                                                setImageFile(null);
                                                setImagePreview(null);
                                            }
                                        }}
                                        className="flex-1 bg-dark-900 border border-white/10 text-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-saas-500 transition-all text-sm theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white"
                                        placeholder="https://ejemplo.com/plano.jpg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : (initialData ? 'Actualizar Tipo' : 'Crear Tipo')}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
