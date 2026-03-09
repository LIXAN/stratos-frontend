import React, { useState, useEffect } from 'react';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Select } from '../atoms/Select';
import { rrhhService } from '../../services/api';
import AlertModal from '../atoms/AlertModal';

interface EmpleadoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    loading: boolean;
    initialData?: any;
}

export const EmpleadoModal: React.FC<EmpleadoModalProps> = ({ isOpen, onClose, onSubmit, loading, initialData }) => {
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [documentoIdentidad, setDocumentoIdentidad] = useState('');
    const [cargoId, setCargoId] = useState('');
    const [telefono, setTelefono] = useState('');
    const [salario, setSalario] = useState<number | ''>('');
    const [estado, setEstado] = useState('activo');
    const [modalidad, setModalidad] = useState('presencial');
    const [rol, setRol] = useState('asesor');

    // Cargo management
    const [cargos, setCargos] = useState<any[]>([]);

    const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, message: string, isError: boolean }>({
        isOpen: false, title: '', message: '', isError: true
    });

    const showAlert = (message: string, isError = true, title = "Aviso") => {
        setAlertConfig({ isOpen: true, title, message, isError });
    };

    useEffect(() => {
        if (isOpen) {
            loadCargos();
            if (initialData) {
                setNombreCompleto(initialData.nombre_completo || '');
                setDocumentoIdentidad(initialData.documento_identidad || '');
                setCargoId(initialData.cargo_id || '');
                setTelefono(initialData.telefono || '');
                setSalario(initialData.salario || '');
                setEstado(initialData.estado || 'activo');
                setModalidad(initialData.modalidad || 'presencial');
                setRol(initialData.rol || 'asesor');
            } else {
                setNombreCompleto('');
                setDocumentoIdentidad('');
                setCargoId('');
                setTelefono('');
                setSalario('');
                setEstado('activo');
                setModalidad('presencial');
                setRol('asesor');
            }
        }
    }, [isOpen, initialData]);

    const loadCargos = async () => {
        try {
            const data = await rrhhService.getCargos();
            setCargos(data);
        } catch (error) {
            console.error("Error cargando cargos:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-dark-900/90 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-white/10 p-6 rounded-2xl w-full max-w-2xl shadow-2xl relative theme-light:bg-white theme-light:border-slate-200">
                <Typography variant="h2" className="mb-4">{initialData ? 'Editar Empleado' : 'Nuevo Empleado'}</Typography>
                <form onSubmit={e => {
                    e.preventDefault();
                    if (!cargoId) {
                        showAlert("Por favor selecciona un Cargo.");
                        return;
                    }
                    onSubmit({
                        nombre_completo: nombreCompleto,
                        documento_identidad: documentoIdentidad || null,
                        cargo_id: cargoId || null,
                        telefono: telefono || null,
                        salario: salario ? Number(salario) : null,
                        estado: estado,
                        modalidad: modalidad,
                        rol: rol
                    });
                }}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Nombre Completo *</label>
                                <input className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-saas-500 outline-none theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white theme-light:placeholder-slate-400" placeholder="Ej. Juan Pérez" value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Cargo *</label>
                                <Select
                                    value={cargoId}
                                    onChange={setCargoId}
                                    options={cargos.map(c => ({ value: c.id, label: c.nombre }))}
                                    placeholder="Seleccionar..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Documento de Identidad *</label>
                                <input className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-saas-500 outline-none theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white theme-light:placeholder-slate-400" placeholder="Ej. 100000000" value={documentoIdentidad} onChange={e => setDocumentoIdentidad(e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Teléfono *</label>
                                <input className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-saas-500 outline-none theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white theme-light:placeholder-slate-400" placeholder="Ej. 3000000000" value={telefono} onChange={e => setTelefono(e.target.value)} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Rol en Plataforma *</label>
                                <Select
                                    value={rol}
                                    onChange={setRol}
                                    options={[
                                        { value: 'asesor', label: 'Asesor' },
                                        { value: 'admin', label: 'Administrador' }
                                    ]}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Modalidad *</label>
                                <Select
                                    value={modalidad}
                                    onChange={setModalidad}
                                    options={[
                                        { value: 'presencial', label: 'Presencial' },
                                        { value: 'remoto', label: 'Remoto' },
                                        { value: 'hibrido', label: 'Híbrido' }
                                    ]}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Salario</label>
                                <input type="number" className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-saas-500 outline-none theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white theme-light:placeholder-slate-400" placeholder="Opcional" value={salario} onChange={e => setSalario(e.target.value ? Number(e.target.value) : '')} min="0" />
                            </div>
                        </div>

                        {initialData && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1 theme-light:text-slate-500">Estado del Empleado</label>
                                <Select
                                    value={estado}
                                    onChange={setEstado}
                                    options={[
                                        { value: 'activo', label: 'Activo' },
                                        { value: 'inactivo', label: 'Inactivo' }
                                    ]}
                                />
                            </div>
                        )}

                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Registrar Empleado')}</Button>
                    </div>
                </form>
            </div>

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
