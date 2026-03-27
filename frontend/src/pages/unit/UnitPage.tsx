import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineArrowLeft,
  HiOutlineVideoCamera,
  HiOutlineDocumentText,
  HiOutlineQuestionMarkCircle,
  HiOutlineCloudArrowDown,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineCog6Tooth,
  HiOutlineArrowRight,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchUnit, downloadNotes, downloadQuestionBank } from '../../store/unitSlice';
import PageTransition from '../../components/layout/PageTransition';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: <HiOutlineCheckCircle className="w-3.5 h-3.5" /> },
    PROCESSING: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: <HiOutlineCog6Tooth className="w-3.5 h-3.5 animate-spin" /> },
    UPLOADED: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: <HiOutlineClock className="w-3.5 h-3.5" /> },
  };
  const c = config[status] || config.UPLOADED;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.icon}
      {status}
    </span>
  );
}

export default function UnitPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current, loading } = useAppSelector((s) => s.unit);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (id) dispatch(fetchUnit(id));
  }, [dispatch, id]);

  const handleDownloadNotes = async () => {
    if (!id) return;
    setDownloading('notes');
    const result = await dispatch(downloadNotes(id));
    setDownloading(null);
    if (downloadNotes.fulfilled.match(result)) {
      const url = URL.createObjectURL(result.payload);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${current?.unit?.title || 'notes'}-notes.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Notes downloaded!');
    } else {
      toast.error('Failed to download notes');
    }
  };

  const handleDownloadQB = async () => {
    if (!id) return;
    setDownloading('qb');
    const result = await dispatch(downloadQuestionBank(id));
    setDownloading(null);
    if (downloadQuestionBank.fulfilled.match(result)) {
      const url = URL.createObjectURL(result.payload);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${current?.unit?.title || 'question-bank'}-qb.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Question bank downloaded!');
    } else {
      toast.error('Failed to download question bank');
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl hover:bg-surface-200 transition-colors text-surface-600 cursor-pointer"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl sm:text-3xl font-bold text-surface-950"
              >
                {current?.unit?.title || 'Unit'}
              </motion.h1>
              {current?.unit?.createdAt && (
                <p className="text-sm text-surface-600 mt-0.5">
                  Created {new Date(current.unit.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<HiOutlineDocumentText className="w-4 h-4" />}
              onClick={() => navigate(`/unit/${id}/notes`)}
            >
              View Notes
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<HiOutlineQuestionMarkCircle className="w-4 h-4" />}
              onClick={() => navigate(`/unit/${id}/questionbank`)}
            >
              View Question Bank
            </Button>
            <Button
              size="sm"
              icon={<HiOutlineVideoCamera className="w-4 h-4" />}
              onClick={() => navigate(`/upload?unitId=${id}`)}
            >
              Upload Lecture
            </Button>
          </motion.div>
        </div>

        {/* Lectures */}
        {current?.lectures && current.lectures.length > 0 ? (
          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-3">
            {current.lectures.map((lecture, index) => (
              <motion.div key={lecture.id} variants={item}>
                <Card className="p-4 sm:p-5 group hover:border-primary-500/30 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-primary-600/15 to-primary-500/5 border border-primary-500/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {lecture.thumbnailUrl ? (
                        <img src={lecture.thumbnailUrl} alt={lecture.title} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <HiOutlineVideoCamera className="w-7 h-7 text-primary-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-medium text-surface-500">#{index + 1}</span>
                        <StatusBadge status={lecture.status} />
                      </div>
                      <h3 className="text-base font-semibold text-surface-900 truncate group-hover:text-primary-300 transition-colors">
                        {lecture.title}
                      </h3>
                      <p className="text-sm text-surface-600 mt-0.5">
                        {new Date(lecture.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Arrow */}
                    <HiOutlineArrowRight className="w-5 h-5 text-surface-400 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={<HiOutlineVideoCamera className="w-10 h-10" />}
            title="No lectures yet"
            description="Upload your first lecture video to start processing."
            action={
              <Button
                icon={<HiOutlineVideoCamera className="w-4 h-4" />}
                onClick={() => navigate(`/upload?unitId=${id}`)}
              >
                Upload Lecture
              </Button>
            }
          />
        )}
      </div>
    </PageTransition>
  );
}
