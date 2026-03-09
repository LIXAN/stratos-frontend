import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
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
        primary: "bg-saas-500 hover:bg-saas-400 text-dark-900", // Added the missing comma here as per instruction
        secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800", // Added a placeholder secondary variant for completeness
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
