export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

export interface Project {
  id: string;
  name: string;
  color: string; // Tailwind color class for dot (e.g. 'bg-blue-500')
}

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  priority: Priority;
  status: TaskStatus;
  tags: string[];
  projectId: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'event';
  source: 'google-calendar';
}

export interface AIAnalysisResult {
  suggestions: string[];
  newTasks: Array<Omit<Task, 'id' | 'status'>>;
  scheduleOptimization: string;
}

export type ViewMode = 'list' | 'calendar';
