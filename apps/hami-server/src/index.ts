import { Hono } from 'hono';
import { greet } from '@hami/core';

const app = new Hono();

app.get('/', (c) => {
  return c.text(greet('Hami Server'));
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};