import { useState, useEffect } from 'react';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Header } from '../organisms/Header';
import { EmpleadoModal } from '../organisms/EmpleadoModal';
import { CargoModal } from '../organisms/CargoModal';
import { rrhhService } from '../../services/api';
import ConfirmModal from '../atoms/ConfirmModal';

export const RRHHView = () => {
    const [empleados, setEmpleados] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
    const [editingEmpleado, setEditingEmpleado] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    const [empleadoToDelete, setEmpleadoToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadEmpleados();
    }, []);

    const loadEmpleados = async () => {
        setLoading(true);
        try {
            const data = await rrhhService.getEmpleados();
            setEmpleados(data);
        } catch (error) {
            console.error("Error cargando empleados:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEmpleado = async (data: any) => {
        setSaving(true);
        try {
            if (editingEmpleado) {
                await rrhhService.updateEmpleado(editingEmpleado.id, data);
            } else {
                await rrhhService.createEmpleado(data);
            }
            setIsModalOpen(false);
            setEditingEmpleado(null);
            loadEmpleados();
        } catch (error) {
            console.error("Error guardando empleado:", error);
            alert("Ocurrió un error al guardar el empleado.");
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!empleadoToDelete) return;
        setDeleting(true);
        try {
            await rrhhService.deleteEmpleado(empleadoToDelete);
            setEmpleadoToDelete(null);
            loadEmpleados();
        } catch (error: any) {
            console.error("Error eliminando empleado:", error);
            if (error?.response?.status === 403) {
                alert("No tienes permisos para eliminar empleados.");
            } else {
                alert("Ocurrió un error al eliminar el empleado.");
            }
        } finally {
            setDeleting(false);
        }
    };

    const filteredEmpleados = empleados.filter(emp => {
        return emp.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="animate-fade-in flex flex-col h-full overflow-hidden w-full relative">
            <Header
                title="Recursos Humanos"
                subtitle="Gestión del personal y equipo de trabajo"
                actionLabel="+ Registrar Personal"
                onAction={() => {
                    setEditingEmpleado(null);
                    setIsModalOpen(true);
                }}
            />

            <div className="p-8 pb-32 flex-1 overflow-y-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div className="flex gap-4 w-1/2">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o cargo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-saas-500 outline-none theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900"
                        />
                        <Button variant="primary" onClick={() => setIsCargoModalOpen(true)}>
                            Gestionar Cargos
                        </Button>
                    </div>
                    <div className="text-sm text-gray-400 theme-light:text-slate-500">
                        Total Registrados: <span className="text-white theme-light:text-slate-900 font-bold">{empleados.length}</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-saas-500"></div>
                    </div>
                ) : filteredEmpleados.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-2xl border border-white/5 theme-light:bg-white theme-light:border-slate-200 shadow-xl">
                        <div className="w-16 h-16 rounded-full bg-dark-900 flex items-center justify-center mx-auto mb-4 theme-light:bg-slate-100">
                            <svg className="w-8 h-8 text-gray-500 theme-light:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <Typography variant="h3" className="mb-2">No hay personal registrado</Typography>
                        <p className="text-gray-400 theme-light:text-slate-500 mb-6">Añade empleados para gestionar tu equipo de trabajo.</p>
                        <Button onClick={() => { setEditingEmpleado(null); setIsModalOpen(true); }}>
                            Registrar Personal
                        </Button>
                    </div>
                ) : (
                    <div className="glass-card theme-light:bg-white theme-light:border-slate-200 theme-light:shadow-slate-200/50 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 theme-light:border-slate-200 bg-dark-900/50 theme-light:bg-slate-50">
                                        <th className="p-4 text-sm font-semibold text-gray-300 theme-light:text-slate-600">Nombre</th>
                                        <th className="p-4 text-sm font-semibold text-gray-300 theme-light:text-slate-600">Cargo</th>
                                        <th className="p-4 text-sm font-semibold text-gray-300 theme-light:text-slate-600">Documento / Teléfono</th>
                                        <th className="p-4 text-sm font-semibold text-gray-300 theme-light:text-slate-600">Mod. / Rol</th>
                                        <th className="p-4 text-sm font-semibold text-gray-300 theme-light:text-slate-600">Estado</th>
                                        <th className="p-4 text-sm font-semibold text-gray-300 theme-light:text-slate-600 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmpleados.map((emp) => (
                                        <tr key={emp.id} className="border-b border-white/5 theme-light:border-slate-100 hover:bg-white/[0.02] theme-light:hover:bg-slate-50/80 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-bold text-white theme-light:text-slate-800">{emp.nombre_completo}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-gray-300 theme-light:text-slate-600">{emp.cargo ? emp.cargo.nombre : 'Sin asignar'}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-gray-400 theme-light:text-slate-500">
                                                    {(emp.documento_identidad || emp.telefono) ? (
                                                        <>
                                                            {emp.documento_identidad && <span>CC: {emp.documento_identidad}</span>}
                                                            {emp.documento_identidad && emp.telefono && <br />}
                                                            {emp.telefono && <span>Tel: {emp.telefono}</span>}
                                                        </>
                                                    ) : (
                                                        <span className="italic">N/A</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">
                                                    <div className="text-white theme-light:text-slate-800 capitalize">{emp.modalidad || 'N/A'}</div>
                                                    <div className="text-gray-400 theme-light:text-slate-500 text-xs uppercase tracking-wide mt-1">{emp.rol || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${emp.estado === 'activo' ? 'bg-saas-500/20 text-saas-400 theme-light:bg-saas-100 theme-light:text-saas-700' : 'bg-red-500/20 text-red-400 theme-light:bg-red-100 theme-light:text-red-600'}`}>
                                                    {emp.estado.charAt(0).toUpperCase() + emp.estado.slice(1)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); alert("Gestión de accesos en desarrollo"); }}
                                                        className="text-gray-400 hover:text-blue-400 p-2 transition-colors theme-light:text-slate-400 theme-light:hover:text-blue-500"
                                                        title="Gestionar Accesos"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEditingEmpleado(emp); setIsModalOpen(true); }}
                                                        className="text-gray-400 hover:text-saas-400 p-2 transition-colors theme-light:text-slate-400 theme-light:hover:text-saas-600"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEmpleadoToDelete(emp.id); }}
                                                        className="text-gray-400 hover:text-red-400 p-2 transition-colors theme-light:text-slate-400 theme-light:hover:text-red-500"
                                                        title="Eliminar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <EmpleadoModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingEmpleado(null); }}
                onSubmit={handleSaveEmpleado}
                loading={saving}
                initialData={editingEmpleado}
            />

            <ConfirmModal
                isOpen={empleadoToDelete !== null}
                onClose={() => setEmpleadoToDelete(null)}
                onConfirm={confirmDelete}
                title="Eliminar Empleado"
                message="¿Estás seguro de que deseas eliminar a este empleado permanentemente? Esta acción no se puede deshacer."
                loading={deleting}
            />

            <CargoModal
                isOpen={isCargoModalOpen}
                onClose={() => setIsCargoModalOpen(false)}
            />
        </div>
    );
};
