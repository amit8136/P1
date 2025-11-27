import { Priority, TaskStatus, Project, CalendarEvent } from './types';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const PRIORITY_COLORS = {
  [Priority.LOW]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [Priority.MEDIUM]: 'bg-amber-100 text-amber-700 border-amber-200',
  [Priority.HIGH]: 'bg-rose-100 text-rose-700 border-rose-200',
};

export const STATUS_ICONS = {
  [TaskStatus.TODO]: AlertCircle,
  [TaskStatus.IN_PROGRESS]: Clock,
  [TaskStatus.DONE]: CheckCircle2,
};

export const DEFAULT_PROJECTS: Project[] = [
  { id: 'work', name: 'Work', color: 'bg-blue-500' },
  { id: 'personal', name: 'Personal', color: 'bg-emerald-500' },
  { id: 'health', name: 'Health', color: 'bg-rose-500' },
];

export const INITIAL_TASKS = [
  {
    id: '1',
    title: 'Project Kickoff',
    description: 'Initial meeting with the design team to discuss the new roadmap.',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    priority: Priority.HIGH,
    status: TaskStatus.TODO,
    tags: ['Meeting'],
    projectId: 'work',
  },
  {
    id: '2',
    title: 'Grocery Shopping',
    description: 'Buy vegetables, milk, and eggs for the week.',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    priority: Priority.LOW,
    status: TaskStatus.TODO,
    tags: ['Chore'],
    projectId: 'personal',
  }
];

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt_1',
    title: 'Dentist Appointment',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
    time: '14:30',
    type: 'event',
    source: 'google-calendar'
  },
  {
    id: 'evt_2',
    title: 'Lunch with Sarah',
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
    time: '12:00',
    type: 'event',
    source: 'google-calendar'
  },
  {
    id: 'evt_3',
    title: 'Weekly Team Sync',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'event',
    source: 'google-calendar'
  }
];
