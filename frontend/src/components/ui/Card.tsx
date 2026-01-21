import React from 'react';

interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
    return (
        <div className={`bg-slate-800 shadow-xl rounded-xl p-6 border border-slate-700/50 ${className}`}>
            {title && <h3 className="text-lg font-semibold text-slate-100 mb-4 tracking-tight">{title}</h3>}
            {children}
        </div>
    );
};
