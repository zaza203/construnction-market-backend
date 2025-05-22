import prisma from '../prisma/client.js';
import path from 'path';
import fs from 'fs';


export const listCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createCategory = async (req, res) => {
  const { name } = req.body;
  const user = req.user;

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const imagePath = req.file ? `/uploads/categories/${req.file.filename}` : null;

    const category = await prisma.category.create({
      data: { name, image: imagePath },
    });

    res.status(201).json(category);
  } catch (err) {
    if (req.file) {
          const filePath = path.join(process.cwd(), 'uploads', 'companies', req.file.filename);
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting file:', unlinkErr);
            } else {
              console.log('File deleted due to DB error:', filePath);
            }
          });
        }
    res.status(500).json({ error: err.message });
  }
};

export const updateCategory = async (req, res) => {
  const categoryId = parseInt(req.params.id);
  const { name } = req.body;
  const user = req.user;

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const imagePath = req.file ? `/uploads/categories/${req.file.filename}` : undefined;

    const dataToUpdate = { name };
    if (imagePath) dataToUpdate.image = imagePath;

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: dataToUpdate,
    });

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  const categoryId = parseInt(req.params.id);
  const user = req.user;

    const category = await prisma.category.findUnique({
    where: { id: parseInt(categoryId) },
  });

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    if (category.image) {
      const imagePath = path.join('public', category.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    await prisma.category.delete({ where: { id: categoryId } });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
