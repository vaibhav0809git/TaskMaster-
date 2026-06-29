import React, { useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Task } from '../types';
import { useUIStore } from '../store/uiStore';
import { useTasks } from '../api/hooks';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: '#E84040',
  HIGH:   '#F5A623',
  MEDIUM: '#2383E2',
  LOW:    '#9B9A97',
};

export function CalendarView() {
  // Fetch ALL tasks unfiltered so calendar always reflects real data
  const { data: allTasks = [] } = useTasks();
  const { openTaskForm, setSelectedTask } = useUIStore();

  const events = useMemo(() =>
    allTasks
      .filter((t) => t.dueDate)
      .map((t) => ({
        id: t.id,
        title: t.title,
        start: new Date(t.dueDate!),
        end: new Date(t.dueDate!),
        resource: t,
        allDay: true,
      })),
    [allTasks]
  );

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    openTaskForm(undefined, start);
  }, [openTaskForm]);

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedTask(event.id);
  }, [setSelectedTask]);

  const eventPropGetter = useCallback((event: any) => {
    const task: Task = event.resource;
    const bg = PRIORITY_COLORS[task.priority] ?? '#2383E2';
    const isCompleted = task.status === 'COMPLETED' || task.status === 'ARCHIVED';
    return {
      style: {
        backgroundColor: isCompleted ? '#9B9A97' : bg,
        opacity: isCompleted ? 0.65 : 1,
        border: 'none',
        borderRadius: '5px',
        fontSize: '11px',
        fontWeight: 500,
        padding: '2px 6px',
        cursor: 'pointer',
        textDecoration: isCompleted ? 'line-through' : 'none',
      },
    };
  }, []);

  const formats = useMemo(() => ({
    monthHeaderFormat: (date: Date) => format(date, 'MMMM yyyy'),
    dayHeaderFormat:   (date: Date) => format(date, 'EEEE, MMM d'),
    agendaDateFormat:  (date: Date) => format(date, 'EEE, MMM d'),
    agendaTimeFormat:  () => '',
  }), []);

  return (
    <div className="rbc-fixed-container bg-white rounded-card shadow-card p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventPropGetter}
        formats={formats}
        selectable
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        popup
        style={{ height: '100%' }}
      />
    </div>
  );
}
