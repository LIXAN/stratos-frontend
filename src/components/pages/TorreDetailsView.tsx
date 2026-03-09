import React, { useState, useEffect } from 'react';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Header } from '../organisms/Header';
import { projectService } from '../../services/api';
import ConfirmModal from '../atoms/ConfirmModal';
import AlertModal from '../atoms/AlertModal';
import { PisoModal } from '../organisms/PisoModal';

interface TorreDetailsViewProps {
    projectId: string;
    torreId: string;
    project: any;
    onBack: () => void;
}

export const TorreDetailsView: React.FC<TorreDetailsViewProps> = ({ projectId, torreId, onBack, project }) => {
    const [torre, setTorre] = useState<any>(null);
    const [tiposDisponibles, setTiposDisponibles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPisoModalOpen, setIsPisoModalOpen] = useState(false);
    const [savingPiso, setSavingPiso] = useState(false);
    const [editingPiso, setEditingPiso] = useState<any>(null);

    const [pisoToDelete, setPisoToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, message: string, isError: boolean }>({
        isOpen: false, title: '', message: '', isError: true
    });

    const showAlert = (message: string, isError = true, title = "Aviso") => {
        setAlertConfig({ isOpen: true, title, message, isError });
    };

    const esCasas = project?.tipo_inmueble === 'Casas';

    const fetchTorreAndTipos = async () => {
        try {
            setLoading(true);
            const [torreData, projectData] = await Promise.all([
                projectService.getTorre(projectId, torreId),
                projectService.getProject(projectId)
            ]);
            setTorre(torreData);
            setTiposDisponibles(projectData.tipos_plantilla || []);
        } catch (error) {
            console.error("Error fetching torre data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTorreAndTipos();
    }, [projectId, torreId]);

    const handleCreateOrUpdatePiso = async (data: any) => {
        try {
            setSavingPiso(true);
            if (editingPiso) {
                await projectService.updatePiso(projectId, torreId, editingPiso.id, data);
            } else {
                await projectService.createPiso(projectId, torreId, data);
            }
            setIsPisoModalOpen(false);
            fetchTorreAndTipos();
        } catch (error: any) {
            console.error("Error saving piso", error);
            if (error.response?.data?.detail) {
                showAlert(`Error: ${error.response.data.detail}`);
            } else {
                showAlert("Ocurrió un error al guardar el piso.");
            }
        } finally {
            setSavingPiso(false);
        }
    };

    const handleEditPisoClick = (piso: any) => {
        setEditingPiso(piso);
        setIsPisoModalOpen(true);
    };

    const handleDeletePisoClick = (pisoId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setPisoToDelete(pisoId);
    };

    const confirmDeletePiso = async () => {
        if (!pisoToDelete) return;
        setDeleting(true);
        try {
            await projectService.deletePiso(projectId, torreId, pisoToDelete);
            fetchTorreAndTipos();
        } catch (error) {
            console.error("Error deleting piso", error);
            showAlert("Hubo un error al eliminar el piso.");
        } finally {
            setDeleting(false);
            setPisoToDelete(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Cargando detalles de la torre...</div>;
    if (!torre) return <div className="p-8 text-center text-red-500">Error al cargar la torre.</div>;

    const totalPisosAgregados = torre.pisos ? torre.pisos.length : 0;
    const progressPisos = (totalPisosAgregados / torre.numero_pisos) * 100;


    return (
        <div className="animate-fade-in flex-1 flex flex-col relative w-full h-full">
            <Header
                title={`${esCasas ? 'Manzana' : 'Torre'}: ${torre.nombre}`}
                subtitle={esCasas ? `${torre.numero_aptos} Casas` : `Objetivo: ${torre.numero_pisos} Pisos | ${torre.numero_aptos} Aptos`}
                actionLabel={esCasas ? (totalPisosAgregados === 0 ? "Configurar Distribución" : "Editar Distribución") : "+ Agregar Piso"}
                onAction={() => {
                    if (esCasas && totalPisosAgregados > 0) {
                        setEditingPiso(torre.pisos[0]);
                    } else {
                        setEditingPiso(null);
                    }
                    setIsPisoModalOpen(true);
                }}
            />

            <div className="p-8 space-y-8">
                <Button variant="ghost" onClick={onBack} className="mb-4">
                    ← Volver al Proyecto
                </Button>

                {!esCasas && (
                    <div className="glass-card theme-light:bg-white theme-light:border-slate-200 theme-light:shadow-slate-200/50 p-6 rounded-2xl">
                        <Typography variant="h2" className="mb-4">Progreso de Configuración</Typography>
                        <div className="flex justify-between text-sm text-gray-400 mb-2 theme-light:text-slate-500">
                            <span>Pisos Configurados: {totalPisosAgregados} / {torre.numero_pisos}</span>
                            <span>{Math.round(progressPisos)}%</span>
                        </div>
                        <div className="w-full bg-dark-900 rounded-full h-2.5 theme-light:bg-slate-100">
                            <div className="bg-saas-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(progressPisos, 100)}%` }}></div>
                        </div>
                    </div>
                )}

                <div className="glass-card theme-light:bg-white theme-light:border-slate-200 theme-light:shadow-slate-200/50 p-6 rounded-2xl">
                    <Typography variant="h2" className="mb-6">{esCasas ? 'Distribución' : 'Pisos de la Torre'}</Typography>

                    {totalPisosAgregados === 0 ? (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-white/10 rounded-xl theme-light:border-slate-300 theme-light:text-slate-500">
                            Aún no hay {esCasas ? 'casas configuradas' : 'pisos configurados'} en esta {esCasas ? 'manzana' : 'torre'}.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {torre.pisos.sort((a: any, b: any) => b.numero_nivel - a.numero_nivel).map((piso: any) => (
                                <div key={piso.id} className="bg-dark-900 border border-white/10 p-4 rounded-xl flex items-center justify-between theme-light:bg-slate-50 theme-light:border-slate-200 group">
                                    <div>
                                        <h3 className="text-lg font-bold text-white theme-light:text-slate-800 flex flex-wrap items-center gap-2">
                                            <span>{esCasas ? `Total ${piso.cantidad_aptos} Casas` : `Piso ${piso.numero_nivel}`}</span>
                                            {piso.zona_social && Array.isArray(piso.zona_social) && piso.zona_social.map((zona: string, idx: number) => (
                                                <span key={idx} className="text-xs bg-saas-500/20 text-saas-400 px-2 py-0.5 rounded-full theme-light:bg-saas-100 theme-light:text-saas-700 whitespace-nowrap">
                                                    {zona}
                                                </span>
                                            ))}
                                            {/* Retrocompatibilidad con strings viejos */}
                                            {piso.zona_social && typeof piso.zona_social === 'string' && (
                                                <span className="text-xs bg-saas-500/20 text-saas-400 px-2 py-0.5 rounded-full theme-light:bg-saas-100 theme-light:text-saas-700 whitespace-nowrap">
                                                    {piso.zona_social}
                                                </span>
                                            )}
                                        </h3>
                                        {!esCasas && <span className="text-sm text-gray-400 theme-light:text-slate-500">{piso.cantidad_aptos} Apartamentos</span>}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        {!esCasas && (
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => handleDeletePisoClick(piso.id, e)} className="text-gray-500 hover:text-red-500 p-1.5 bg-dark-800 rounded-md theme-light:bg-white theme-light:shadow-sm" title="Eliminar Piso">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        )}
                                        <button onClick={() => handleEditPisoClick(piso)} className="text-saas-500 hover:text-saas-400 font-medium theme-light:text-saas-600">
                                            Gestionar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <PisoModal
                isOpen={isPisoModalOpen}
                onClose={() => setIsPisoModalOpen(false)}
                onSubmit={handleCreateOrUpdatePiso}
                loading={savingPiso}
                tiposDisponibles={tiposDisponibles}
                initialData={editingPiso}
                projectId={projectId}
                torreId={torreId}
                esCasas={esCasas}
            />

            <ConfirmModal
                isOpen={pisoToDelete !== null}
                onClose={() => setPisoToDelete(null)}
                onConfirm={confirmDeletePiso}
                title="Eliminar Piso"
                message="¿Estás seguro de que deseas eliminar este Piso? Se destruirán todos los apartamentos contenidos en él y se restarán del total de la Torre."
                loading={deleting}
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
