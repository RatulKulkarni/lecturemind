import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineArrowLeft,
  HiOutlineArrowDownTray,
  HiOutlineQuestionMarkCircle,
  HiOutlineChevronDown,
  HiOutlineLightBulb,
  HiOutlineChartBar,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import PageTransition from '../../components/layout/PageTransition';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface BloomDistribution {
  remember: number;
  understand: number;
  apply: number;
  analyze: number;
  evaluate: number;
}

interface Questions {
  remember: string[];
  understand: string[];
  apply: string[];
  analyze: string[];
  evaluate: string[];
}

interface Concept {
  concept_id: string;
  text: string;
  score: number;
  word_count: number;
  emphasis_count: number;
}

interface QuestionBankData {
  total_questions: number;
  bloom_distribution: BloomDistribution;
  questions: Questions;
  warnings: string[];
  concepts: Concept[];
}

const bloomColors: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  remember: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', bar: 'bg-blue-500' },
  understand: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  apply: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', bar: 'bg-amber-500' },
  analyze: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', bar: 'bg-purple-500' },
  evaluate: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', bar: 'bg-rose-500' },
};

function BloomSection({ level, questions, count }: { level: string; questions: string[]; count: number }) {
  const [open, setOpen] = useState(false);
  const colors = bloomColors[level];

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>{level}</span>
          <span className="text-xs font-medium text-surface-500 bg-surface-200/50 px-2 py-0.5 rounded-full">
            {count} question{count !== 1 ? 's' : ''}
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <HiOutlineChevronDown className={`w-5 h-5 ${colors.text}`} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3">
              {questions.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex gap-3 text-sm"
                >
                  <span className={`font-mono text-xs mt-0.5 ${colors.text} flex-shrink-0`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-surface-800 leading-relaxed">{q}</span>
                </motion.div>
              ))}
              {questions.length === 0 && (
                <p className="text-sm text-surface-500 italic">No questions generated for this level.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function QuestionBankViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<QuestionBankData | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'questions' | 'concepts'>('questions');

  useEffect(() => {
    if (!id) return;
    let url: string | null = null;
    (async () => {
      try {
        // Fetch the PDF for download
        const pdfRes = await api.get(`/unit/getquestionbank/${id}`, { responseType: 'blob' });
        url = URL.createObjectURL(pdfRes.data);
        setPdfUrl(url);

        // Try to fetch structured JSON data (if the backend provides it)
        // For now, we'll parse from unit data
        try {
          const unitRes = await api.get(`/unit/getunit/${id}`);
          if (unitRes.data?.questionBank) {
            setData(unitRes.data.questionBank);
          }
        } catch {
          // Question bank data not available as JSON — PDF-only mode
        }
      } catch {
        setError('Failed to load question bank');
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
    a.download = `unit-${id}-questionbank.pdf`;
    a.click();
    toast.success('Download started');
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const bloomLevels = data ? (['remember', 'understand', 'apply', 'analyze', 'evaluate'] as const) : [];
  const maxBloom = data ? Math.max(...Object.values(data.bloom_distribution), 1) : 1;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <HiOutlineQuestionMarkCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-surface-950">Question Bank</h1>
                <p className="text-sm text-surface-600">
                  {data ? `${data.total_questions} questions across ${bloomLevels.length} Bloom's levels` : 'PDF Document'}
                </p>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            icon={<HiOutlineArrowDownTray className="w-4 h-4" />}
            onClick={handleDownload}
            disabled={!pdfUrl}
          >
            Download PDF
          </Button>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <HiOutlineQuestionMarkCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-surface-600">{error}</p>
          </div>
        ) : data ? (
          <>
            {/* Bloom Distribution Chart */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <HiOutlineChartBar className="w-5 h-5 text-primary-400" />
                <h2 className="text-base font-semibold text-surface-900">Bloom&apos;s Taxonomy Distribution</h2>
              </div>
              <div className="space-y-3">
                {bloomLevels.map((level) => {
                  const count = data.bloom_distribution[level];
                  const pct = (count / maxBloom) * 100;
                  const colors = bloomColors[level];
                  return (
                    <div key={level} className="flex items-center gap-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-surface-600 w-24">{level}</span>
                      <div className="flex-1 h-3 bg-surface-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                          className={`h-full rounded-full ${colors.bar}`}
                        />
                      </div>
                      <span className="text-sm font-bold text-surface-800 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Tab Selector */}
            <div className="flex gap-2">
              {[
                { key: 'questions' as const, label: 'Questions', icon: HiOutlineQuestionMarkCircle },
                { key: 'concepts' as const, label: 'Concepts', icon: HiOutlineLightBulb },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer
                    ${tab === t.key
                      ? 'bg-primary-600/15 text-primary-300 border border-primary-500/20'
                      : 'text-surface-600 hover:bg-surface-200/50 border border-transparent'
                    }
                  `}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {tab === 'questions' ? (
                <motion.div
                  key="questions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {bloomLevels.map((level) => (
                    <BloomSection
                      key={level}
                      level={level}
                      questions={data.questions[level]}
                      count={data.bloom_distribution[level]}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="concepts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {data.concepts && data.concepts.length > 0 ? (
                    data.concepts.map((concept, i) => (
                      <motion.div
                        key={concept.concept_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Card className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-surface-800 leading-relaxed">{concept.text}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-surface-500">
                                  Score: <span className="font-semibold text-primary-400">{(concept.score * 100).toFixed(0)}%</span>
                                </span>
                                <span className="text-xs text-surface-500">
                                  Words: <span className="font-semibold text-surface-700">{concept.word_count}</span>
                                </span>
                                <span className="text-xs text-surface-500">
                                  Emphasis: <span className="font-semibold text-accent-400">{concept.emphasis_count}</span>
                                </span>
                              </div>
                            </div>
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                              background: `conic-gradient(#6366f1 ${concept.score * 360}deg, #1e293b ${concept.score * 360}deg)`,
                            }}>
                              <div className="w-9 h-9 rounded-md bg-surface-100 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary-400">{(concept.score * 100).toFixed(0)}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <HiOutlineLightBulb className="w-10 h-10 text-surface-500 mx-auto mb-3" />
                      <p className="text-surface-600">No concept data available.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Warnings */}
            {data.warnings && data.warnings.length > 0 && (
              <Card className="p-4 border-amber-500/20 bg-amber-500/5">
                <h3 className="text-sm font-semibold text-amber-400 mb-2">Warnings</h3>
                <ul className="space-y-1">
                  {data.warnings.map((w, i) => (
                    <li key={i} className="text-sm text-surface-600">• {w}</li>
                  ))}
                </ul>
              </Card>
            )}
          </>
        ) : pdfUrl ? (
          /* PDF-only fallback if no structured data */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-surface-200/60 overflow-hidden bg-surface-100 shadow-xl shadow-black/20"
          >
            <iframe
              src={pdfUrl}
              className="w-full bg-surface-200"
              style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}
              title="Question Bank PDF"
            />
          </motion.div>
        ) : null}
      </div>
    </PageTransition>
  );
}
