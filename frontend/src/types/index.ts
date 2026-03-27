export interface User {
  id: string;
  name: string;
  email: string;
  currentSemesterId: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface Semester {
  id: string;
  name: string;
  academicYear: string;
  teacherId: string;
  createdAt: string;
  unitSequence: string[];
}

export interface SemesterResponse {
  semester: {
    id: string;
    name: string;
    academicYear: string;
  };
  units: Array<{
    id: string;
    title: string;
  }>;
}

export interface SemesterRequest {
  name: string;
  year: string;
}

export interface Unit {
  id: string;
  semesterId: string;
  title: string;
  createdAt: string;
  lectureSequence: string[];
  teacherId: string;
}

export interface UnitResponse {
  unit: {
    id: string;
    title: string;
    createdAt: string;
  };
  lectures: LectureInfo[];
}

export interface LectureInfo {
  id: string;
  title: string;
  thumbnailUrl: string;
  status: string;
  createdAt: string;
}

export interface UnitRequest {
  semesterId: string;
  title: string;
}

export interface Lecture {
  id: string;
  unitId: string;
  title: string;
  thumbnailPath: string;
  transcriptPath: string;
  annotatedTranscriptPath: string;
  status: string;
  createdAt: string;
  teacherId: string;
}

export interface SingleLectureUploadRequest {
  unitId: string;
  title: string;
}

export interface SplitLectureUploadRequest {
  currentUnitId: string;
  nextUnitId: string;
  splitTime: string;
  titlePart1: string;
  titlePart2: string;
}

export interface UnitSequenceChange {
  semesterId: string;
  sequence: string[];
}

export interface VideoSequenceChange {
  unitId: string;
  sequence: string[];
}

// Question Bank types
export interface BloomDistribution {
  remember: number;
  understand: number;
  apply: number;
  analyze: number;
  evaluate: number;
}

export interface Questions {
  remember: string[];
  understand: string[];
  apply: string[];
  analyze: string[];
  evaluate: string[];
}

export interface Concept {
  concept_id: string;
  text: string;
  score: number;
  word_count: number;
  emphasis_count: number;
}

export interface QuestionBank {
  total_questions: number;
  bloom_distribution: BloomDistribution;
  questions: Questions;
  warnings: string[];
  concepts: Concept[];
}
