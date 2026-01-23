import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', id, ...props }) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className="mb-5">
            <label
                htmlFor={inputId}
                className="block text-sm font-medium text-slate-400 mb-1.5 ml-0.5"
            >
                {label}
            </label>
            <input
                id={inputId}
                className={`
                    block w-full rounded-lg border-slate-600 bg-slate-900/50 text-slate-100 
                    shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border 
                    transition-colors duration-200 placeholder-slate-500
                    ${className}
                `}
                {...props}
            />
        </div>
    );
};
