import React from 'react';
import { NavItem } from '../molecules/NavItem';
import { UserWidget } from '../molecules/UserWidget';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/ThemeContext';

interface SidebarProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const icons: Record<string, React.ReactNode> = {
    'Resumen': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    'Proyectos': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    'Inventario': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    'Ventas': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'Reportes': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    'Recursos Humanos': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    'Conexion WhatsApp': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
    'Asistente IA': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    'Calendario': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
};

export const Sidebar: React.FC<SidebarProps> = ({ tabs, activeTab, onTabChange }) => {
    const { logout, user } = useAuth();
    const { isSidebarCollapsed, toggleSidebar } = useUI();

    const userRoleFormatted = user?.rol
        ? user.rol.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
        : 'Rol Desconocido';
    const initials = user?.sub ? user.sub.substring(0, 2).toUpperCase() : 'US';
    return (
        <aside className={`flex-shrink-0 relative border-r border-white/5 bg-gradient-to-b from-dark-900 to-dark-800 shadow-2xl hidden md:flex flex-col z-20 ${isSidebarCollapsed ? 'w-20' : 'w-64'} transition-[width] duration-300 ease-in-out`}>
            {/* Elegant outer border toggle button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3.5 top-8 bg-dark-800 border border-white/20 hover:border-saas-500 rounded-full text-gray-400 hover:text-saas-400 transition-colors focus:outline-none z-50 flex items-center justify-center w-7 h-7 shadow-lg"
                title={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}
            >
                <svg className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div className="p-4 flex items-center relative h-20">
                <div className={`flex items-center text-saas-400 font-bold tracking-tighter text-2xl absolute transition duration-300 ease-in-out ${isSidebarCollapsed ? 'left-1/2 -translate-x-1/2' : 'left-6'}`}>
                    <svg className="flex-shrink-0 w-8 h-8 text-saas-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <div className={`flex flex-col ml-3 transition duration-300 ease-in-out ${isSidebarCollapsed ? 'opacity-0 translate-x-[-10px] pointer-events-none absolute' : 'opacity-100 translate-x-0 relative'}`}>
                        <span className="tracking-wide">PLANIMY</span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold leading-none">by LIXAN</span>
                    </div>
                </div>
            </div>

            <nav className={`flex-1 ${isSidebarCollapsed ? 'px-2' : 'px-4'} space-y-2 mt-4`}>
                {tabs.map((tab) => (
                    <NavItem
                        key={tab}
                        label={tab}
                        icon={icons[tab as keyof typeof icons] || icons['Resumen']}
                        isActive={activeTab === tab}
                        onClick={() => onTabChange(tab)}
                        isCollapsed={isSidebarCollapsed}
                    />
                ))}
            </nav>

            <div className="p-4 border-t border-white/10 flex items-center relative h-16">
                <div className={`absolute left-4 transition duration-300 ease-in-out whitespace-nowrap origin-left ${isSidebarCollapsed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                    <UserWidget name={userRoleFormatted} email={user?.sub || 'Usuario'} initials={initials} />
                </div>
                <button
                    onClick={logout}
                    className={`text-gray-500 hover:text-red-400 transition-colors duration-300 absolute ${isSidebarCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-4'}`}
                    title="Cerrar sesión"
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
            </div>
        </aside >
    );
};
