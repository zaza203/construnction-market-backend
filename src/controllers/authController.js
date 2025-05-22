import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from '../prisma/client.js';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

// Register
export const registerUser = async (req, res) => {
  const { username, password, name, contact, email, location, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        contact,
        email,
        location,
        role: role,
      },
      select: {
        id: true,
        username: true,
        role: true,
        name: true,
        contact: true,
        email: true,
        location: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
export const loginUser = async (req, res) => {
  const { username, password: inputPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ 
      where: { username },
        select: {
        id: true,
        username: true,
        password: true,
        role: true,
        name: true,
        contact: true,
        email: true,
        location: true,
        companyId: true,
        createdAt: true
      }
    });

    if (!user || !(await bcrypt.compare(inputPassword, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, jwtSecret, { expiresIn: '1d' });
    const { password, ...safeUser } = user;

    res.json({
      token,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update User
export const updateUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, contact, email, location } = req.body;
  const requester = req.user;

  if (requester.id !== userId && requester.role !== 'ADMIN' && requester.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name, contact, email, location },
    });
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const requester = req.user;

  if (requester.role !== 'ADMIN' && requester.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const listUsers = async (req, res) => {
  const requester = req.user;

  if (requester.role !== 'ADMIN' && requester.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        contact: true,
        email: true,
        location: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};