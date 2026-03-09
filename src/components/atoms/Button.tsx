import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = "font-semibold py-2 px-6 rounded-lg transition transform hover:-translate-y-1";

    // This object was implicitly missing its declaration and the 'secondary' variant.
    // Assuming the intent was to define a 'variants' object.
    const variants = {
        primary: "bg-saas-500 hover:bg-saas-400 text-dark-900 border border-transparent shadow-lg shadow-saas-500/20",
        secondary: "bg-dark-800 hover:bg-dark-700 text-gray-300 border border-white/10 theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-700 theme-light:hover:bg-slate-50 shadow-sm transition-colors",
        outline: "bg-transparent hover:bg-white/5 text-gray-300 border border-white/20 theme-light:border-slate-300 theme-light:text-slate-700 theme-light:hover:bg-slate-50 shadow-sm transition-colors",
        ghost: "text-gray-400 hover:text-white hover:bg-white/5 theme-light:text-slate-600 theme-light:hover:text-slate-900 theme-light:hover:bg-slate-100",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
