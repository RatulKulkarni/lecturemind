import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineBookOpen,
  HiOutlinePlusCircle,
  HiOutlineAcademicCap,
  HiOutlineRectangleStack,
  HiOutlineCloudArrowUp,
  HiOutlineArrowRight,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchSemester, createSemester } from '../../store/semesterSlice';
import { createUnit } from '../../store/unitSlice';
import PageTransition from '../../components/layout/PageTransition';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current, loading } = useAppSelector((s) => s.semester);

  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [semName, setSemName] = useState('');
  const [semYear, setSemYear] = useState('');
  const [unitTitle, setUnitTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchSemester());
  }, [dispatch]);

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const result = await dispatch(createSemester({ name: semName, year: semYear }));
    setCreating(false);
    if (createSemester.fulfilled.match(result)) {
      toast.success('Semester created!');
      setShowSemesterModal(false);
      setSemName('');
      setSemYear('');
      dispatch(fetchSemester());
    } else {
      toast.error('Failed to create semester');
    }
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current?.semester?.id) return;
    setCreating(true);
    const result = await dispatch(createUnit({ semesterId: current.semester.id, title: unitTitle }));
    setCreating(false);
    if (createUnit.fulfilled.match(result)) {
      toast.success('Unit created!');
      setShowUnitModal(false);
      setUnitTitle('');
      dispatch(fetchSemester());
    } else {
      toast.error('Failed to create unit');
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-surface-950"
            >
              {current?.semester ? (
                <>
                  <span className="gradient-text">{current.semester.name}</span>
                  <span className="text-surface-500 text-xl font-medium ml-3">{current.semester.academicYear}</span>
                </>
              ) : (
                'Dashboard'
              )}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-surface-600 mt-1"
            >
              {current?.semester ? 'Manage your units and lectures' : 'Get started by creating a semester'}
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
            {current?.semester && (
              <Button
                variant="secondary"
                icon={<HiOutlinePlusCircle className="w-4.5 h-4.5" />}
                onClick={() => setShowUnitModal(true)}
              >
                New Unit
              </Button>
            )}
            <Button
              icon={<HiOutlineAcademicCap className="w-4.5 h-4.5" />}
              onClick={() => setShowSemesterModal(true)}
            >
              {current?.semester ? 'New Semester' : 'Create Semester'}
            </Button>
          </motion.div>
        </div>

        {/* Stats row */}
        {current?.semester && (
          <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Units', value: current.units?.length || 0, icon: HiOutlineRectangleStack, color: 'from-primary-500 to-primary-600' },
              { label: 'Semester', value: current.semester.name, icon: HiOutlineAcademicCap, color: 'from-accent-500 to-pink-600' },
              { label: 'Year', value: current.semester.academicYear, icon: HiOutlineBookOpen, color: 'from-emerald-500 to-teal-600' },
            ].map((stat) => (
              <motion.div key={stat.label} variants={item}>
                <Card className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-surface-600">{stat.label}</p>
                      <p className="text-xl font-bold text-surface-950">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Units grid */}
        {current?.units && current.units.length > 0 ? (
          <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {current.units.map((unit, index) => (
              <motion.div key={unit.id} variants={item}>
                <Card
                  hoverable
                  onClick={() => navigate(`/unit/${unit.id}`)}
                  className="p-6 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/15 to-primary-500/5 border border-primary-500/10 flex items-center justify-center">
                      <HiOutlineBookOpen className="w-5.5 h-5.5 text-primary-600" />
                    </div>
                    <span className="text-xs font-medium text-surface-500 bg-surface-200 px-2.5 py-1 rounded-full">
                      Unit {index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-2 group-hover:text-primary-300 transition-colors">
                    {unit.title}
                  </h3>
                  <div className="flex items-center text-sm text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View lectures
                    <HiOutlineArrowRight className="w-4 h-4 ml-1.5 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </motion.div>
            ))}

            {/* Add Unit card */}
            <motion.div variants={item}>
              <Card
                hoverable
                onClick={() => setShowUnitModal(true)}
                className="p-6 border-dashed border-2 border-surface-300/40 bg-surface-100/50 flex flex-col items-center justify-center min-h-[160px]"
              >
                <HiOutlinePlusCircle className="w-8 h-8 text-surface-500 mb-2" />
                <span className="text-sm font-medium text-surface-600">Add New Unit</span>
              </Card>
            </motion.div>
          </motion.div>
        ) : current?.semester ? (
          <EmptyState
            icon={<HiOutlineBookOpen className="w-10 h-10" />}
            title="No units yet"
            description="Create your first unit to start organizing lectures."
            action={
              <Button icon={<HiOutlinePlusCircle className="w-4 h-4" />} onClick={() => setShowUnitModal(true)}>
                Create Unit
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<HiOutlineAcademicCap className="w-10 h-10" />}
            title="No semester found"
            description="Create a semester to get started with LectureMind."
            action={
              <Button icon={<HiOutlineAcademicCap className="w-4 h-4" />} onClick={() => setShowSemesterModal(true)}>
                Create Semester
              </Button>
            }
          />
        )}
      </div>

      {/* Create Semester Modal */}
      <Modal isOpen={showSemesterModal} onClose={() => setShowSemesterModal(false)} title="Create Semester">
        <form onSubmit={handleCreateSemester} className="space-y-4">
          <Input label="Semester Name" placeholder="e.g. Fall 2026" value={semName} onChange={(e) => setSemName(e.target.value)} required />
          <Input label="Academic Year" placeholder="e.g. 2026-2027" value={semYear} onChange={(e) => setSemYear(e.target.value)} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowSemesterModal(false)}>Cancel</Button>
            <Button type="submit" loading={creating}>Create Semester</Button>
          </div>
        </form>
      </Modal>

      {/* Create Unit Modal */}
      <Modal isOpen={showUnitModal} onClose={() => setShowUnitModal(false)} title="Create Unit">
        <form onSubmit={handleCreateUnit} className="space-y-4">
          <Input label="Unit Title" placeholder="e.g. Introduction to AI" value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowUnitModal(false)}>Cancel</Button>
            <Button type="submit" loading={creating}>Create Unit</Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}
