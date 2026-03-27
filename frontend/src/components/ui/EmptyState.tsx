import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div variants={item} className="w-20 h-20 rounded-2xl bg-primary-950/50 border border-primary-800/30 flex items-center justify-center mb-5 text-primary-400">
        {icon}
      </motion.div>
      <motion.h3 variants={item} className="text-lg font-semibold text-surface-950 mb-2">
        {title}
      </motion.h3>
      <motion.p variants={item} className="text-surface-500 max-w-sm mb-6">
        {description}
      </motion.p>
      {action && <motion.div variants={item}>{action}</motion.div>}
    </motion.div>
  );
}
