import React, { useState, useEffect } from 'react';
import { projectService, getFullImageUrl } from '../../services/api';
import { Header } from '../organisms/Header';
import { Typography } from '../atoms/Typography';
import { FilterDropdown } from '../atoms/FilterDropdown';
import { DisponibilidadProjectGrid } from './DisponibilidadProjectGrid';
import { useAuth } from '../../context/AuthContext';

export const DisponibilidadView: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const { token } = useAuth();

    // Filtros de Proyecto
    const [filterDepartment, setFilterDepartment] = useState('Todos');
    const [filterCity, setFilterCity] = useState('Todas');
    const [filterClassification, setFilterClassification] = useState('Todas');
    const [filterType, setFilterType] = useState('Todas');

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await projectService.getProjects();
            const mappedData = data.map((p: any) => ({
                id: p.id,
                name: p.nombre,
                departamento: p.departamento,
                ciudad: p.ciudad,
                location: `${p.ciudad || 'Sin ciudad'}, ${p.departamento || 'Sin dpto'}`,
                tipo_inmueble: p.tipo_inmueble,
                is_vis: p.es_vis,
                imagen_url: p.imagen_url
            }));
            setProjects(mappedData);
        } catch (error) {
            console.error("Error fetching projects", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && !selectedProjectId) fetchProjects();
    }, [token, selectedProjectId]);

    const uniqueDepartments: string[] = Array.from(new Set(projects.map((p: any) => p.departamento ? String(p.departamento).trim() : ''))).filter(Boolean) as string[];
    const uniqueCities: string[] = Array.from(new Set(projects.filter((p: any) => filterDepartment === 'Todos' || p.departamento === filterDepartment).map((p: any) => p.ciudad ? String(p.ciudad).trim() : ''))).filter(Boolean) as string[];

    const filteredProjects = projects.filter((p: any) => {
        const matchesDpto = filterDepartment === 'Todos' || (p.departamento && p.departamento.trim() === filterDepartment);
        const matchesCity = filterCity === 'Todas' || (p.ciudad && p.ciudad.trim() === filterCity);
        let matchesClass = true;
        if (filterClassification === 'VIS') matchesClass = p.is_vis === true;
        if (filterClassification === 'NO VIS') matchesClass = p.is_vis === false;
        const matchesType = filterType === 'Todas' || p.tipo_inmueble === filterType;
        return matchesDpto && matchesCity && matchesClass && matchesType;
    });

    const dptoOptions = [{ label: 'Todos los Dptos', value: 'Todos' }, ...uniqueDepartments.map(d => ({ label: d, value: d }))];
    const cityOptions = [{ label: 'Todas las Ciudades', value: 'Todas' }, ...uniqueCities.map(c => ({ label: c, value: c }))];
    const classOptions = [{ label: 'Todas las Clas.', value: 'Todas' }, { label: 'VIS', value: 'VIS' }, { label: 'NO VIS', value: 'NO VIS' }];
    const typeOptions = [
        { label: 'Todos los Tipos', value: 'Todas' },
        { label: 'Apartamentos', value: 'Apartamentos' },
        { label: 'Casas', value: 'Casas' },
        { label: 'Lotes/Terrenos', value: 'Lotes' },
        { label: 'Oficinas/Locales', value: 'Oficinas' },
        { label: 'Mixto', value: 'Mixto' }
    ];

    if (selectedProjectId) {
        const selectedProject = projects.find(p => p.id === selectedProjectId);
        return <DisponibilidadProjectGrid project={selectedProject} onBack={() => setSelectedProjectId(null)} />;
    }

    return (
        <div className="animate-fade-in flex-1 flex flex-col relative w-full h-full">
            <Header
                title="Disponibilidad de Inmuebles"
                subtitle="Consulte y gestione el estado de apartamentos, casas y lotes"
            />
            <div className="p-8 pb-32 flex-1 overflow-y-auto w-full">

                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
                    <span className="text-gray-400 font-medium text-sm tracking-wider uppercase theme-light:text-slate-500 flex-shrink-0">Filtrar por:</span>
                    <div className="flex flex-wrap gap-3">
                        <FilterDropdown
                            value={filterDepartment}
                            onChange={(val) => { setFilterDepartment(val); setFilterCity('Todas'); }}
                            options={dptoOptions}
                            icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                        <FilterDropdown
                            value={filterCity}
                            onChange={setFilterCity}
                            options={cityOptions}
                            icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            }
                        />
                        <FilterDropdown
                            value={filterClassification}
                            onChange={setFilterClassification}
                            options={classOptions}
                            icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            }
                        />
                        <FilterDropdown
                            value={filterType}
                            onChange={setFilterType}
                            options={typeOptions}
                            icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            }
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-saas-500"></div>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-20 w-full glass-card rounded-2xl border border-white/5 theme-light:bg-white theme-light:border-slate-200">
                        <Typography variant="h3" className="mb-2">No se encontraron proyectos</Typography>
                        <p className="text-gray-400 theme-light:text-slate-500">Ajuste los filtros o cree un nuevo proyecto en la vista de Proyectos.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                        {filteredProjects.map((project: any) => (
                            <div
                                key={project.id}
                                className="glass-card hover:bg-dark-800/80 transition-all cursor-pointer group rounded-xl overflow-hidden border border-white/5 shadow-lg group hover:shadow-saas-500/20 hover:border-saas-500/50 theme-light:bg-white theme-light:border-slate-200 theme-light:hover:bg-slate-50 theme-light:shadow-md theme-light:hover:shadow-lg theme-light:hover:border-saas-400 flex flex-col"
                                onClick={() => setSelectedProjectId(project.id)}
                            >
                                <div className="h-48 relative overflow-hidden bg-dark-900/50 theme-light:bg-slate-100 flex-shrink-0">
                                    {project.imagen_url ? (
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url(${getFullImageUrl(project.imagen_url)})` }}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-600 theme-light:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 to-transparent theme-light:from-slate-900/60" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="flex gap-2 mb-2">
                                            {project.is_vis && (
                                                <span className="bg-saas-500/20 text-saas-400 border border-saas-500/30 px-2 py-0.5 rounded text-xs font-bold theme-light:bg-saas-100 theme-light:text-saas-700 theme-light:border-saas-300">
                                                    VIS
                                                </span>
                                            )}
                                        </div>
                                        <Typography variant="h3" className="text-white drop-shadow-md truncate">{project.name}</Typography>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center text-gray-400 theme-light:text-slate-600">
                                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <span className="text-sm truncate">{project.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-saas-400 theme-light:text-saas-600 font-medium text-sm group-hover:text-saas-300 transition-colors pt-4 border-t border-white/5 theme-light:border-slate-100 mt-auto">
                                        <span>Ver Disponibilidad</span>
                                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
