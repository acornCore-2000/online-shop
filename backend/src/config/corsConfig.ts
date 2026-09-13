import cors, { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type'],
  maxAge: 3600,
};

export const corsMiddleware = cors(corsOptions);