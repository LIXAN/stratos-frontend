import { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';

interface ClienteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
    saving?: boolean;
}

export const ClienteModal = ({ isOpen, onClose, onSave, initialData, saving }: ClienteModalProps) => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [documentoIdentidad, setDocumentoIdentidad] = useState('');
    const [entidadFinanciera, setEntidadFinanciera] = useState('');
    const [estadoCredito, setEstadoCredito] = useState('preaprobado');

    useEffect(() => {
        if (initialData) {
            setNombre(initialData.nombre || '');
            setEmail(initialData.email || '');
            setTelefono(initialData.telefono || '');
            setDocumentoIdentidad(initialData.documento_identidad || '');
            setEntidadFinanciera(initialData.entidad_financiera || '');
            setEstadoCredito(initialData.estado_credito || 'preaprobado');
        } else {
            setNombre('');
            setEmail('');
            setTelefono('');
            setDocumentoIdentidad('');
            setEntidadFinanciera('');
            setEstadoCredito('preaprobado');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            nombre,
            email: email || null,
            telefono: telefono || null,
            documento_identidad: documentoIdentidad || null,
            entidad_financiera: entidadFinanciera || null,
            estado_credito: estadoCredito || null
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm theme-light:bg-slate-900/40">
            <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] theme-light:bg-white theme-light:border-slate-200">
                <div className="p-6 border-b border-white/10 flex justify-between items-center theme-light:border-slate-100">
                    <Typography variant="h3">{initialData ? 'Editar Cliente' : 'Registrar Cliente'}</Typography>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors theme-light:text-slate-400 theme-light:hover:text-slate-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1 relative">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 theme-light:text-slate-500">
                                Nombre Completo *
                            </label>
                            <input
                                type="text"
                                required
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-saas-500 theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900"
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 theme-light:text-slate-500">
                                    Documento de Identidad
                                </label>
                                <input
                                    type="text"
                                    value={documentoIdentidad}
                                    onChange={(e) => setDocumentoIdentidad(e.target.value)}
                                    className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-saas-500 theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 theme-light:text-slate-500">
                                    Teléfono
                                </label>
                                <input
                                    type="text"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-saas-500 theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 theme-light:text-slate-500">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-saas-500 theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 theme-light:text-slate-500">
                                    Entidad Financiera
                                </label>
                                <input
                                    type="text"
                                    value={entidadFinanciera}
                                    onChange={(e) => setEntidadFinanciera(e.target.value)}
                                    placeholder="Ej: Bancolombia, Davivienda..."
                                    className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-saas-500 theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 theme-light:text-slate-500">
                                    Estado de Crédito
                                </label>
                                <div className="relative">
                                    <select
                                        value={estadoCredito}
                                        onChange={(e) => setEstadoCredito(e.target.value)}
                                        className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-saas-500 appearance-none theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900 hover:border-saas-400/50 cursor-pointer"
                                    >
                                        <option value="preaprobado" className="bg-dark-900 theme-light:bg-white text-white theme-light:text-slate-900">Pre-aprobado</option>
                                        <option value="aprobado" className="bg-dark-900 theme-light:bg-white text-white theme-light:text-slate-900">Aprobado</option>
                                        <option value="definitivo" className="bg-dark-900 theme-light:bg-white text-white theme-light:text-slate-900">Definitivo</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 theme-light:text-slate-500">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>

                <div className="p-6 border-t border-white/10 bg-dark-900/50 flex justify-end gap-3 theme-light:border-slate-100 theme-light:bg-slate-50">
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Guardando...' : initialData ? 'Actualizar Cliente' : 'Registrar Cliente'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
