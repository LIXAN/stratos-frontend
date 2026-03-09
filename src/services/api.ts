import axiosInstance from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getFullImageUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
};

export const api = axiosInstance.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: async (username: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    }
};

export const projectService = {
    getProjects: async () => {
        const response = await api.get('/proyectos');
        return response.data;
    },
    getProject: async (id: string) => {
        const response = await api.get(`/proyectos/${id}`);
        return response.data;
    },
    uploadImageProject: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/proyectos/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    createProject: async (data: any) => {
        const response = await api.post('/proyectos', data);
        return response.data;
    },
    updateProject: async (id: string, data: any) => {
        const response = await api.put(`/proyectos/${id}`, data);
        return response.data;
    },
    createTorre: async (projectId: string, data: any) => {
        const response = await api.post(`/proyectos/${projectId}/torres`, data);
        return response.data;
    },
    createTipoPlantilla: async (projectId: string, data: any) => {
        const response = await api.post(`/proyectos/${projectId}/tipos`, data);
        return response.data;
    },
    uploadImageTipo: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/proyectos/tipos/upload-image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    getTorre: async (projectId: string, torreId: string) => {
        const response = await api.get(`/proyectos/${projectId}/torres/${torreId}`);
        return response.data;
    },
    createPiso: async (projectId: string, torreId: string, data: any) => {
        const response = await api.post(`/proyectos/${projectId}/torres/${torreId}/pisos`, data);
        return response.data;
    },
    updatePiso: async (projectId: string, torreId: string, pisoId: string, data: any) => {
        const response = await api.put(`/proyectos/${projectId}/torres/${torreId}/pisos/${pisoId}`, data);
        return response.data;
    },
    updateTipoPlantilla: async (projectId: string, tipoId: string, data: any) => {
        const response = await api.put(`/proyectos/${projectId}/tipos/${tipoId}`, data);
        return response.data;
    },
    deleteTorre: async (projectId: string, torreId: string) => {
        const response = await api.delete(`/proyectos/${projectId}/torres/${torreId}`);
        return response.data;
    },
    updateTorre: async (projectId: string, torreId: string, data: any) => {
        const response = await api.put(`/proyectos/${projectId}/torres/${torreId}`, data);
        return response.data;
    },
    deletePiso: async (projectId: string, torreId: string, pisoId: string) => {
        const response = await api.delete(`/proyectos/${projectId}/torres/${torreId}/pisos/${pisoId}`);
        return response.data;
    },
    deleteTipoPlantilla: async (projectId: string, tipoId: string) => {
        const response = await api.delete(`/proyectos/${projectId}/tipos/${tipoId}`);
        return response.data;
    },
    getApartamentosPorPiso: async (projectId: string, torreId: string, pisoId: string) => {
        const response = await api.get(`/proyectos/${projectId}/torres/${torreId}/pisos/${pisoId}/apartamentos`);
        return response.data;
    },
    getZonasSociales: async () => {
        const response = await api.get('/proyectos/zonas-sociales/opciones');
        return response.data;
    },
    addZonaSocial: async (data: { nombre: string }) => {
        const response = await api.post('/proyectos/zonas-sociales/opciones', data);
        return response.data;
    },
    deleteProject: async (id: string) => {
        const response = await api.delete(`/proyectos/${id}`);
        return response.data;
    },
    duplicateTorre: async (projectId: string, torreId: string) => {
        const response = await api.post(`/proyectos/${projectId}/torres/${torreId}/duplicar`);
        return response.data;
    }
};

export const rrhhService = {
    getEmpleados: async (skip: number = 0, limit: number = 100) => {
        const response = await api.get(`/rrhh/empleados?skip=${skip}&limit=${limit}`);
        return response.data;
    },
    createEmpleado: async (data: any) => {
        const response = await api.post('/rrhh/empleados', data);
        return response.data;
    },
    updateEmpleado: async (id: string, data: any) => {
        const response = await api.put(`/rrhh/empleados/${id}`, data);
        return response.data;
    },
    deleteEmpleado: async (id: string) => {
        const response = await api.delete(`/rrhh/empleados/${id}`);
        return response.data;
    },
    getCargos: async () => {
        const response = await api.get('/rrhh/cargos');
        return response.data;
    },
    createCargo: async (data: { nombre: string }) => {
        const response = await api.post('/rrhh/cargos', data);
        return response.data;
    },
    updateCargo: async (id: string, data: { nombre: string }) => {
        const response = await api.put(`/rrhh/cargos/${id}`, data);
        return response.data;
    },
    deleteCargo: async (id: string) => {
        const response = await api.delete(`/rrhh/cargos/${id}`);
        return response.data;
    }
};
