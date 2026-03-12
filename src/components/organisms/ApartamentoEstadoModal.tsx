import React, { useState, useEffect } from 'react';
import { api, clienteService, rrhhService } from '../../services/api';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';

interface ApartamentoEstadoModalProps {
    isOpen: boolean;
    onClose: () => void;
    apartamento: any;
    onSaved: () => void;
}

export const ApartamentoEstadoModal: React.FC<ApartamentoEstadoModalProps> = ({ isOpen, onClose, apartamento, onSaved }) => {
    const [estado, setEstado] = useState('disponible');
    const [clienteId, setClienteId] = useState('');
    const [asesorId, setAsesorId] = useState('');
    const [loading, setLoading] = useState(false);
    
    // New Client State
    const [isCreatingCliente, setIsCreatingCliente] = useState(false);
    const [newCliente, setNewCliente] = useState({
        nombre: '',
        documento_identidad: '',
        telefono: '',
        email: ''
    });

    const [clientes, setClientes] = useState<any[]>([]);
    const [asesores, setAsesores] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && apartamento) {
            setEstado(apartamento.estado || 'disponible');
            setClienteId(apartamento.cliente_id || '');
            setAsesorId(apartamento.asesor_id || '');
            setIsCreatingCliente(false);
            setNewCliente({ nombre: '', documento_identidad: '', telefono: '', email: '' });

            // Fetch select options
            fetchOptions();
        }
    }, [isOpen, apartamento]);

    const fetchOptions = async () => {
        try {
            const [clientesData, empleadosData] = await Promise.all([
                clienteService.getClientes(),
                rrhhService.getEmpleados()
            ]);
            setClientes(clientesData);
            // Asumiendo que cualquier empleado puede ser asesor o filtrando por nombre de cargo si es necesario
            setAsesores(empleadosData);
        } catch (error) {
            console.error("Error fetching options for modal", error);
        }
    };

    if (!isOpen || !apartamento) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            if (estado === 'disponible') {
                if (apartamento.estado !== 'disponible') {
                    // Endpoint liberar
                    await api.post(`/apartamentos/${apartamento.id}/liberar`);
                }
            } else if (estado === 'reservado' || estado === 'vendido') {
                let finalClienteId = clienteId;

                // Si está creando un cliente nuevo, crearlo primero
                if (isCreatingCliente) {
                    if (!newCliente.nombre || !newCliente.documento_identidad) {
                        alert("El nombre y documento de identidad son obligatorios para el nuevo cliente.");
                        setLoading(false);
                        return;
                    }
                    const createdCliente = await clienteService.createCliente(newCliente);
                    finalClienteId = createdCliente.id;
                }

                const payload = {
                    estado: estado,
                    cliente_id: finalClienteId || null,
                    asesor_id: asesorId || null
                };
                if (estado === 'reservado') {
                    await api.post(`/apartamentos/${apartamento.id}/reservar`, payload);
                } else if (estado === 'vendido') {
                    await api.post(`/apartamentos/${apartamento.id}/vender`, payload);
                }
            }
            onSaved();
        } catch (error) {
            console.error("Error updating apartamento state", error);
            alert("Ocurrió un error al actualizar el estado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm theme-light:bg-slate-900/40">
            <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col theme-light:bg-white theme-light:border-slate-200">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-dark-900/50 theme-light:bg-slate-50 theme-light:border-slate-100">
                    <div>
                        <Typography variant="h3">Inmueble {apartamento.identificadorVisual || `${apartamento.numeroNivel}01`}</Typography>
                        <p className="text-sm text-gray-400 mt-1">{apartamento.nombreTorre} - Nivel {apartamento.numeroNivel}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors theme-light:text-slate-400 theme-light:hover:text-slate-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 theme-light:text-slate-500">Estado de Disponibilidad</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setEstado('disponible')}
                                className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${estado === 'disponible'
                                    ? 'bg-green-500/20 border-green-500 text-green-500 theme-light:bg-green-100 theme-light:border-green-500 theme-light:text-green-700'
                                    : 'bg-dark-900 border-white/5 text-gray-500 hover:border-white/20 theme-light:bg-white theme-light:border-slate-200 theme-light:hover:border-slate-300 theme-light:text-slate-500'
                                    }`}
                            >
                                <div className={`w-3 h-3 rounded-full mb-2 ${estado === 'disponible' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                <span className="text-sm font-medium">Disponible</span>
                            </button>
                            <button
                                onClick={() => setEstado('reservado')}
                                className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${estado === 'reservado'
                                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500 theme-light:bg-yellow-100 theme-light:border-yellow-500 theme-light:text-yellow-700'
                                    : 'bg-dark-900 border-white/5 text-gray-500 hover:border-white/20 theme-light:bg-white theme-light:border-slate-200 theme-light:hover:border-slate-300 theme-light:text-slate-500'
                                    }`}
                            >
                                <div className={`w-3 h-3 rounded-full mb-2 ${estado === 'reservado' ? 'bg-yellow-500' : 'bg-gray-500'}`}></div>
                                <span className="text-sm font-medium">Reservado</span>
                            </button>
                            <button
                                onClick={() => setEstado('vendido')}
                                className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${estado === 'vendido'
                                    ? 'bg-red-500/20 border-red-500 text-red-500 theme-light:bg-red-100 theme-light:border-red-500 theme-light:text-red-700'
                                    : 'bg-dark-900 border-white/5 text-gray-500 hover:border-white/20 theme-light:bg-white theme-light:border-slate-200 theme-light:hover:border-slate-300 theme-light:text-slate-500'
                                    }`}
                            >
                                <div className={`w-3 h-3 rounded-full mb-2 ${estado === 'vendido' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                                <span className="text-sm font-medium">Vendido</span>
                            </button>
                        </div>
                    </div>

                    {estado !== 'disponible' && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-400 theme-light:text-slate-500">Cliente Interesado / Comprador</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsCreatingCliente(!isCreatingCliente)}
                                        className="text-xs text-saas-500 hover:text-saas-400 font-medium transition-colors"
                                    >
                                        {isCreatingCliente ? 'Usar Existente' : '+ Nuevo Cliente'}
                                    </button>
                                </div>
                                
                                {isCreatingCliente ? (
                                    <div className="space-y-3 bg-dark-900/50 p-4 rounded-xl border border-white/5 theme-light:bg-slate-50 theme-light:border-slate-100 mt-2">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <input 
                                                    type="text" 
                                                    placeholder="Cédula" 
                                                    value={newCliente.documento_identidad}
                                                    onChange={e => setNewCliente({...newCliente, documento_identidad: e.target.value})}
                                                    className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-saas-500 text-sm theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900" 
                                                />
                                            </div>
                                            <div>
                                                <input 
                                                    type="text" 
                                                    placeholder="Teléfono" 
                                                    value={newCliente.telefono}
                                                    onChange={e => setNewCliente({...newCliente, telefono: e.target.value})}
                                                    className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-saas-500 text-sm theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900" 
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="Nombre Completo" 
                                                    value={newCliente.nombre}
                                                    onChange={e => setNewCliente({...newCliente, nombre: e.target.value})}
                                                    className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-saas-500 text-sm theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900" 
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input 
                                                    type="email" 
                                                    placeholder="Correo Electrónico" 
                                                    value={newCliente.email}
                                                    onChange={e => setNewCliente({...newCliente, email: e.target.value})}
                                                    className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-saas-500 text-sm theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <select
                                        value={clienteId}
                                        onChange={(e) => setClienteId(e.target.value)}
                                        className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-saas-500 theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900"
                                    >
                                        <option value="">-- Seleccionar Cliente --</option>
                                        {clientes.map(cliente => (
                                            <option key={cliente.id} value={cliente.id}>{cliente.nombre} - {cliente.documento_identidad || 'Sin Doc'}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 theme-light:text-slate-500">Asesor a Cargo</label>
                                <select
                                    value={asesorId}
                                    onChange={(e) => setAsesorId(e.target.value)}
                                    className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-saas-500 theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900"
                                >
                                    <option value="">-- Seleccionar Asesor --</option>
                                    {asesores.map(asesor => (
                                        <option key={asesor.id} value={asesor.id}>{asesor.nombre_completo} ({asesor.cargo})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/10 bg-dark-900/50 flex justify-end gap-3 theme-light:border-slate-100 theme-light:bg-slate-50">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Estado'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
