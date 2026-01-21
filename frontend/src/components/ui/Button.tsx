import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "inline-flex justify-center py-2.5 px-5 border text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 focus:ring-offset-slate-900 shadow-lg";

    const variants = {
        primary: "border-transparent text-white bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-500 shadow-indigo-500/20",
        secondary: "border-slate-600 text-slate-200 bg-slate-800 hover:bg-slate-700 focus:ring-slate-500",
        danger: "border-transparent text-white bg-rose-600 hover:bg-rose-500 focus:ring-rose-500 shadow-rose-500/20"
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
