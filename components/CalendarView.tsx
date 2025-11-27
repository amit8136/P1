import React from 'react';
import { Task, Priority, CalendarEvent } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  events: CalendarEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onSelectDate: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, events, currentDate, onDateChange, onSelectDate }) => {
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => onDateChange(new Date(year, month - 1, 1));
  const nextMonth = () => onDateChange(new Date(year, month + 1, 1));

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getItemsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = tasks.filter(t => t.date === dateStr);
    const dayEvents = events.filter(e => e.date === dateStr);
    return { dayTasks, dayEvents };
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">{monthName} {year}</h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr">
        {blanks.map(i => (
          <div key={`blank-${i}`} className="min-h-[120px] bg-slate-50/30 border-b border-r border-slate-100" />
        ))}
        
        {days.map(day => {
          const { dayTasks, dayEvents } = getItemsForDay(day);
          const totalItems = dayTasks.length + dayEvents.length;
          const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          return (
            <div 
              key={day} 
              onClick={() => onSelectDate(dayStr)}
              className={`min-h-[120px] p-2 border-b border-r border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group relative ${isToday(day) ? 'bg-blue-50/30' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700'}`}>
                  {day}
                </span>
                {totalItems > 0 && (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-1 mt-1">
                {/* Google Calendar Events */}
                {dayEvents.map(event => (
                   <div key={event.id} className="text-[10px] px-1.5 py-1 rounded bg-blue-100 text-blue-700 border border-blue-200 truncate font-medium">
                     {event.time ? `${event.time} ` : ''}{event.title}
                   </div>
                ))}

                {/* Tasks */}
                {dayTasks.slice(0, 3).map(task => (
                  <div 
                    key={task.id} 
                    className={`text-[10px] px-1.5 py-1 rounded border truncate ${
                      task.priority === Priority.HIGH 
                        ? 'bg-rose-50 border-rose-100 text-rose-700' 
                        : task.priority === Priority.MEDIUM
                        ? 'bg-amber-50 border-amber-100 text-amber-700'
                        : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    }`}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-slate-400 pl-1">
                    + {dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
