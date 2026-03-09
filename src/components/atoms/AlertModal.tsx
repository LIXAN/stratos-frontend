import React from 'react';
import { Typography } from './Typography';
import { Button } from './Button';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    buttonText?: string;
    isError?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({
    isOpen, onClose, title, message, buttonText = 'Entendido', isError = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-dark-900/90 flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="bg-dark-800 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative theme-light:bg-white theme-light:border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                    {isError ? (
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 theme-light:bg-red-100">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 theme-light:bg-blue-100">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    )}
                    <Typography variant="h3" className="text-white theme-light:text-slate-900 leading-tight">
                        {title}
                    </Typography>
                </div>
                <p className="text-gray-400 text-sm mb-6 mt-4 theme-light:text-slate-600">
                    {message}
                </p>

                <div className="flex justify-end">
                    <Button variant="primary" onClick={onClose} className={isError ? "bg-red-500 hover:bg-red-600 border-red-500" : ""}>
                        {buttonText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
