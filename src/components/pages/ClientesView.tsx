import { useState, useEffect } from 'react';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Header } from '../organisms/Header';
import { ClienteModal } from '../organisms/ClienteModal';
import { clienteService } from '../../services/api';
import ConfirmModal from '../atoms/ConfirmModal';
import AlertModal from '../atoms/AlertModal';

export const ClientesView = () => {
    const [clientes, setClientes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCliente, setEditingCliente] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    const [clienteToDelete, setClienteToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, message: string, isError: boolean }>({
        isOpen: false, title: '', message: '', isError: true
    });

    const showAlert = (message: string, isError = true, title = "Aviso") => {
        setAlertConfig({ isOpen: true, title, message, isError });
    };

    useEffect(() => {
        loadClientes();
    }, []);

    const loadClientes = async () => {
        setLoading(true);
        try {
            const data = await clienteService.getClientes();
            setClientes(data);
        } catch (error) {
            console.error("Error cargando clientes:", error);
            showAlert("Error al cargar la lista de clientes.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCliente = async (data: any) => {
        setSaving(true);
        try {
            if (editingCliente) {
                await clienteService.updateCliente(editingCliente.id, data);
            } else {
                await clienteService.createCliente(data);
            }
            setIsModalOpen(false);
            setEditingCliente(null);
            loadClientes();
        } catch (error: any) {
            console.error("Error guardando cliente:", error);
            showAlert(error.response?.data?.detail || "Ocurrió un error al guardar el cliente.");
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!clienteToDelete) return;
        setDeleting(true);
        try {
            await clienteService.deleteCliente(clienteToDelete);
            setClienteToDelete(null);
            loadClientes();
        } catch (error: any) {
            console.error("Error eliminando cliente:", error);
            if (error?.response?.status === 403) {
                showAlert("No tienes permisos para eliminar clientes.");
            } else {
                showAlert(error?.response?.data?.detail || "Ocurrió un error al eliminar el cliente.");
            }
        } finally {
            setDeleting(false);
        }
    };

    const filteredClientes = clientes.filter(cliente => {
        const searchLower = searchTerm.toLowerCase();
        return (cliente.nombre && cliente.nombre.toLowerCase().includes(searchLower)) ||
            (cliente.documento_identidad && cliente.documento_identidad.toLowerCase().includes(searchLower)) ||
            (cliente.email && cliente.email.toLowerCase().includes(searchLower));
    });

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'preaprobado': return 'bg-yellow-500/20 text-yellow-500 theme-light:bg-yellow-100 theme-light:text-yellow-700';
            case 'aprobado': return 'bg-blue-500/20 text-blue-500 theme-light:bg-blue-100 theme-light:text-blue-700';
            case 'definitivo': return 'bg-green-500/20 text-green-500 theme-light:bg-green-100 theme-light:text-green-700';
            default: return 'bg-gray-500/20 text-gray-400 theme-light:bg-slate-200 theme-light:text-slate-600';
        }
    };

    const formatEstado = (estado: string | null) => {
        if (!estado) return "No definido";
        return estado.charAt(0).toUpperCase() + estado.slice(1);
    };

    return (
        <div className="animate-fade-in flex flex-col h-full overflow-hidden w-full relative">
            <Header
                title="Directorio de Clientes"
                subtitle="Gestione clientes, interesados y titulares de inmuebles"
                actionLabel="+ Registrar Cliente"
                onAction={() => {
                    setEditingCliente(null);
                    setIsModalOpen(true);
                }}
            />

            <div className="p-8 pb-32 flex-1 overflow-y-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div className="w-1/2">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, documento o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-saas-500 outline-none theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900"
                        />
                    </div>
                    <div className="text-sm text-gray-400 theme-light:text-slate-500">
                        Total Clientes: <span className="text-white theme-light:text-slate-900 font-bold">{clientes.length}</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-saas-500"></div>
                    </div>
                ) : filteredClientes.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-2xl border border-white/5 theme-light:bg-white theme-light:border-slate-200 shadow-xl">
                        <div className="w-16 h-16 rounded-full bg-dark-900 flex items-center justify-center mx-auto mb-4 theme-light:bg-slate-100">
                            <svg className="w-8 h-8 text-gray-500 theme-light:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <Typography variant="h3" className="mb-2">No hay clientes encontrados</Typography>
                        <p className="text-gray-400 theme-light:text-slate-500 mb-6">Añade o busca un cliente para verlo aquí.</p>
                        <Button onClick={() => { setEditingCliente(null); setIsModalOpen(true); }}>
                            Registrar Cliente
                        </Button>
                    </div>
                ) : (
                    <div className="glass-card theme-light:bg-white theme-light:border-slate-200 theme-light:shadow-slate-200/50 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 theme-light:border-slate-200 bg-dark-900/50 theme-light:bg-slate-50">
                                        <th className="p-4 text-sm font-semibold text-gray-300 theme-light:text-slate-600">Nombre Completo</th>
                                        <th className="p-4 text-sm font-semibold text-gray-300 theme-light:text-slate-600">Contacto</th>
                                        <th className="p-4 text-sm font-semibold text-gray-300 theme-light:text-slate-600">Documento</th>
                                        <th className="p-4 text-sm font-semibold text-gray-300 theme-light:text-slate-600">Crédito</th>
                                        <th className="p-4 text-sm font-semibold text-gray-300 theme-light:text-slate-600 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClientes.map((cliente) => (
                                        <tr key={cliente.id} className="border-b border-white/5 hover:bg-white/5 transition-colors theme-light:border-slate-100 theme-light:hover:bg-slate-50">
                                            <td className="p-4 font-medium text-white theme-light:text-slate-900">
                                                {cliente.nombre}
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-gray-300 theme-light:text-slate-600">{cliente.email || '-'}</div>
                                                <div className="text-xs text-gray-500 theme-light:text-slate-400">{cliente.telefono || '-'}</div>
                                            </td>
                                            <td className="p-4 text-gray-300 theme-light:text-slate-600">
                                                {cliente.documento_identidad || '-'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cliente.estado_credito)}`}>
                                                        {formatEstado(cliente.estado_credito)}
                                                    </span>
                                                    {cliente.entidad_financiera && (
                                                        <span className="text-xs text-gray-500 theme-light:text-slate-400 font-medium">
                                                            {cliente.entidad_financiera}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingCliente(cliente);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all theme-light:text-slate-400 theme-light:hover:text-slate-600 theme-light:hover:bg-slate-100"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setClienteToDelete(cliente.id)}
                                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all theme-light:text-red-500 theme-light:hover:text-red-600 theme-light:hover:bg-red-50"
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

            <ClienteModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCliente(null);
                }}
                onSave={handleSaveCliente}
                initialData={editingCliente}
                saving={saving}
            />

            <ConfirmModal
                isOpen={!!clienteToDelete}
                onClose={() => setClienteToDelete(null)}
                onConfirm={confirmDelete}
                title="Eliminar Cliente"
                message="¿Estás seguro que deseas eliminar este cliente? Esta acción no se puede deshacer y puede fallar si tiene inmuebles asociados."
                confirmText={deleting ? "Eliminando..." : "Eliminar"}
            />

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
                isError={alertConfig.isError}
            />
        </div>
    );
};
