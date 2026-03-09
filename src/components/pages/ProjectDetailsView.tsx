import React, { useState, useEffect } from 'react';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Header } from '../organisms/Header';
import { projectService, getFullImageUrl } from '../../services/api';
import { TorreDetailsView } from './TorreDetailsView';
import ConfirmModal from '../atoms/ConfirmModal';
import { TorreModal } from '../organisms/TorreModal';
import { TipoPlantillaModal } from '../organisms/TipoPlantillaModal';
import { ProjectModal } from '../organisms/ProjectModal';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return <div className="p-8 text-red-500 font-mono bg-dark-900 absolute inset-0 z-50">
                <h2>React Crash Info:</h2>
                <pre>{this.state.error?.message}</pre>
                <pre>{this.state.error?.stack}</pre>
            </div>;
        }
        return this.props.children;
    }
}

interface ProjectDetailsViewProps {
    projectId: string;
    onBack: () => void;
}

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = (props) => {
    return (
        <ErrorBoundary>
            <ProjectDetailsViewContent {...props} />
        </ErrorBoundary>
    );
};

const ProjectDetailsViewContent: React.FC<ProjectDetailsViewProps> = ({ projectId, onBack }) => {
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isTorreModalOpen, setIsTorreModalOpen] = useState(false);
    const [isTipoModalOpen, setIsTipoModalOpen] = useState(false);
    const [savingTorre, setSavingTorre] = useState(false); // Added this line

    // Novedad: Control de la vista descendente de Torre
    const [selectedTorreId, setSelectedTorreId] = useState<string | null>(null);

    const [savingTipo, setSavingTipo] = useState(false);
    const [editingTipo, setEditingTipo] = useState<any>(null);
    const [tipoModalError, setTipoModalError] = useState<string | null>(null);

    const [torreToDelete, setTorreToDelete] = useState<string | null>(null);
    const [tipoToDelete, setTipoToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [editingImage, setEditingImage] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState('');
    const [savingImage, setSavingImage] = useState(false);

    const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const data = await projectService.getProject(projectId);
            setProject(data);
            setTempImageUrl(data.imagen_url || '');
        } catch (error) {
            console.error("Error fetching project", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedTorreId) {
            fetchProject();
        }
    }, [projectId, selectedTorreId]);

    const handleCreateTorre = async (data: any) => {
        try {
            setSavingTorre(true);
            await projectService.createTorre(projectId, data);
            setIsTorreModalOpen(false);
            fetchProject();
        } catch (error) {
            console.error("Error creating torre", error);
        } finally {
            setSavingTorre(false);
        }
    }

    const handleCreateOrUpdateTipo = async (data: any) => {
        try {
            setSavingTipo(true);
            setTipoModalError(null);

            let finalImageUrl = data.imagen_url;
            if (data.imageFile) {
                try {
                    const uploadRes = await projectService.uploadImageTipo(data.imageFile);
                    finalImageUrl = uploadRes.imagen_url;
                } catch (error) {
                    console.error("Error uploading image:", error);
                    alert("Hubo un error al subir la imagen. Por favor, intenta de nuevo.");
                    setSavingTipo(false);
                    return;
                }
            }

            const payload = { ...data };
            delete payload.imageFile;
            payload.imagen_url = finalImageUrl || null;

            if (editingTipo) {
                await projectService.updateTipoPlantilla(projectId, editingTipo.id, payload);
            } else {
                await projectService.createTipoPlantilla(projectId, payload);
            }
            setIsTipoModalOpen(false);
            setEditingTipo(null);
            fetchProject();
        } catch (error: any) {
            console.error("Error saving tipo", error);
            if (error.response?.data?.detail) {
                setTipoModalError(error.response.data.detail);
            } else {
                setTipoModalError("Ocurrió un error al guardar el Tipo de Plantilla.");
            }
        } finally {
            setSavingTipo(false);
        }
    }

    const handleDeleteTorreClick = (torreId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTorreToDelete(torreId);
    };

    const confirmDeleteTorre = async () => {
        if (!torreToDelete) return;
        setDeleting(true);
        try {
            await projectService.deleteTorre(projectId, torreToDelete);
            fetchProject();
        } catch (error) {
            console.error("Error deleting torre", error);
            alert("Hubo un error al eliminar la torre.");
        } finally {
            setDeleting(false);
            setTorreToDelete(null);
        }
    };

    const handleDeleteTipoClick = (tipoId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTipoToDelete(tipoId);
    };

    const confirmDeleteTipo = async () => {
        if (!tipoToDelete) return;
        setDeleting(true);
        try {
            await projectService.deleteTipoPlantilla(projectId, tipoToDelete);
            fetchProject();
        } catch (error: any) {
            console.error("Error deleting tipo", error);
            if (error.response && error.response.status === 400) {
                alert(error.response.data.detail || "No se puede eliminar porque hay apartamentos usándolo.");
            } else {
                alert("Hubo un error al eliminar el Tipo de Plantilla.");
            }
        } finally {
            setDeleting(false);
            setTipoToDelete(null);
        }
    };

    const handleSaveImage = async () => {
        if (!project) return;
        setSavingImage(true);
        try {
            await projectService.updateProject(projectId, { imagen_url: tempImageUrl || null });
            await fetchProject();
            setEditingImage(false);
        } catch (error) {
            console.error("Error updating image", error);
            alert("Hubo un error al actualizar la imagen del proyecto.");
        } finally {
            setSavingImage(false);
        }
    };

    const handleUpdateProject = async (data: any) => {
        try {
            await projectService.updateProject(projectId, data);
            setIsEditProjectModalOpen(false);
            fetchProject();
        } catch (error) {
            console.error("Error updating project", error);
            alert("Hubo un error al actualizar el proyecto.");
        }
    };

    // Si hay una torre seleccionada, descendemos a esa vista
    if (selectedTorreId) {
        return <TorreDetailsView projectId={projectId} torreId={selectedTorreId} onBack={() => setSelectedTorreId(null)} project={project} />;
    }

    if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Cargando detalles...</div>;
    if (!project) return <div className="p-8 text-center text-red-500">Error al cargar el proyecto.</div>;

    const totalTorres = project.torres ? project.torres.length : 0;
    const totalAptos = project.torres ? project.torres.reduce((acc: number, t: any) => acc + t.numero_aptos, 0) : 0;
    const totalTipos = project.tipos_plantilla ? project.tipos_plantilla.length : 0;
    const esCasas = project.tipo_inmueble === 'Casas';

    return (
        <div className="animate-fade-in flex-1 flex flex-col relative w-full h-full">
            <Header
                title={`Proyecto: ${project.nombre}`}
                subtitle={`${project.ciudad || 'Sin ciudad'}, ${project.departamento || 'Sin dpto'}` + (project.es_vis ? ' | Proyecto VIS' : '')}
            />

            <div className="p-8 space-y-8">
                <Button variant="ghost" onClick={onBack} className="mb-4">
                    ← Volver a Proyectos
                </Button>

                <div className="glass-card theme-light:bg-white theme-light:border-slate-200 theme-light:shadow-slate-200/50 p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <Typography variant="h2">Información General</Typography>
                        <Button variant="primary" onClick={() => setIsEditProjectModalOpen(true)} className="text-sm py-1.5 px-4 h-auto">
                            Editar Información
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 theme-light:text-slate-400">Ubicación</span>
                            <span className="text-white theme-light:text-slate-900 font-medium">
                                {project.ciudad || 'Ciudad no especificada'}, {project.departamento || 'Dpto no especificado'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 theme-light:text-slate-400">Características</span>
                            <div className="flex flex-wrap gap-2">
                                {project.es_vis && (
                                    <span className="px-2 py-1 text-xs rounded-full bg-saas-500/20 text-saas-400 theme-light:bg-saas-100 theme-light:text-saas-700">Proyecto VIS</span>
                                )}
                                <span className="px-2 py-1 text-xs rounded-full bg-dark-900 border border-white/10 text-gray-300 theme-light:bg-slate-100 theme-light:border-slate-200 theme-light:text-slate-700">
                                    {project.tipo_inmueble || 'No especificado'}
                                </span>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 theme-light:text-slate-400">Zonas Sociales</span>
                            <span className="text-gray-300 theme-light:text-slate-700 text-sm">
                                {project.zonas_sociales && project.zonas_sociales.length > 0 ? project.zonas_sociales.join(', ') : 'Ninguna registrada'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-dark-900/30 border border-white/5 p-4 rounded-xl theme-light:bg-slate-50 theme-light:border-slate-200 mb-6">
                        <div>
                            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 theme-light:text-slate-400">Dirección</span>
                            <span className="text-gray-300 theme-light:text-slate-700 text-sm">
                                {project.direccion || 'No especificada'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 theme-light:text-slate-400">Contacto de Ventas</span>
                            <div className="flex flex-col gap-1 text-sm text-gray-300 theme-light:text-slate-700">
                                {project.telefono_contacto && (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-saas-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        {project.telefono_contacto}
                                    </span>
                                )}
                                {project.correo_contacto && (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-saas-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        {project.correo_contacto}
                                    </span>
                                )}
                                {!project.telefono_contacto && !project.correo_contacto && 'No especificado'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-4 border border-white/5 rounded-xl bg-dark-900/50 theme-light:bg-slate-50 theme-light:border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-300 theme-light:text-slate-700">Imagen del Proyecto</span>
                            {!editingImage && (
                                <button
                                    onClick={() => { setTempImageUrl(project.imagen_url || ''); setEditingImage(true); }}
                                    className="text-saas-400 hover:text-saas-300 text-sm transition-colors theme-light:text-saas-600 theme-light:hover:text-saas-700 flex items-center gap-1"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    Editar URL
                                </button>
                            )}
                        </div>

                        {editingImage ? (
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={tempImageUrl}
                                    onChange={(e) => setTempImageUrl(e.target.value)}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    className="flex-1 bg-dark-800 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-saas-500 theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900"
                                />
                                <button
                                    onClick={handleSaveImage}
                                    disabled={savingImage}
                                    className="bg-saas-500 hover:bg-saas-400 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {savingImage ? '...' : 'Guardar'}
                                </button>
                                <button
                                    onClick={() => setEditingImage(false)}
                                    className="text-gray-400 hover:text-white px-2 py-1.5 text-sm transition-colors theme-light:text-slate-500 theme-light:hover:text-slate-800"
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 truncate theme-light:text-slate-500">
                                {project.imagen_url ? (
                                    <a href={getFullImageUrl(project.imagen_url)} target="_blank" rel="noreferrer" className="hover:text-white hover:underline transition-colors theme-light:hover:text-slate-800">
                                        {project.imagen_url}
                                    </a>
                                ) : (
                                    "Sin imagen asignada."
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="bg-dark-900 border border-white/5 p-4 rounded-xl theme-light:bg-slate-50 theme-light:border-slate-200">
                            <span className="text-gray-400 text-sm block theme-light:text-slate-500">{esCasas ? 'Manzanas Registradas' : 'Torres Registradas'}</span>
                            <span className="text-2xl font-bold text-white theme-light:text-gray-900">{totalTorres}</span>
                        </div>
                        <div className="bg-dark-900 border border-white/5 p-4 rounded-xl theme-light:bg-slate-50 theme-light:border-slate-200">
                            <span className="text-gray-400 text-sm block theme-light:text-slate-500">{esCasas ? 'Casas Totales' : 'Aptos Totales'}</span>
                            <span className="text-2xl font-bold text-white theme-light:text-gray-900">{totalAptos}</span>
                        </div>
                        <div className="bg-dark-900 border border-white/5 p-4 rounded-xl theme-light:bg-slate-50 theme-light:border-slate-200">
                            <span className="text-gray-400 text-sm block theme-light:text-slate-500">Ventas</span>
                            <span className="text-2xl font-bold text-saas-400 theme-light:text-saas-600">0%</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card theme-light:bg-white theme-light:border-slate-200 theme-light:shadow-slate-200/50 p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <Typography variant="h2">Administración de {esCasas ? 'Manzanas' : 'Torres'}</Typography>
                        <Button onClick={() => setIsTorreModalOpen(true)}>
                            + Agregar {esCasas ? 'Manzana' : 'Torre'}
                        </Button>
                    </div>
                    {totalTorres === 0 ? (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-white/10 rounded-xl theme-light:border-slate-300 theme-light:text-slate-500">
                            Aún no hay {esCasas ? 'manzanas' : 'torres'} en este proyecto. Haz click en "+ Agregar {esCasas ? 'Manzana' : 'Torre'}" para empezar.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {project.torres.map((torre: any) => (
                                <div key={torre.id} className="bg-dark-900 border border-white/10 p-4 rounded-xl hover:border-saas-500 transition-colors cursor-pointer group theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:hover:border-saas-400 relative" onClick={() => setSelectedTorreId(torre.id)}>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => handleDeleteTorreClick(torre.id, e)} className="text-gray-500 hover:text-red-500 p-1 bg-dark-800 rounded-md theme-light:bg-white theme-light:shadow-sm" title={`Eliminar ${esCasas ? 'Manzana' : 'Torre'}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-saas-400 transition-colors theme-light:text-slate-800 pr-8">{torre.nombre}</h3>
                                    <div className="flex justify-between mt-2 text-sm text-gray-400 theme-light:text-slate-500">
                                        {!esCasas && <span>{torre.numero_pisos} Pisos</span>}
                                        <span>{torre.numero_aptos} {esCasas ? 'Casas' : 'Aptos'}</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center theme-light:border-slate-200">
                                        <span className="text-xs px-2 py-1 rounded bg-white/5 text-gray-300 theme-light:bg-slate-200 theme-light:text-slate-600">En diseño</span>
                                        <button className="text-saas-500 text-sm hover:underline theme-light:text-saas-600">{esCasas ? 'Gestionar distribución →' : 'Gestionar pisos →'}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass-card theme-light:bg-white theme-light:border-slate-200 theme-light:shadow-slate-200/50 p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <Typography variant="h2">Tipos de {esCasas ? 'Casa' : 'Apartamento'}</Typography>
                        <Button onClick={() => { setEditingTipo(null); setIsTipoModalOpen(true); }}>
                            + Agregar Tipo
                        </Button>
                    </div>
                    {totalTipos === 0 ? (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-white/10 rounded-xl theme-light:border-slate-300 theme-light:text-slate-500">
                            Aún no has configurado tipos de {esCasas ? 'casa' : 'apartamento'}. Haz click en "+ Agregar Tipo" para empezar.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {project.tipos_plantilla.map((tipo: any) => (
                                <div key={tipo.id} className="bg-dark-900 border border-white/10 p-4 rounded-xl flex flex-col hover:border-saas-500 transition-colors cursor-pointer group theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:hover:border-saas-400 relative" onClick={() => { setEditingTipo(tipo); setIsTipoModalOpen(true); }}>
                                    {tipo.imagen_url && (
                                        <div className="w-full h-40 mb-4 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center theme-light:bg-slate-200">
                                            <img src={getFullImageUrl(tipo.imagen_url)} alt={tipo.nombre} className="max-h-full max-w-full object-contain" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button onClick={(e) => handleDeleteTipoClick(tipo.id, e)} className="text-gray-500 hover:text-red-500 p-1 bg-dark-800 rounded-md theme-light:bg-white theme-light:shadow-sm" title="Eliminar Tipo">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-start mb-4 pr-8">
                                        <h3 className="text-lg font-bold text-white group-hover:text-saas-400 transition-colors theme-light:text-slate-800">{tipo.nombre}</h3>
                                        <span className="text-xs px-2 py-1 rounded bg-saas-500/10 text-saas-400 border border-saas-500/20 theme-light:bg-saas-50 theme-light:border-saas-200 theme-light:text-saas-600">
                                            {tipo.area_construida} m²
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-2 theme-light:text-slate-500">
                                        <div><span className="text-gray-500 block text-xs theme-light:text-slate-400">Área Privada</span> {tipo.area_privada} m²</div>
                                        <div><span className="text-gray-500 block text-xs theme-light:text-slate-400">Habitaciones</span> {tipo.habitaciones}</div>
                                        <div><span className="text-gray-500 block text-xs theme-light:text-slate-400">Baños</span> {tipo.banos}</div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/10 text-right theme-light:border-slate-200">
                                        <span className="text-saas-500 text-sm group-hover:underline theme-light:text-saas-600">Editar →</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {
                isTorreModalOpen && (
                    <TorreModal
                        isOpen={isTorreModalOpen}
                        onClose={() => setIsTorreModalOpen(false)}
                        onSubmit={handleCreateTorre}
                        loading={savingTorre}
                        esCasas={esCasas}
                    />
                )
            }

            {
                isTipoModalOpen && (
                    <TipoPlantillaModal
                        isOpen={isTipoModalOpen}
                        onClose={() => { setIsTipoModalOpen(false); setEditingTipo(null); setTipoModalError(null); }}
                        onSubmit={handleCreateOrUpdateTipo}
                        loading={savingTipo}
                        initialData={editingTipo}
                        error={tipoModalError}
                    />
                )
            }

            <ConfirmModal
                isOpen={torreToDelete !== null}
                onClose={() => setTorreToDelete(null)}
                onConfirm={confirmDeleteTorre}
                title={`Eliminar ${esCasas ? 'Manzana' : 'Torre'}`}
                message={`¿Estás seguro de que deseas eliminar esta ${esCasas ? 'Manzana' : 'Torre'}? Se borrarán de forma permanente todos los registros asociados.`}
                loading={deleting}
            />

            <ConfirmModal
                isOpen={tipoToDelete !== null}
                onClose={() => setTipoToDelete(null)}
                onConfirm={confirmDeleteTipo}
                title={`Eliminar Tipo de ${esCasas ? 'Casa' : 'Apartamento'}`}
                message={`¿Estás seguro de que deseas eliminar este Tipo de ${esCasas ? 'Casa' : 'Apartamento'}?`}
                loading={deleting}
            />

            <ProjectModal
                isOpen={isEditProjectModalOpen}
                initialData={project}
                onClose={() => setIsEditProjectModalOpen(false)}
                onSubmit={handleUpdateProject}
            />
        </div >
    );
};
