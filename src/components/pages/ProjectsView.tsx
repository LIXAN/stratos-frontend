import React, { useState, useEffect } from 'react';
import { ProjectModal } from '../organisms/ProjectModal';
import { projectService, getFullImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../organisms/Header';
import { ProjectDetailsView } from './ProjectDetailsView';
import { FilterDropdown } from '../atoms/FilterDropdown';

export const ProjectsView: React.FC = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const { token } = useAuth();

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
                towers: p.torres ? p.torres.length : 0,
                progress: p.es_vis ? 100 : 0, // Mock for VIS flag in progress column for now
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

    const handleCreateProject = async (data: any) => {
        await projectService.createProject(data);
        setIsModalOpen(false);
        fetchProjects(); // Recargar la tabla
    };

    const [filterDepartment, setFilterDepartment] = useState('Todos');
    const [filterCity, setFilterCity] = useState('Todas');
    const [filterClassification, setFilterClassification] = useState('Todas');
    const [filterType, setFilterType] = useState('Todas');

    // Dynamically derive departments from uploaded projects
    const uniqueDepartments = Array.from(new Set(projects.map((p: any) => p.departamento ? p.departamento.trim() : ''))).filter(Boolean);

    // Filter cities dynamically based on selected department to avoid clutter
    const uniqueCities = Array.from(new Set(projects.filter((p: any) => filterDepartment === 'Todos' || p.departamento === filterDepartment).map((p: any) => p.ciudad ? p.ciudad.trim() : ''))).filter(Boolean);

    const filteredProjects = projects.filter((p: any) => {
        const matchesDpto = filterDepartment === 'Todos' || (p.departamento && p.departamento.trim() === filterDepartment);
        const matchesCity = filterCity === 'Todas' || (p.ciudad && p.ciudad.trim() === filterCity);

        let matchesClass = true;
        if (filterClassification === 'VIS') matchesClass = p.is_vis === true;
        if (filterClassification === 'NO VIS') matchesClass = p.is_vis === false;

        const matchesType = filterType === 'Todas' || p.tipo_inmueble === filterType;

        return matchesDpto && matchesCity && matchesClass && matchesType;
    });

    const dptoOptions = [
        { label: 'Todos los Departamentos', value: 'Todos' },
        ...uniqueDepartments.map(d => ({ label: String(d), value: String(d) }))
    ];

    const cityOptions = [
        { label: 'Todas las Ciudades', value: 'Todas' },
        ...uniqueCities.map(c => ({ label: String(c), value: String(c) }))
    ];

    const classOptions = [
        { label: 'Clasificación', value: 'Todas' },
        { label: 'VIS', value: 'VIS' },
        { label: 'NO VIS', value: 'NO VIS' }
    ];

    const typeOptions = [
        { label: 'Tipo inmueble', value: 'Todas' },
        { label: 'Apartamentos', value: 'Apartamentos' },
        { label: 'Casas', value: 'Casas' },
        { label: 'Lotes/Terrenos', value: 'Lotes' },
        { label: 'Oficinas/Locales', value: 'Oficinas' },
        { label: 'Mixto', value: 'Mixto' }
    ];

    if (selectedProjectId) {
        return <ProjectDetailsView projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />;
    }

    return (
        <div className="animate-fade-in flex-1 flex flex-col relative w-full h-full">
            <Header
                title="Proyectos"
                subtitle="Gestión del catálogo inmobiliario"
                actionLabel="+ Nuevo Proyecto"
                onAction={() => setIsModalOpen(true)}
            />
            <div className="p-8">
                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
                    <span className="text-gray-400 font-medium text-sm tracking-wider uppercase theme-light:text-slate-500">Filtrar por:</span>

                    <div className="flex flex-wrap gap-3">
                        {/* Department Filter */}
                        <FilterDropdown
                            value={filterDepartment}
                            onChange={(val) => {
                                setFilterDepartment(val);
                                setFilterCity('Todas'); // Reset city when changing dpto
                            }}
                            options={dptoOptions}
                            icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />

                        {/* City Filter */}
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

                        {/* Classification Filter (VIS / No VIS) */}
                        <FilterDropdown
                            value={filterClassification}
                            onChange={setFilterClassification}
                            options={classOptions}
                            icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            }
                        />

                        {/* Property Type Filter */}
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

                {/* Render Grid of Cards instead of Table */}
                {!loading ? (
                    filteredProjects.length > 0 ? (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
                            {filteredProjects.map((project: any) => (
                                <div
                                    key={project.id}
                                    className="relative flex flex-col h-80 rounded-2xl overflow-hidden group shadow-lg cursor-pointer transform-gpu transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl theme-light:border theme-light:border-slate-200"
                                    onClick={() => setSelectedProjectId(project.id)}
                                >
                                    {/* Background Image / Gradient */}
                                    {project.imagen_url ? (
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                            style={{ backgroundImage: `url(${getFullImageUrl(project.imagen_url)})` }}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-dark-800 theme-light:bg-slate-300 transition-transform duration-700 group-hover:scale-105" />
                                    )}
                                    {/* Usamos un gradient oscuro desde abajo incluso en modo claro para que los textos blancos se lean bien sobre cualquier imagen */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent theme-light:from-slate-900/90 theme-light:via-slate-900/50 theme-light:to-transparent/10" />

                                    {/* Top badges */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="bg-saas-500 text-white text-xs px-3 py-1 rounded-full shadow-sm font-semibold">
                                            {project.ciudad || 'Sin ciudad'}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        {project.is_vis && (
                                            <span className="bg-emerald-500/90 text-white text-xs px-2 py-1 rounded shadow-sm font-semibold">
                                                VIS
                                            </span>
                                        )}
                                    </div>

                                    {/* Bottom Content */}
                                    <div className="relative mt-auto p-5 flex flex-col">
                                        {/* El texto vuelve a ser blanco en modo claro porque el fondo vuelve a oscurecerse en la parte inferior */}
                                        <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">
                                            {project.name}
                                        </h3>
                                        <div className="flex items-center text-gray-200 text-sm mb-4">
                                            <svg className="w-4 h-4 mr-1 text-saas-400 theme-light:text-saas-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <span className="drop-shadow-sm">{project.location}</span>
                                        </div>

                                        {/* Progress Bar (Mock concept) */}
                                        <div className="w-full bg-white/20 theme-light:bg-white/30 rounded-full h-1.5 mb-5">
                                            <div className="bg-saas-400 theme-light:bg-saas-500 h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                        </div>

                                        <button
                                            className="w-full bg-dark-900/80 hover:bg-saas-500 border border-white/10 hover:border-saas-400 theme-light:bg-slate-900/60 theme-light:text-white theme-light:border-transparent theme-light:hover:bg-saas-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-saas-500/20 theme-light:shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProjectId(project.id);
                                            }}
                                        >
                                            Gestionar Proyecto
                                        </button>
                                    </div>
                                </div>
                            ))
                            }
                        </div >
                    ) : (
                        <div className="text-center text-gray-500 py-16 border-2 border-dashed border-white/10 rounded-2xl theme-light:border-slate-200 theme-light:text-slate-500">
                            No se encontraron proyectos con los filtros actuales.
                        </div>
                    )
                ) : (
                    <div className="text-center text-gray-400 py-10 animate-pulse">Cargando catálogo...</div>
                )}
            </div >

            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateProject}
            />
        </div >
    );
};
