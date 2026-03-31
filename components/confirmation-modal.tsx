'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmationModalProps) {
  const variantColors = {
    danger: 'bg-red-600 hover:bg-red-700 shadow-red-600/20',
    warning: 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20',
    info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
  };

  const iconColors = {
    danger: 'text-red-500 bg-red-500/10',
    warning: 'text-orange-500 bg-orange-500/10',
    info: 'text-blue-500 bg-blue-500/10'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-[2rem] p-8 shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${iconColors[variant]}`}>
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-white/40 text-sm mb-8 leading-relaxed">
              {message}
            </p>

            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 font-bold text-sm hover:bg-white/5 transition-all text-white/60"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-lg text-white ${variantColors[variant]}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
