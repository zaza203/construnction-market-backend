import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'https://cpromart.site',
    'https://www.cpromart.site',
    'https://admin.cpromart.site',
    'https://www.admin.cpromart.site',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use('/api/users', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/companies', companyRoutes)
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads'),
  {
    setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cache-Control', 'public, max-age=31536000');
    }
  }
))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
