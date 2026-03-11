import authService from '../services/authService.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;
      
      const result = await authService.register(email, password, name);
      
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      const result = await authService.login(email, password);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async me(req, res, next) {
    try {
      const user = await authService.me(req.user.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
};

export default authController;
