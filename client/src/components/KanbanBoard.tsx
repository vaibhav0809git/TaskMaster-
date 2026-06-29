import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { useUpdateTask } from '../api/hooks';
import toast from 'react-hot-toast';

interface Props { tasks: Task[]; }

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'PENDING', label: 'To Do', color: 'border-t-muted' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'border-t-accent' },
  { status: 'COMPLETED', label: 'Done', color: 'border-t-success' },
];

export function KanbanBoard({ tasks }: Props) {
  const updateTask = useUpdateTask();

  const getColumnTasks = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId as TaskStatus;
    try {
      await updateTask.mutateAsync({ id: draggableId, data: { status: newStatus } });
      toast.success(`Moved to ${newStatus.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to move task');
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COLUMNS.map(({ status, label, color }) => {
          const columnTasks = getColumnTasks(status);
          return (
            <div key={status} className={`bg-white rounded-card shadow-card border-t-2 ${color} overflow-hidden`}>
              <div className="px-4 py-3 border-b border-surface-2 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-ink">{label}</h3>
                <span className="text-xs font-mono bg-surface-2 text-muted px-2 py-0.5 rounded-badge">
                  {columnTasks.length}
                </span>
              </div>
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-3 space-y-2 min-h-[300px] transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`transition-all ${snapshot.isDragging ? 'rotate-1 scale-105' : ''}`}
                          >
                            <TaskCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-10 h-10 bg-surface-2 rounded-full flex items-center justify-center mb-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B9A97" strokeWidth="1.5">
                            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                            <rect x="9" y="3" width="6" height="4" rx="1"/>
                          </svg>
                        </div>
                        <p className="text-xs text-muted">Drop tasks here</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
