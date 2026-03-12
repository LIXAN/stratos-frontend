import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/api';
import { Typography } from '../atoms/Typography';
import { FilterDropdown } from '../atoms/FilterDropdown';
import { ApartamentoEstadoModal } from '../organisms/ApartamentoEstadoModal';

interface GridProps {
    project: any;
    onBack: () => void;
}

export const DisponibilidadProjectGrid: React.FC<GridProps> = ({ project, onBack }) => {
    const [torres, setTorres] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTorres, setExpandedTorres] = useState<Record<string, boolean>>({});

    // Filtro de Disponibilidad
    const [filterEstado, setFilterEstado] = useState('Todos');

    // Estado del Modal
    const [selectedApartamento, setSelectedApartamento] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadDisponibilidad = async () => {
        setLoading(true);
        try {
            const data = await projectService.getDisponibilidad(project.id);
            // Sort towers naturally by extracting numbers from their names
            const sortedTorres = data.sort((a: any, b: any) => {
                const numA = parseInt(a.nombre.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.nombre.replace(/\D/g, '')) || 0;
                return numA - numB;
            });
            setTorres(sortedTorres);
        } catch (error) {
            console.error("Error al cargar disponibilidad", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDisponibilidad();
    }, [project.id]);

    const estadoOptions = [
        { label: 'Todos los estados', value: 'Todos' },
        { label: 'Disponible', value: 'disponible' },
        { label: 'Reservado', value: 'reservado' },
        { label: 'Vendido', value: 'vendido' }
    ];

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'disponible': return 'bg-green-500 hover:bg-green-400 theme-light:bg-green-500 theme-light:hover:bg-green-600';
            case 'reservado': return 'bg-yellow-500 hover:bg-yellow-400 theme-light:bg-yellow-400 theme-light:hover:bg-yellow-500';
            case 'vendido': return 'bg-red-500 hover:bg-red-400 theme-light:bg-red-500 theme-light:hover:bg-red-600';
            default: return 'bg-gray-500 hover:bg-gray-400';
        }
    };

    return (
        <div className="animate-fade-in flex-1 flex flex-col relative w-full h-full bg-dark-900 theme-light:bg-slate-50">
            {/* Header Area */}
            <div className="bg-gradient-to-r from-dark-800 to-dark-900 border-b border-white/10 p-6 theme-light:from-white theme-light:to-slate-50 theme-light:border-slate-200">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-400 hover:text-white transition-colors mb-4 text-sm font-medium theme-light:text-slate-500 theme-light:hover:text-saas-600"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver a Proyectos
                </button>
                <div className="flex justify-between items-end">
                    <div>
                        <Typography variant="h2" className="mb-1">{project.name}</Typography>
                        <p className="text-gray-400 theme-light:text-slate-500">Mapa de disponibilidad de inmuebles</p>
                    </div>
                </div>
            </div>

            <div className="p-8 flex-1 overflow-y-auto w-full flex flex-col">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-dark-800/50 p-4 rounded-xl border border-white/5 theme-light:bg-white theme-light:border-slate-200 theme-light:shadow-sm">
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-400 font-medium text-sm tracking-wider uppercase theme-light:text-slate-500">Filtro de Estado:</span>
                        <FilterDropdown
                            value={filterEstado}
                            onChange={setFilterEstado}
                            options={estadoOptions}
                            icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                            }
                        />
                    </div>

                    {/* Leyenda visual */}
                    <div className="flex items-center space-x-6 mt-4 sm:mt-0">
                        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div><span className="text-sm text-gray-300 theme-light:text-slate-600">Disponible</span></div>
                        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div><span className="text-sm text-gray-300 theme-light:text-slate-600">Reservado</span></div>
                        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div><span className="text-sm text-gray-300 theme-light:text-slate-600">Vendido</span></div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20 flex-1">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-saas-500"></div>
                    </div>
                ) : torres.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-2xl border border-white/5 theme-light:bg-white theme-light:border-slate-200">
                        <Typography variant="h3" className="mb-2">No hay torres o manzanas</Typography>
                        <p className="text-gray-400 theme-light:text-slate-500">Este proyecto aún no tiene estructura creada.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pb-12">
                        {torres.map(torre => {
                            const isExpanded = expandedTorres[torre.id] || false;

                            return (
                                <div key={torre.id} className="glass-card rounded-2xl overflow-hidden theme-light:bg-white theme-light:border-slate-200 theme-light:shadow-md border border-white/5">
                                    <button
                                        onClick={() => setExpandedTorres(prev => ({ ...prev, [torre.id]: !isExpanded }))}
                                        className="w-full text-left p-6 flex justify-between items-center hover:bg-white/5 theme-light:hover:bg-slate-50 transition-colors"
                                    >
                                        <Typography variant="h3" className="flex items-center">
                                            <svg className="w-6 h-6 mr-3 text-saas-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            {torre.nombre}
                                        </Typography>
                                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {isExpanded && (
                                        <div className="p-6 pt-0 border-t border-white/5 theme-light:border-slate-100 mt-2">
                                            {torre.pisos && torre.pisos.length > 0 ? (
                                                <div className="flex flex-col-reverse gap-4">
                                                    {[...torre.pisos].sort((a, b) => a.numero_nivel - b.numero_nivel).map(piso => {
                                                        const aptosFiltrados = (piso.apartamentos || []).filter((apto: any) => filterEstado === 'Todos' || apto.estado === filterEstado);

                                                        // Make sure we show the floor strictly if there are apartments matching, 
                                                        // OR if "Todos" is selected (so empty floors show up).
                                                        if (filterEstado !== 'Todos' && aptosFiltrados.length === 0) return null;

                                                        return (
                                                            <div key={piso.id} className="flex gap-4 items-center">
                                                                <div className="w-20 flex-shrink-0 text-center py-3 bg-dark-900 border border-white/10 rounded-lg theme-light:bg-slate-100 theme-light:border-slate-200">
                                                                    <span className="text-xs text-gray-400 block uppercase tracking-wider theme-light:text-slate-500">Nivel</span>
                                                                    <span className="text-xl font-bold text-white theme-light:text-slate-900">{piso.numero_nivel}</span>
                                                                </div>

                                                                <div className="flex-1 flex flex-wrap gap-3 p-3 bg-dark-800/30 rounded-xl border border-white/5 theme-light:bg-slate-50 theme-light:border-slate-100">
                                                                    {aptosFiltrados.length === 0 ? (
                                                                        <span className="text-sm text-gray-500 theme-light:text-slate-400 py-2">Sin inmuebles en este nivel.</span>
                                                                    ) : (
                                                                        aptosFiltrados.map((apto: any, index: number) => {
                                                                            let num = index + 1;
                                                                            const identificadorVisual = `${piso.numero_nivel}${num < 10 ? '0' : ''}${num}`;
                                                                            return (
                                                                                <button
                                                                                    key={apto.id}
                                                                                    onClick={() => {
                                                                                        setSelectedApartamento({ ...apto, nombreTorre: torre.nombre, numeroNivel: piso.numero_nivel, identificadorVisual });
                                                                                        setIsModalOpen(true);
                                                                                    }}
                                                                                    className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${getEstadoColor(apto.estado)}`}
                                                                                    title={`Ver detalles - Estado: ${apto.estado}`}
                                                                                >
                                                                                    {`${piso.numero_nivel}${num < 10 ? '0' : ''}${num}`}
                                                                                </button>
                                                                            );
                                                                        })
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-400 theme-light:text-slate-500 italic">No hay niveles configurados en esta torre.</p>
                                                )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ApartamentoEstadoModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedApartamento(null);
                }}
                apartamento={selectedApartamento}
                onSaved={() => {
                    loadDisponibilidad();
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
};
