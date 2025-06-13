import prisma from '../prisma/client.js';

export const logActivity = async (req, res) => {
  try {
    const { action, details, userId } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'] || '';

    const activity = await prisma.activityLog.create({
      data: {
        action,
        details,
        userId,
        ipAddress,
        userAgent,
      },
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error logging activity', error });
  }
};