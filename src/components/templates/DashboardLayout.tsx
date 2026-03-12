import React from 'react';
import { Sidebar } from '../organisms/Sidebar';


interface DashboardLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, onTabChange }) => {
    const tabs = ['Resumen', 'Proyectos', 'Disponibilidad', 'Clientes', 'Recursos Humanos', 'Conexion WhatsApp', 'Asistente IA', 'Reportes', 'Calendario'];

    return (
        <div className="min-h-screen bg-dark-900 text-white theme-light:bg-slate-50 theme-light:text-slate-900 flex overflow-hidden">
            <Sidebar tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
                {/* Glow Effects removed for performance */}

                {children}
            </main>
        </div>
    );
};
