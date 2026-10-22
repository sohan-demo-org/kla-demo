import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { openStore } from './db.js';

const port = Number(process.env.PORT ?? 4000);
const dbFile = process.env.DB_FILE ?? fileURLToPath(new URL('../data/kla-demo.db', import.meta.url));
const staticDir = fileURLToPath(new URL('../../client/dist', import.meta.url));

const app = createApp(openStore(dbFile), { staticDir });

app.listen(port, () => {
  console.log(`KLA demo API listening on http://localhost:${port} (db: ${dbFile})`);
});
