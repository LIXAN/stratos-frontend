import React, { useState, useEffect } from 'react';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { rrhhService } from '../../services/api';
import ConfirmModal from '../atoms/ConfirmModal';
import AlertModal from '../atoms/AlertModal';

interface CargoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CargoModal: React.FC<CargoModalProps> = ({ isOpen, onClose }) => {
    const [cargos, setCargos] = useState<any[]>([]);
    const [newCargoName, setNewCargoName] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    // Edit state
    const [editingCargoId, setEditingCargoId] = useState<string | null>(null);
    const [editCargoName, setEditCargoName] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Delete state
    const [cargoToDelete, setCargoToDelete] = useState<string | null>(null);

    const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, message: string, isError: boolean }>({
        isOpen: false, title: '', message: '', isError: true
    });

    const showAlert = (message: string, isError = true, title = "Aviso") => {
        setAlertConfig({ isOpen: true, title, message, isError });
    };

    useEffect(() => {
        if (isOpen) {
            loadCargos();
            setNewCargoName('');
        }
    }, [isOpen]);

    const loadCargos = async () => {
        setLoading(true);
        try {
            const data = await rrhhService.getCargos();
            setCargos(data);
        } catch (error) {
            console.error("Error cargando cargos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCargo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCargoName.trim()) return;
        setSaving(true);
        try {
            const newCargo = await rrhhService.createCargo({ nombre: newCargoName.trim() });
            setCargos(prev => [...prev, newCargo]);
            setNewCargoName('');
        } catch (error: any) {
            console.error("Error creando cargo:", error);
            showAlert(error.response?.data?.detail || "No se pudo crear el cargo. Puede que ya exista.");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateCargo = async (id: string) => {
        if (!editCargoName.trim()) {
            setEditingCargoId(null);
            return;
        }
        setActionLoading(id);
        try {
            const updated = await rrhhService.updateCargo(id, { nombre: editCargoName.trim() });
            setCargos(prev => prev.map(c => c.id === id ? updated : c));
            setEditingCargoId(null);
        } catch (error: any) {
            console.error("Error actualizando cargo:", error);
            showAlert(error.response?.data?.detail || "No se pudo actualizar el cargo. Puede que ya exista.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteCargo = async () => {
        if (!cargoToDelete) return;
        setActionLoading(cargoToDelete);
        try {
            await rrhhService.deleteCargo(cargoToDelete);
            setCargos(prev => prev.filter(c => c.id !== cargoToDelete));
            setCargoToDelete(null);
        } catch (error: any) {
            console.error("Error eliminando cargo:", error);
            showAlert(error.response?.data?.detail || "No se pudo eliminar el cargo. Es posible que esté en uso.");
            setCargoToDelete(null);
        } finally {
            setActionLoading(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-dark-900/90 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative theme-light:bg-white theme-light:border-slate-200">
                <Typography variant="h2" className="mb-4">Gestionar Cargos</Typography>

                <form onSubmit={handleCreateCargo} className="flex gap-2 mb-6">
                    <input
                        className="flex-1 bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-saas-500 outline-none theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white theme-light:placeholder-slate-400"
                        placeholder="Nombre del nuevo cargo..."
                        value={newCargoName}
                        onChange={e => setNewCargoName(e.target.value)}
                        disabled={saving}
                    />
                    <Button type="submit" disabled={saving || !newCargoName.trim()}>
                        {saving ? 'Añadiendo...' : 'Añadir'}
                    </Button>
                </form>

                <div className="mb-6">
                    <Typography variant="h3" className="mb-3 text-sm text-gray-400 theme-light:text-slate-500">Cargos Existentes</Typography>
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-saas-500"></div>
                        </div>
                    ) : cargos.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 theme-light:text-slate-400 italic">No hay cargos registrados.</div>
                    ) : (
                        <div className="bg-dark-900 border border-white/5 rounded-lg max-h-60 overflow-y-auto theme-light:bg-slate-50 theme-light:border-slate-200">
                            <ul className="divide-y divide-white/5 theme-light:divide-slate-200">
                                {cargos.map((cargo) => (
                                    <li key={cargo.id} className="p-3 text-white theme-light:text-slate-800 flex justify-between items-center group hover:bg-white/5 theme-light:hover:bg-slate-100 transition-colors">
                                        {editingCargoId === cargo.id ? (
                                            <div className="flex w-full gap-2 pr-2">
                                                <input
                                                    className="flex-1 bg-dark-900 border border-saas-500 text-white rounded px-2 py-1 outline-none theme-light:bg-white theme-light:border-saas-500 theme-light:text-slate-900"
                                                    value={editCargoName}
                                                    onChange={e => setEditCargoName(e.target.value)}
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleUpdateCargo(cargo.id);
                                                        if (e.key === 'Escape') setEditingCargoId(null);
                                                    }}
                                                />
                                                <button disabled={actionLoading === cargo.id} onClick={() => handleUpdateCargo(cargo.id)} className="text-saas-400 hover:text-saas-300 px-2 py-1 bg-saas-500/10 rounded theme-light:text-saas-600 theme-light:hover:bg-saas-50">OK</button>
                                                <button disabled={actionLoading === cargo.id} onClick={() => setEditingCargoId(null)} className="text-gray-400 hover:text-white px-2 py-1 bg-white/5 rounded theme-light:text-slate-500 theme-light:hover:bg-slate-200">X</button>
                                            </div>
                                        ) : (
                                            <>
                                                <span>{cargo.nombre}</span>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingCargoId(cargo.id);
                                                            setEditCargoName(cargo.nombre);
                                                        }}
                                                        disabled={actionLoading !== null}
                                                        className="text-gray-400 hover:text-saas-400 p-1 transition-colors theme-light:text-slate-400 theme-light:hover:text-saas-600"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setCargoToDelete(cargo.id)}
                                                        disabled={actionLoading !== null}
                                                        className="text-gray-400 hover:text-red-400 p-1 transition-colors theme-light:text-slate-400 theme-light:hover:text-red-500"
                                                        title="Eliminar"
                                                    >
                                                        {actionLoading === cargo.id ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <Button type="button" variant="ghost" onClick={onClose}>Cerrar</Button>
                </div>
            </div>

            <ConfirmModal
                isOpen={cargoToDelete !== null}
                onClose={() => setCargoToDelete(null)}
                onConfirm={handleDeleteCargo}
                title="Eliminar Cargo"
                message="¿Estás seguro de que deseas eliminar este cargo permanentemente? Esta acción no se puede deshacer."
                loading={actionLoading !== null}
            />

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                title={alertConfig.title}
                message={alertConfig.message}
                isError={alertConfig.isError}
            />
        </div>
    );
};
