import React from 'react';
import { AIAnalysisResult, Task } from '../types';
import { X, Sparkles, ArrowRight, Lightbulb, ListPlus } from 'lucide-react';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AIAnalysisResult | null;
  isLoading: boolean;
  onAcceptTask: (task: Omit<Task, 'id' | 'status'>) => void;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, analysis, isLoading, onAcceptTask }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">AI Schedule Analysis</h2>
              <p className="text-sm text-slate-500">Smart insights powered by Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="relative w-16 h-16">
                 <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <div>
                <p className="text-lg font-medium text-slate-800">Analyzing your tasks...</p>
                <p className="text-slate-500">Finding the best way to organize your day.</p>
              </div>
            </div>
          ) : analysis ? (
            <>
              {/* Optimization Strategy */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-600 uppercase tracking-wide">
                  <Lightbulb size={16} /> Strategy
                </h3>
                <p className="text-slate-700 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  {analysis.scheduleOptimization}
                </p>
              </div>

              {/* Suggestions */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-600 uppercase tracking-wide">
                  <ArrowRight size={16} /> Suggested Actions
                </h3>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex gap-3 items-start bg-emerald-50/30 p-3 rounded-lg border border-emerald-100/50">
                      <span className="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">{idx + 1}</span>
                      <span className="text-slate-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* New Tasks */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wide">
                  <ListPlus size={16} /> Recommended Tasks
                </h3>
                <div className="grid gap-3">
                  {analysis.newTasks.map((task, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-300 transition-colors group">
                      <div>
                        <h4 className="font-semibold text-slate-800">{task.title}</h4>
                        <p className="text-sm text-slate-500 mb-1">{task.description}</p>
                        <div className="flex gap-2 text-xs text-slate-400">
                          <span>{task.date}</span>
                          {task.time && <span>• {task.time}</span>}
                          <span className={`font-medium ${task.priority === 'High' ? 'text-rose-500' : 'text-slate-500'}`}>{task.priority}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => onAcceptTask(task)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-slate-500">
              Something went wrong. Please try again.
            </div>
          )}
        </div>
        
        {/* Footer */}
        {!isLoading && analysis && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
