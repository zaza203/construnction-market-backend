import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';


export const listCompanies = async (_, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        categories: true,
        projects: true
      },
      orderBy: {
        viewCount: 'asc'
      }
    });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCompaniesByCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    if (isNaN(parseInt(categoryId))) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const companies = await prisma.company.findMany({
      where: {
        categories: {
          some: {
            id: parseInt(categoryId)
          }
        }
      },
      include: {
        categories: true,
        projects: true
      },
      orderBy: {
        viewCount: 'asc'
      }
    });

    res.json(companies);
  } catch (err) {
    console.error('Error fetching companies by category:', err);
    res.status(500).json({
      error: 'Failed to fetch companies by category',
      details: err.message
    });
  }
};

export const createCompany = async (req, res) => {
  try {
    let data = { ...req.body };

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    if (req.file) {
      data.logo = `/uploads/companies/${req.file.filename}`;
    }

    let categoryIds = [];
    try {
      if (typeof req.body.categoryIds === 'string') {
        categoryIds = JSON.parse(req.body.categoryIds);
      } else if (Array.isArray(req.body.categoryIds)) {
        categoryIds = req.body.categoryIds;
      }
    } catch (err) {
      console.error('Error parsing categoryIds:', err);
      return res.status(400).json({ error: 'Invalid categoryIds format' });
    }
    delete data.categoryIds;

    const company = await prisma.company.create({
      data: {
        ...data,
        categories: {
          connect: categoryIds.map(id => ({ id: parseInt(id) })),
        }
      }
    });

    res.status(201).json(company);
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


export const getCompanyByUsername = async (req, res) => {
  const { username } = req.params;
  const company = await prisma.company.findUnique({
    where: { username },
    include: {
      categories: true,
      projects: true
    }
  });
  if (!company) return res.status(404).json({ error: 'Company not found' });
  res.json(company);
};

export const updateCompany = async (req, res) => {
  const { id } = req.params;
  const { role, username: userName } = req.user;

  const company = await prisma.company.findUnique({ where: { id: parseInt(id) } });
  if (!company) return res.status(404).json({ error: 'Company not found' });


  if (role == 'ADMIN' || role == 'SUPER_ADMIN' || (role == 'COMPANY_ADMIN' && company.username == userName)) {
    try {
      let updatedData = { ...req.body };

      let categoryIds = [];
      try {
        if (typeof req.body.categoryIds === 'string') {
          categoryIds = JSON.parse(req.body.categoryIds);
        } else if (Array.isArray(req.body.categoryIds)) {
          categoryIds = req.body.categoryIds;
        }
      } catch (err) {
        console.error('Error parsing categoryIds:', err);
        return res.status(400).json({ error: 'Invalid categoryIds format' });
      }
      delete updatedData.categoryIds;

      if (req.file) {
        if (company.logo) {
          const oldLogoPath = path.join('public', company.logo);
          if (fs.existsSync(oldLogoPath)) fs.unlinkSync(oldLogoPath);
        }

        updatedData.logo = `/uploads/companies/${req.file.filename}`;
      }

      const updated = await prisma.company.update({
        where: { id: parseInt(id) },
        data: {
          ...updatedData,
          categories: {
            set: categoryIds.map(id => ({ id: parseInt(id) })),
          },
        },

      });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    return res.status(403).json({ error: 'Unauthorized' });
  }
};

export const updateCompanyStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')
    return res.status(403).json({ error: 'Admin only' });

  const company = await prisma.company.findUnique({ where: { id: parseInt(id) } });
  if (!company) return res.status(404).json({ error: 'Company not found' });

  try {
    const updated = await prisma.company.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    if (status === 'APPROVED') {
      await prisma.user.create({
        data: {
          username: company.username,
          password: company.password,
          email: company.email,
          role: 'COMPANY_ADMIN',
          companyId: company.id,
        },
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCompany = async (req, res) => {
  const { id } = req.params;
  const { role, username: userName } = req.user;

  const company = await prisma.company.findUnique({
    where: { id: parseInt(id) },
  });

  if (!company) return res.status(404).json({ error: 'Company not found' });

  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN')
    return res.status(403).json({ error: 'Unauthorized' });

  try {
    if (company.logo) {
      const logoPath = path.join('public', company.logo);
      if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
    }

    await prisma.company.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Company deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const incrementCompanyViewCount = async (req, res) => {
  const { id } = req.params;

  try {
    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
    });

    if (!company) return res.status(404).json({ error: 'Company not found' });

    const updated = await prisma.company.update({
      where: { id: parseInt(id) },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    res.json({ message: 'View count incremented', viewCount: updated.viewCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getCompanyWithLowestViews = async (_, res) => {
  try {
    const company = await prisma.company.findFirst({
      include: {
        categories: true,
        projects: true
      },
      orderBy: [
        { viewCount: 'asc' },
        { createdAt: 'desc' }
      ]
    });


    res.json(company);
  } catch (err) {
    console.error('Error fetching company with lowest views:', err);
    res.status(500).json({
      error: 'Failed to fetch company with lowest views',
      details: err.message
    });
  }
};


export const getProjectsByCompanyUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const company = await prisma.company.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const projects = await prisma.project.findMany({
      where: {
        company: {
          username
        }
      },
      include: {
        company: {
          select: {
            id: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects by company username:', err);
    res.status(500).json({
      error: 'Failed to fetch projects',
      details: err.message
    });
  }
};