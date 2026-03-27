import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function Card({ children, className = '', onClick, hoverable = false }: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4, boxShadow: '0 20px 40px -12px rgba(99, 102, 241, 0.25)' } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`
        bg-surface-100 rounded-2xl border border-surface-200/60 shadow-lg shadow-black/20
        ${hoverable ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
