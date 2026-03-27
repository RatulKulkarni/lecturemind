import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  HiOutlineCloudArrowUp,
  HiOutlineVideoCamera,
  HiOutlineScissors,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineDocumentArrowUp,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { uploadSingleLecture, uploadSplitLecture, resetUpload } from '../../store/uploadSlice';
import { fetchSemester } from '../../store/semesterSlice';
import PageTransition from '../../components/layout/PageTransition';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

type UploadMode = 'single' | 'split';

export default function UploadPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { uploading, progress, error } = useAppSelector((s) => s.upload);
  const { current: semester } = useAppSelector((s) => s.semester);

  const [mode, setMode] = useState<UploadMode>('single');
  const [file, setFile] = useState<File | null>(null);

  // Single upload
  const [unitId, setUnitId] = useState(searchParams.get('unitId') || '');
  const [title, setTitle] = useState('');

  // Split upload
  const [currentUnitId, setCurrentUnitId] = useState(searchParams.get('unitId') || '');
  const [nextUnitId, setNextUnitId] = useState('');
  const [splitTime, setSplitTime] = useState('');
  const [titlePart1, setTitlePart1] = useState('');
  const [titlePart2, setTitlePart2] = useState('');

  useEffect(() => {
    dispatch(fetchSemester());
    return () => { dispatch(resetUpload()); };
  }, [dispatch]);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm'] },
    maxFiles: 1,
    maxSize: 1024 * 1024 * 1024,
  });

  const handleSingleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a video file'); return; }
    const result = await dispatch(uploadSingleLecture({ unitId, title, file }));
    if (uploadSingleLecture.fulfilled.match(result)) {
      toast.success('Lecture uploaded successfully!');
      setTimeout(() => navigate(`/unit/${unitId}`), 1500);
    } else {
      toast.error('Upload failed');
    }
  };

  const handleSplitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a video file'); return; }
    const result = await dispatch(uploadSplitLecture({
      currentUnitId, nextUnitId, splitTime, titlePart1, titlePart2, file,
    }));
    if (uploadSplitLecture.fulfilled.match(result)) {
      toast.success('Split lecture uploaded successfully!');
      setTimeout(() => navigate(`/unit/${currentUnitId}`), 1500);
    } else {
      toast.error('Upload failed');
    }
  };

  const units = semester?.units || [];

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-surface-950">Upload Lecture</h1>
          <p className="text-surface-600 mt-1">Upload a video lecture for AI processing</p>
        </motion.div>

        {/* Mode selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          {[
            { key: 'single' as const, label: 'Single Upload', icon: HiOutlineVideoCamera },
            { key: 'split' as const, label: 'Split Upload', icon: HiOutlineScissors },
          ].map((m) => (
            <motion.button
              key={m.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode(m.key)}
              className={`
                flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-medium text-sm
                border-2 transition-all duration-200 cursor-pointer
                ${mode === m.key
                  ? 'border-primary-500 bg-primary-600/10 text-primary-300'
                  : 'border-surface-300/40 bg-surface-100 text-surface-600 hover:border-surface-300'
                }
              `}
            >
              <m.icon className="w-5 h-5" />
              {m.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Dropzone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
              transition-all duration-300
              ${isDragActive
                ? 'border-primary-400 bg-primary-600/10'
                : file
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-surface-300/50 bg-surface-100 hover:border-primary-500/40 hover:bg-primary-600/5'
              }
            `}
          >
            <input {...getInputProps()} />
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <HiOutlineCheckCircle className="w-7 h-7 text-emerald-400" />
                  </div>
                  <p className="text-lg font-semibold text-surface-900">{file.name}</p>
                  <p className="text-sm text-surface-600">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors cursor-pointer"
                  >
                    Remove file
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary-600/10 border border-primary-500/20 flex items-center justify-center mx-auto">
                    <HiOutlineDocumentArrowUp className="w-7 h-7 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-surface-800">
                      {isDragActive ? 'Drop your video here' : 'Drag & drop your video'}
                    </p>
                    <p className="text-sm text-surface-600 mt-1">
                      or <span className="text-primary-400 font-medium">browse</span> to choose a file. Max 1 GB.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {['MP4', 'AVI', 'MOV', 'MKV', 'WEBM'].map((ext) => (
                      <span key={ext} className="text-xs bg-surface-200 text-surface-600 px-2 py-0.5 rounded-md">{ext}</span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Upload progress */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-surface-700">Uploading...</span>
                  <span className="text-sm font-bold text-primary-400">{progress}%</span>
                </div>
                <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <AnimatePresence mode="wait">
              {mode === 'single' ? (
                <motion.form
                  key="single"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSingleUpload}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-surface-700">Unit</label>
                    <select
                      value={unitId}
                      onChange={(e) => setUnitId(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-surface-300/50 bg-surface-200 text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                    >
                      <option value="">Select a unit</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>{u.title}</option>
                      ))}
                    </select>
                  </div>
                  <Input label="Lecture Title" placeholder="e.g. Lecture 1 - Introduction" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  <Button type="submit" loading={uploading} className="w-full" size="lg" icon={<HiOutlineCloudArrowUp className="w-5 h-5" />}>
                    Upload Lecture
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="split"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSplitUpload}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-surface-700">Current Unit</label>
                      <select
                        value={currentUnitId}
                        onChange={(e) => setCurrentUnitId(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-surface-300/50 bg-surface-200 text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                      >
                        <option value="">Select unit</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>{u.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-surface-700">Next Unit</label>
                      <select
                        value={nextUnitId}
                        onChange={(e) => setNextUnitId(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-surface-300/50 bg-surface-200 text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                      >
                        <option value="">Select unit</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>{u.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Input
                    label="Split Time (HH:MM)"
                    placeholder="01:30"
                    value={splitTime}
                    onChange={(e) => setSplitTime(e.target.value)}
                    required
                    pattern="\d{2}:\d{2}"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Part 1 Title" placeholder="First half title" value={titlePart1} onChange={(e) => setTitlePart1(e.target.value)} required />
                    <Input label="Part 2 Title" placeholder="Second half title" value={titlePart2} onChange={(e) => setTitlePart2(e.target.value)} required />
                  </div>
                  <Button type="submit" loading={uploading} className="w-full" size="lg" icon={<HiOutlineScissors className="w-5 h-5" />}>
                    Upload & Split
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
