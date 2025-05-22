import prisma from '../prisma/client.js';
import fs from 'fs';
import path from 'path';

export const listAllProjects = async (req, res) => {
    const requester = req.user;

    if (requester.role !== 'ADMIN' && requester.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const projects = await prisma.project.findMany({
          include: {
                company: {
                    select: {
                        name: true
                    }
                }
            }
        });
        res.json(projects);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

export const listProjects = async (req, res) => {
  try {
    const { companyId } = req.params;

    const filter = companyId ? { companyId: parseInt(companyId) } : {};

    const projects = await prisma.project.findMany({
      where: filter,
    });

    console.log('FETCHING PROJECTS WITH COMPANY ID:', companyId);

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getProject = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createProject = async (req, res) => {
  const { companyId } = req.params;

  try {
    const parsedBody = {
      ...req.body,
      year: parseInt(req.body.year),
    };

    if (req.file) {
      parsedBody.image = `/uploads/projects/${req.file.filename}`;
    }

    const project = await prisma.project.create({
      data: {
        ...parsedBody,
        company: {
          connect: { id: parseInt(companyId) },
        },
      },
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).js
    if (req.file) {
      const filePath = path.join(process.cwd(), 'uploads', 'companies', req.file.filename);
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting file:', unlinkErr);
        } else {
          console.log('File deleted due to DB error:', filePath);
        }
      });
    }on({ error: err.message });
  }
};


export const updateProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({ where: { id: parseInt(id) } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const updatedData = { ...req.body };

    if (updatedData.year) {
      updatedData.year = parseInt(updatedData.year, 10);
      if (isNaN(updatedData.year)) {
        return res.status(400).json({ error: 'Year must be a valid number' });
      }
    }

    if (req.file) {
      if (project.image) {
        const oldImagePath = path.join('public', project.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      updatedData.image = `/uploads/projects/${req.file.filename}`;
    }

    const updated = await prisma.project.update({
      where: { id: parseInt(id) },
      data: updatedData,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({ where: { id: parseInt(id) } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.image) {
      const imagePath = path.join('public', project.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await prisma.project.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
