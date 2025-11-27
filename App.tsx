import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, Sparkles, Filter, Menu, Calendar as CalendarIcon, Folder, Briefcase, User, Heart, Loader2 } from 'lucide-react';
import { Task, ViewMode, TaskStatus, AIAnalysisResult, Priority, Project, CalendarEvent } from './types';
import { INITIAL_TASKS, DEFAULT_PROJECTS, MOCK_CALENDAR_EVENTS } from './constants';
import { TaskCard } from './components/TaskCard';
import { CalendarView } from './components/CalendarView';
import { analyzeTasksWithGemini } from './services/geminiService';
import { AIModal } from './components/AIModal';
import { EditTaskModal } from './components/EditTaskModal';

function App() {
  // State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | 'all'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Persistence
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  // Handlers
  const handleConnectCalendar = () => {
    setIsConnectingCalendar(true);
    // Simulate API call
    setTimeout(() => {
      setCalendarEvents(MOCK_CALENDAR_EVENTS);
      setIsCalendarConnected(true);
      setIsConnectingCalendar(false);
    }, 1500);
  };

  const handleAddProject = () => {
    const name = prompt("Enter project name:");
    if (name) {
      const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-violet-500', 'bg-pink-500'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newProject: Project = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        color: randomColor
      };
      setProjects(prev => [...prev, newProject]);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: t.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE }
        : t
    ));
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
      // Edit
      setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } as Task : t));
    } else {
      // Create
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        status: TaskStatus.TODO,
        tags: taskData.tags || [],
        projectId: taskData.projectId || projects[0].id
      } as Task;
      setTasks(prev => [...prev, newTask]);
    }
  };

  const handleAnalyze = async () => {
    setIsAIModalOpen(true);
    setIsAnalyzing(true);
    try {
      const result = await analyzeTasksWithGemini(tasks, projects);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      // In a real app, handle error state
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptAISuggestion = (newTaskData: Omit<Task, 'id' | 'status'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: crypto.randomUUID(),
      status: TaskStatus.TODO,
      priority: newTaskData.priority as Priority || Priority.MEDIUM,
      time: newTaskData.time || undefined
    };
    setTasks(prev => [...prev, newTask]);
  };

  // Filtering
  const filteredTasks = tasks
    .filter(t => {
      // Project filter
      if (selectedProjectId !== 'all' && t.projectId !== selectedProjectId) return false;
      // Status filter
      if (filter === 'todo') return t.status !== TaskStatus.DONE;
      if (filter === 'done') return t.status === TaskStatus.DONE;
      return true;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Derived state for list view
  const upcomingTasks = filteredTasks.filter(t => new Date(t.date) >= new Date(new Date().setHours(0,0,0,0)));
  const overdueTasks = filteredTasks.filter(t => new Date(t.date) < new Date(new Date().setHours(0,0,0,0)) && t.status !== TaskStatus.DONE);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-0 flex">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              IntelliPlan
            </h1>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto">
             {/* Main Links */}
             <div className="space-y-1">
               <button 
                 onClick={() => { setSelectedProjectId('all'); setIsSidebarOpen(false); }}
                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedProjectId === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
               >
                 <List size={18} />
                 All Tasks
               </button>
               <button 
                 onClick={() => { setViewMode('calendar'); setIsSidebarOpen(false); }}
                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
               >
                 <CalendarIcon size={18} />
                 Calendar
               </button>
             </div>

             {/* Projects */}
             <div>
               <div className="flex items-center justify-between px-3 mb-2">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projects</h3>
                 <button onClick={handleAddProject} className="text-slate-400 hover:text-indigo-600 transition-colors">
                   <Plus size={16} />
                 </button>
               </div>
               <div className="space-y-1">
                 {projects.map(project => (
                   <button
                     key={project.id}
                     onClick={() => { setSelectedProjectId(project.id); setIsSidebarOpen(false); setViewMode('list'); }}
                     className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedProjectId === project.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                   >
                     <span className={`w-2 h-2 rounded-full ${project.color}`} />
                     {project.name}
                   </button>
                 ))}
               </div>
             </div>

             {/* Integrations */}
             <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Integrations</h3>
                <button 
                  onClick={isCalendarConnected ? undefined : handleConnectCalendar}
                  disabled={isCalendarConnected || isConnectingCalendar}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    isCalendarConnected 
                      ? 'bg-blue-50 border-blue-100 text-blue-700' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {isConnectingCalendar ? (
                    <Loader2 size={18} className="animate-spin text-slate-400" />
                  ) : isCalendarConnected ? (
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-4 h-4" alt="Google Calendar" />
                  ) : (
                    <CalendarIcon size={18} />
                  )}
                  {isConnectingCalendar ? 'Connecting...' : isCalendarConnected ? 'Calendar Connected' : 'Connect Google Calendar'}
                </button>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
               <Menu size={20} />
             </button>
             <h2 className="text-lg font-bold text-slate-800">
               {selectedProjectId === 'all' 
                 ? (viewMode === 'calendar' ? 'Calendar' : 'All Tasks') 
                 : projects.find(p => p.id === selectedProjectId)?.name || 'Project'}
             </h2>
           </div>

           <div className="flex items-center gap-2">
            <button 
              onClick={handleAnalyze}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 rounded-lg text-sm font-medium hover:from-indigo-100 hover:to-violet-100 transition-colors border border-indigo-100"
            >
              <Sparkles size={16} />
              <span className="hidden sm:inline">AI Analysis</span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            <div className="flex bg-slate-100 p-1 rounded-lg hidden sm:flex">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
           {viewMode === 'list' ? (
            <div className="space-y-8 animate-fade-in">
              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Filter size={16} className="text-slate-400" />
                {(['all', 'todo', 'done'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                      filter === f 
                        ? 'bg-slate-800 text-white' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {overdueTasks.length > 0 && filter !== 'done' && (
                <section>
                  <h2 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    Overdue
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    {overdueTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        project={projects.find(p => p.id === task.projectId)}
                        onEdit={handleEditTask} 
                        onDelete={handleDeleteTask}
                        onToggleStatus={handleToggleStatus}
                      />
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Upcoming</h2>
                {upcomingTasks.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-3">
                      <List size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">No upcoming tasks found</p>
                    <p className="text-slate-400 text-sm mt-1">Add a task or check your filters</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    {upcomingTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        project={projects.find(p => p.id === task.projectId)}
                        onEdit={handleEditTask} 
                        onDelete={handleDeleteTask}
                        onToggleStatus={handleToggleStatus}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="animate-fade-in">
               <CalendarView 
                 tasks={filteredTasks} 
                 events={isCalendarConnected ? calendarEvents : []}
                 currentDate={calendarDate}
                 onDateChange={setCalendarDate}
                 onSelectDate={(date) => {
                   setSelectedDate(date);
                   handleAddTask();
                 }}
               />
               
               <div className="mt-8">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <span className="w-1 h-5 bg-indigo-600 rounded-full"></span>
                   {calendarDate.toLocaleString('default', { month: 'long' })} Overview
                 </h3>
                 <div className="space-y-3">
                   {/* Render list of tasks for the month or selected day logic could go here */}
                   {filteredTasks.slice(0, 5).map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
                        <div className={`w-2 h-2 rounded-full ${task.status === TaskStatus.DONE ? 'bg-emerald-400' : 'bg-indigo-400'}`}></div>
                        <span className={`text-sm ${task.status === TaskStatus.DONE ? 'line-through text-slate-400' : 'text-slate-700'}`}>{task.title}</span>
                        <span className="text-xs text-slate-400 ml-auto">{task.date}</span>
                      </div>
                   ))}
                   {isCalendarConnected && calendarEvents.map(evt => (
                      <div key={evt.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                         <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                         <span className="text-sm text-blue-800">{evt.title}</span>
                         <span className="text-xs text-blue-500 ml-auto">{evt.date}</span>
                      </div>
                   ))}
                 </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={handleAddTask}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-300 transition-all hover:scale-105 active:scale-95 z-40"
      >
        <Plus size={24} />
      </button>

      {/* Modals */}
      <EditTaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        projects={projects}
        initialTask={editingTask}
        initialDate={selectedDate}
      />
      
      <AIModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        analysis={analysisResult}
        isLoading={isAnalyzing}
        onAcceptTask={handleAcceptAISuggestion}
      />
    </div>
  );
}

export default App;
