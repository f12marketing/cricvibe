import React from 'react';
import { motion } from 'framer-motion';
import { CalendarX2 } from 'lucide-react';

export default function EmptyState({ message, subMessage, icon: Icon = CalendarX2 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-card flex flex-col items-center justify-center p-16 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-surfaceHover border border-border flex items-center justify-center mb-5">
        <Icon className="h-7 w-7 text-textMuted" />
      </div>
      <h3 className="text-lg font-display font-semibold text-textSecondary mb-2">{message}</h3>
      {subMessage && (
        <p className="text-sm text-textMuted max-w-sm leading-relaxed">
          {subMessage}
        </p>
      )}
    </motion.div>
  );
}
