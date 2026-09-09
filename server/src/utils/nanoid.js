import { randomUUID } from 'node:crypto';

// Kurze, URL-taugliche IDs ohne zusätzliche Abhängigkeit.
export function nanoid() {
  return randomUUID().replace(/-/g, '').slice(0, 12);
}
