import bcrypt from 'bcryptjs';
import userRepository from '../repositories/userRepository.js';

export const userController = {
  async getAllUsers(req, res, next) {
    try {
      const users = await userRepository.findAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  async approveUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userRepository.approve(id);
      res.json({ message: 'Usuário aprovado com sucesso', user });
    } catch (error) {
      next(error);
    }
  },

  async rejectUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userRepository.reject(id);
      res.json({ message: 'Usuário reprovado com sucesso', user });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await userRepository.delete(id);
      res.json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;
      
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser && existingUser.id !== id) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }
      
      const user = await userRepository.update(id, { name, email, role });
      res.json({ message: 'Usuário atualizado com sucesso', user });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { id } = req.params;
      const { password } = req.body;
      
      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      await userRepository.update(id, { password: hashedPassword });
      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      next(error);
    }
  }
};

export default userController;
