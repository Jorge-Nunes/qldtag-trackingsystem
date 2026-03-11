import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';
import config from '../config/index.js';

export const authService = {
  async register(email, password, name) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw { name: 'ValidationError', message: 'Email já cadastrado' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  },

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw { name: 'UnauthorizedError', message: 'Credenciais inválidas' };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw { name: 'UnauthorizedError', message: 'Credenciais inválidas' };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  },

  async me(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw { name: 'UnauthorizedError', message: 'Usuário não encontrado' };
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    };
  }
};

export default authService;
