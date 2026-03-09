import React, { useState } from 'react';
import { DashboardLayout } from '../templates/DashboardLayout';
import { DashboardResumenView } from './DashboardResumenView';
import { ProjectsView } from './ProjectsView';
import { RRHHView } from './RRHHView';

export const DashboardPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Resumen');

    const renderContent = () => {
        switch (activeTab) {
            case 'Proyectos':
                return <ProjectsView />;
            case 'Recursos Humanos':
                return <RRHHView />;
            case 'Conexion WhatsApp':
                return <div className="p-8 text-center text-gray-400">Pronto podrás configurar la conexión de WhatsApp desde aquí.</div>;
            case 'Asistente IA':
                return <div className="p-8 text-center text-gray-400">El Asistente de IA está en construcción.</div>;
            case 'Reportes':
                return <div className="p-8 text-center text-gray-400">Módulo de reportes en progreso.</div>;
            case 'Calendario':
                return <div className="p-8 text-center text-gray-400">El calendario interactivo estará disponible pronto.</div>;
            case 'Resumen':
            default:
                return <DashboardResumenView />;
        }
    };

    return (
        <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
            {renderContent()}
        </DashboardLayout>
    );
};
