import React from 'react';
import { Task, Priority, TaskStatus, Project } from '../types';
import { PRIORITY_COLORS, STATUS_ICONS } from '../constants';
import { Calendar as CalendarIcon, Clock, Trash2, Edit2, CheckCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  project?: Project;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, project, onEdit, onDelete, onToggleStatus }) => {
  const StatusIcon = STATUS_ICONS[task.status];
  const isDone = task.status === TaskStatus.DONE;

  return (
    <div className={`group relative bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 ${isDone ? 'opacity-60 bg-slate-50' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${PRIORITY_COLORS[task.priority]}`}>
            {task.priority}
          </span>
          {project && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <span className={`w-1.5 h-1.5 rounded-full ${project.color}`}></span>
              {project.name}
            </span>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(task)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3 mb-3">
        <button 
          onClick={() => onToggleStatus(task.id)}
          className={`mt-1 flex-shrink-0 transition-colors ${isDone ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-500'}`}
        >
          {isDone ? <CheckCircle size={22} className="fill-emerald-50" /> : <div className="w-[22px] h-[22px] rounded-full border-2 border-current" />}
        </button>
        <div>
          <h3 className={`font-semibold text-slate-800 ${isDone ? 'line-through text-slate-500' : ''}`}>{task.title}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-50 pt-3 mt-2">
        <div className="flex items-center gap-1.5">
          <CalendarIcon size={14} />
          <span>{new Date(task.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        {task.time && (
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{task.time}</span>
          </div>
        )}
      </div>
    </div>
  );
};
