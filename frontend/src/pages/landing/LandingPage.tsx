import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineVideoCamera,
  HiOutlineDocumentText,
  HiOutlineQuestionMarkCircle,
  HiOutlineAcademicCap,
  HiOutlineBolt,
  HiOutlineArrowRight,
  HiOutlineCloudArrowUp,
  HiOutlineChartBar,
} from 'react-icons/hi2';

const fadeUp = {
  hidden: { opacity: 0, y: 30 } as const,
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const features = [
  {
    icon: HiOutlineVideoCamera,
    title: 'Video Upload & Transcription',
    desc: 'Upload lecture recordings and get accurate AI-powered transcriptions automatically.',
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: HiOutlineDocumentText,
    title: 'Smart Summarization',
    desc: 'Generate concise, structured notes from lengthy lectures in seconds.',
    color: 'from-accent-400 to-accent-600',
  },
  {
    icon: HiOutlineQuestionMarkCircle,
    title: 'Question Bank Generator',
    desc: 'Auto-generate questions across Bloom\'s taxonomy levels for assessments.',
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Concept Analysis',
    desc: 'Extract and score key concepts with emphasis tracking and word analysis.',
    color: 'from-amber-400 to-orange-500',
  },
  {
    icon: HiOutlineAcademicCap,
    title: 'Semester Management',
    desc: 'Organize courses into semesters and units with drag-and-drop reordering.',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    icon: HiOutlineBolt,
    title: 'Split Lecture Processing',
    desc: 'Split long recordings across units at a specified timestamp automatically.',
    color: 'from-violet-400 to-purple-600',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-600/8 blob" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent-400/8 blob" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary-400/5 blob" style={{ animationDelay: '4s' }} />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 flex items-center justify-between px-6 sm:px-12 lg:px-20 py-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <img src="/favicon.svg" alt="LectureMind" className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold gradient-text">LectureMind</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-medium text-surface-700 hover:text-surface-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 text-sm font-semibold bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/25 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 px-6 sm:px-12 lg:px-20 pt-16 pb-24 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-600/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-8"
          >
            <HiOutlineBolt className="w-4 h-4" />
            AI-Powered Education Platform
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6"
          >
            <span className="text-surface-950">Transform Lectures</span>
            <br />
            <span className="gradient-text">Into Knowledge</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-lg sm:text-xl text-surface-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Upload lecture videos and let AI transcribe, summarize, extract concepts,
            and generate question banks — all automatically.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 transition-all duration-200 text-base"
            >
              Start Free
              <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-surface-200 hover:bg-surface-300 text-surface-800 font-semibold rounded-xl border border-surface-300/50 transition-all duration-200 text-base"
            >
              <HiOutlineCloudArrowUp className="w-5 h-5" />
              Upload a Lecture
            </Link>
          </motion.div>
        </div>

        {/* Dashboard Preview Mockup */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-20 relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-surface-50 via-transparent to-transparent z-10 pointer-events-none" />
          <div className="rounded-2xl border border-surface-200/60 bg-surface-100 p-1 shadow-2xl shadow-black/30 overflow-hidden">
            <div className="rounded-xl bg-surface-50 p-6 min-h-[300px]">
              {/* Mock dashboard */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                <div className="flex-1" />
                <div className="h-5 w-40 rounded-md bg-surface-200 shimmer" />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-surface-200/50 border border-surface-300/30 shimmer" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-32 rounded-xl bg-surface-200/30 border border-surface-300/20 shimmer" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 sm:px-12 lg:px-20 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-950 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-surface-600 max-w-xl mx-auto">
            A complete AI toolkit for educators to process, organize, and assess lecture content.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group p-6 rounded-2xl bg-surface-100 border border-surface-200/60 hover:border-primary-500/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 shadow-lg`}>
                <feat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="relative text-lg font-semibold text-surface-900 mb-2">{feat.title}</h3>
              <p className="relative text-sm text-surface-600 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 sm:px-12 lg:px-20 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 gradient-bg" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-500/20" />
          <div className="relative z-10 px-8 sm:px-16 py-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Teaching?
            </h2>
            <p className="text-lg text-primary-200 mb-8 max-w-xl mx-auto">
              Join educators using AI to create better learning experiences.
            </p>
            <Link
              to="/register"
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl shadow-xl transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] text-base"
            >
              Get Started Free
              <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 sm:px-12 lg:px-20 py-8 border-t border-surface-200/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="LectureMind" className="w-5 h-5" />
            <span className="text-sm font-medium text-surface-600">LectureMind</span>
          </div>
          <p className="text-sm text-surface-500">&copy; {new Date().getFullYear()} LectureMind. Built with AI.</p>
        </div>
      </footer>
    </div>
  );
}
