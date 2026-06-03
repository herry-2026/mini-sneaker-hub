import cors from 'cors';
import express from 'express';

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
