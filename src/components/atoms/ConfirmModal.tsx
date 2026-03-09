import React from 'react';
import { Typography } from './Typography';
import { Button } from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    loading?: boolean;
    confirmText?: string;
    loadingText?: string;
    confirmButtonClass?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen, onClose, onConfirm, title, message, loading = false,
    confirmText = 'Eliminar', loadingText = 'Eliminando...',
    confirmButtonClass = "bg-red-500 hover:bg-red-600"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-dark-900/90 flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="bg-dark-800 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative theme-light:bg-white theme-light:border-slate-200">
                <Typography variant="h3" className="mb-2 text-white theme-light:text-slate-900">
                    {title}
                </Typography>
                <p className="text-gray-400 text-sm mb-6 theme-light:text-slate-600">
                    {message}
                </p>

                <div className="flex justify-end space-x-3 mt-6">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`${confirmButtonClass} text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? loadingText : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
