import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import { FilterDropdown } from '../atoms/FilterDropdown';
import { DEPARTAMENTOS, COLOMBIA_LOCATIONS } from '../../utils/colombia_locations';
import { projectService, getFullImageUrl } from '../../services/api';

const COMMON_ZONAS = [
    "Piscina",
    "Gimnasio",
    "Salón Social",
    "Parque Infantil",
    "BBQ",
    "Cancha Múltiple",
    "Zonas Verdes",
    "Coworking",
    "Sala de Cine",
    "Terraza / Rooftop",
    "Turco / Sauna",
    "Juegos de Mesa",
    "Cancha de Squash",
    "Parqueadero Visitantes"
];

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [nombre, setNombre] = useState('');
    const [departamento, setDepartamento] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [esVis, setEsVis] = useState(false);
    const [tipoInmueble, setTipoInmueble] = useState('Apartamentos');
    const [selectedZonas, setSelectedZonas] = useState<string[]>([]);
    const [imagenUrl, setImagenUrl] = useState('');
    const [telefonoContacto, setTelefonoContacto] = useState('');
    const [correoContacto, setCorreoContacto] = useState('');
    const [direccion, setDireccion] = useState('');
    const [loading, setLoading] = useState(false);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [dynamicZonas, setDynamicZonas] = useState<string[]>([]);
    const [nuevaZona, setNuevaZona] = useState('');
    const [addingZona, setAddingZona] = useState(false);

    const loadDynamicZonas = async () => {
        try {
            const data = await projectService.getZonasSociales();
            setDynamicZonas(data.map((z: any) => z.nombre));
        } catch (error) {
            console.error("Error loading zonas sociales", error);
        }
    };

    React.useEffect(() => {
        loadDynamicZonas();
        if (isOpen) {
            if (initialData) {
                setNombre(initialData.nombre || '');
                setDepartamento(initialData.departamento || '');
                setCiudad(initialData.ciudad || '');
                setEsVis(initialData.es_vis || false);
                setTipoInmueble(initialData.tipo_inmueble || 'Apartamentos');
                setSelectedZonas(initialData.zonas_sociales || []);
                setImagenUrl(initialData.imagen_url || '');
                setTelefonoContacto(initialData.telefono_contacto || '');
                setCorreoContacto(initialData.correo_contacto || '');
                setDireccion(initialData.direccion || '');
            } else {
                setNombre('');
                setDepartamento('');
                setCiudad('');
                setEsVis(false);
                setTipoInmueble('Apartamentos');
                setSelectedZonas([]);
                setImagenUrl('');
                setTelefonoContacto('');
                setCorreoContacto('');
                setDireccion('');
                setImageFile(null);
                setImagePreview(null);
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        let finalImageUrl = imagenUrl;
        if (imageFile) {
            try {
                const uploadRes = await projectService.uploadImageProject(imageFile);
                finalImageUrl = uploadRes.imagen_url;
            } catch (error) {
                console.error("Error uploading image:", error);
                alert("Hubo un error al subir la imagen. Por favor, intenta de nuevo.");
                setLoading(false);
                return;
            }
        }

        await onSubmit({
            nombre,
            departamento,
            ciudad,
            es_vis: esVis,
            tipo_inmueble: tipoInmueble,
            zonas_sociales: selectedZonas,
            imagen_url: finalImageUrl || null,
            telefono_contacto: telefonoContacto || null,
            correo_contacto: correoContacto || null,
            direccion: direccion || null
        });
        setLoading(false);
        setNombre('');
        setDepartamento('');
        setCiudad('');
        setEsVis(false);
        setTipoInmueble('Apartamentos');
        setSelectedZonas([]);
        setImagenUrl('');
        setTelefonoContacto('');
        setCorreoContacto('');
        setDireccion('');
        setNuevaZona('');
        setImageFile(null);
        setImagePreview(null);
    };

    const handleAddZonaClick = async () => {
        if (!nuevaZona.trim()) return;
        setAddingZona(true);
        try {
            const data = await projectService.addZonaSocial({ nombre: nuevaZona.trim() });
            setDynamicZonas([...dynamicZonas, data.nombre]);
            setSelectedZonas([...selectedZonas, data.nombre]);
            setNuevaZona('');
        } catch (error) {
            console.error("Error adding zona", error);
        } finally {
            setAddingZona(false);
        }
    };

    const dptoOptions = DEPARTAMENTOS.map(d => ({ label: d, value: d }));
    const cityOptions = departamento && COLOMBIA_LOCATIONS[departamento]
        ? COLOMBIA_LOCATIONS[departamento].map(c => ({ label: c, value: c }))
        : [];

    const tipoOptions = [
        { label: 'Apartamentos', value: 'Apartamentos' },
        { label: 'Casas', value: 'Casas' },
        { label: 'Lotes/Terrenos', value: 'Lotes' },
        { label: 'Oficinas/Locales', value: 'Oficinas' },
        { label: 'Mixto', value: 'Mixto' }
    ];

    return (
        <div className="fixed inset-0 bg-dark-900/90 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-white/10 p-6 rounded-2xl w-full max-w-5xl shadow-2xl animate-fade-in relative flex flex-col max-h-[90vh] theme-light:bg-white theme-light:border-slate-200">
                {/* Glow removed for performance */}

                <div className="flex justify-between items-center mb-4 shrink-0">
                    <Typography variant="h2">{initialData ? 'Editar Proyecto' : 'Nuevo Proyecto'}</Typography>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors theme-light:text-slate-400 theme-light:hover:text-slate-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col relative z-10 overflow-hidden h-full">
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 theme-light:text-slate-600">Nombre del Proyecto</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-saas-500 transition-all theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white"
                                placeholder="Ej. Torres del Valle"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1 theme-light:text-slate-600">Departamento</label>
                                <FilterDropdown
                                    value={departamento}
                                    onChange={(val) => { setDepartamento(val); setCiudad(''); }}
                                    options={dptoOptions}
                                    placeholder="Seleccionar"
                                    variant="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1 theme-light:text-slate-600">Ciudad</label>
                                <FilterDropdown
                                    value={ciudad}
                                    onChange={setCiudad}
                                    options={cityOptions}
                                    placeholder={departamento ? "Seleccionar" : "Elija Dpto primero"}
                                    variant="input"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 theme-light:text-slate-600">Dirección</label>
                            <input
                                type="text"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-saas-500 transition-all theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white"
                                placeholder="Ej. Calle 123 # 45-67"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1 theme-light:text-slate-600">Teléfono de Contacto</label>
                                <input
                                    type="tel"
                                    value={telefonoContacto}
                                    onChange={(e) => setTelefonoContacto(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-saas-500 transition-all theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white"
                                    placeholder="Ej. 3001234567"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1 theme-light:text-slate-600">Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={correoContacto}
                                    onChange={(e) => setCorreoContacto(e.target.value)}
                                    className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-saas-500 transition-all theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white"
                                    placeholder="Ej. ventas@proyecto.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 theme-light:text-slate-600">Tipo de Inmueble</label>
                            <FilterDropdown
                                value={tipoInmueble}
                                onChange={setTipoInmueble}
                                options={tipoOptions}
                                variant="input"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-medium text-gray-400 theme-light:text-slate-600">Zonas Sociales</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={nuevaZona}
                                        onChange={(e) => setNuevaZona(e.target.value)}
                                        placeholder="Nueva zona..."
                                        className="bg-dark-900 border border-white/20 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-saas-500 theme-light:bg-white theme-light:border-slate-300 theme-light:text-slate-900 w-40"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddZonaClick}
                                        disabled={addingZona || !nuevaZona.trim()}
                                        className="bg-saas-500 text-dark-900 font-medium hover:bg-saas-400 text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:bg-gray-600 theme-light:bg-saas-500 theme-light:text-white theme-light:hover:bg-saas-600 shadow-sm"
                                    >
                                        {addingZona ? '...' : '+ Agregar'}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {Array.from(new Set([...COMMON_ZONAS, ...dynamicZonas])).map((zona) => (
                                    <label key={zona} className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer theme-light:text-slate-700 bg-dark-900 border border-white/5 p-2 rounded-lg hover:border-saas-500/50 transition-colors theme-light:bg-slate-50 theme-light:border-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={selectedZonas.includes(zona)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedZonas([...selectedZonas, zona]);
                                                } else {
                                                    setSelectedZonas(selectedZonas.filter(z => z !== zona));
                                                }
                                            }}
                                            className="w-4 h-4 text-saas-500 bg-dark-900 border-white/10 rounded focus:ring-saas-500 theme-light:border-slate-300 theme-light:bg-white flex-shrink-0"
                                        />
                                        <span className="truncate" title={zona}>{zona}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 theme-light:text-slate-600">Imagen del Proyecto (Opcional)</label>
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center justify-center w-full min-h-[100px] border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-saas-500/50 transition-colors bg-dark-900/50 theme-light:bg-slate-50 theme-light:border-slate-300 theme-light:hover:border-saas-500">
                                    {imagePreview || imagenUrl ? (
                                        <div className="relative w-full p-2 h-24 flex items-center justify-center">
                                            <img src={imagePreview || getFullImageUrl(imagenUrl)} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <svg className="w-8 h-8 text-gray-400 mb-2 theme-light:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                            <p className="text-sm text-gray-400 theme-light:text-slate-500">Click para subir archivo local</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setImageFile(e.target.files[0]);
                                                setImagePreview(URL.createObjectURL(e.target.files[0]));
                                                setImagenUrl(''); // Clear URL if file is selected
                                            }
                                        }}
                                    />
                                </label>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 theme-light:text-slate-400 whitespace-nowrap">o usa un Link:</span>
                                    <input
                                        type="text"
                                        value={imagenUrl}
                                        onChange={(e) => {
                                            setImagenUrl(e.target.value);
                                            // Clear file if URL is provided
                                            if (e.target.value) {
                                                setImageFile(null);
                                                setImagePreview(null);
                                            }
                                        }}
                                        className="flex-1 bg-dark-900 border border-white/10 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-saas-500 transition-all text-sm theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:text-slate-900 theme-light:focus:bg-white"
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                checked={esVis}
                                onChange={(e) => setEsVis(e.target.checked)}
                                id="vis-checkbox"
                                className="w-4 h-4 text-saas-500 bg-dark-900 border-white/10 rounded focus:ring-saas-500 theme-light:border-slate-300 theme-light:bg-white"
                            />
                            <label htmlFor="vis-checkbox" className="text-sm text-gray-300 cursor-pointer theme-light:text-slate-700">
                                Es Vivienda de Interés Social (VIS)
                            </label>
                        </div>

                    </div>

                    <div className="pt-4 mt-4 flex justify-end space-x-3 border-t border-white/10 shrink-0 theme-light:border-slate-200">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Crear Proyecto')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
