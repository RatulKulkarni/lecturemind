import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineArrowDownTray, HiOutlineDocumentText } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import PageTransition from '../../components/layout/PageTransition';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function NotesViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let url: string | null = null;
    (async () => {
      try {
        const res = await api.get(`/unit/getnotes/${id}`, { responseType: 'blob' });
        url = URL.createObjectURL(res.data);
        setPdfUrl(url);
      } catch {
        setError('Failed to load notes PDF');
      } finally {
        setLoading(false);
      }
    })();
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [id]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `unit-${id}-notes.pdf`;
    a.click();
    toast.success('Download started');
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/unit/${id}`)}
              className="p-2 rounded-xl hover:bg-surface-200 transition-colors text-surface-600 cursor-pointer"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <HiOutlineDocumentText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-surface-950">Unit Notes</h1>
                <p className="text-sm text-surface-600">PDF Document</p>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            icon={<HiOutlineArrowDownTray className="w-4 h-4" />}
            onClick={handleDownload}
            disabled={!pdfUrl}
          >
            Download
          </Button>
        </div>

        {/* PDF Viewer */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <HiOutlineDocumentText className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-surface-600">{error}</p>
          </div>
        ) : pdfUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-surface-200/60 overflow-hidden bg-surface-100 shadow-xl shadow-black/20"
          >
            <iframe
              src={pdfUrl}
              className="w-full bg-surface-200"
              style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}
              title="Notes PDF"
            />
          </motion.div>
        ) : null}
      </div>
    </PageTransition>
  );
}
