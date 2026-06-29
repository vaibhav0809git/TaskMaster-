import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:3001`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'REMINDER') {
          toast(`🔔 Reminder: ${data.task.title}`, {
            duration: 8000,
            position: 'top-right',
          });
          qc.invalidateQueries({ queryKey: ['reminders'] });
        }
      } catch {}
    };

    ws.onerror = () => console.log('WebSocket connection failed - make sure server is running');

    return () => { ws.close(); };
  }, [qc]);

  return wsRef;
}
