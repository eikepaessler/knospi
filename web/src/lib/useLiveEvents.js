import { useEffect, useRef } from 'react';

// Verbindet sich per Server-Sent Events mit dem Backend, damit Statuswechsel
// (neue Messwerte, neue Benachrichtigungen) sofort in der UI ankommen, ohne
// dass die App pollen muss.
export function useLiveEvents(handlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const source = new EventSource('/api/events');
    const types = ['plant-updated', 'plant-removed', 'notification'];
    const listeners = types.map((type) => {
      const fn = (event) => {
        const data = JSON.parse(event.data);
        handlersRef.current[type]?.(data);
      };
      source.addEventListener(type, fn);
      return [type, fn];
    });
    return () => {
      for (const [type, fn] of listeners) source.removeEventListener(type, fn);
      source.close();
    };
  }, []);
}
