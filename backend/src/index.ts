import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sajuRouter from './routes/saju';
import fortuneRouter from './routes/fortune';
import analysisRouter from './routes/analysis';
import compatRouter from './routes/compat';
import yearlyRouter from './routes/yearly';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/saju', sajuRouter);
app.use('/api/fortune', fortuneRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/compat', compatRouter);
app.use('/api/yearly', yearlyRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
