import prisma from '../config/database.js';

export const userRepository = {
  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data) {
    return prisma.user.create({ data });
  },

  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approved: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async approve(id) {
    return prisma.user.update({
      where: { id },
      data: { approved: true }
    });
  },

  async reject(id) {
    return prisma.user.update({
      where: { id },
      data: { approved: false }
    });
  },

  async delete(id) {
    return prisma.user.delete({
      where: { id }
    });
  },

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data
    });
  }
};

export default userRepository;
