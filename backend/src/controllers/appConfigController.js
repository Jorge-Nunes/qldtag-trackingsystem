import { appConfigService } from '../services/appConfigService.js';
import config from '../config/index.js';

const getBaseUrl = (req) => {
  if (config.appUrl) {
    return config.appUrl;
  }
  const protocol = req.protocol || 'http';
  const host = req.get('host') || `localhost:${config.port}`;
  return `${protocol}://${host}`;
};

const transformLogoUrl = (config, baseUrl) => {
  if (!config.appLogo) {
    return { ...config, appLogo: null };
  }
  if (config.appLogo && config.appLogo.startsWith('/uploads/')) {
    return {
      ...config,
      appLogo: `${baseUrl}${config.appLogo}`
    };
  }
  return config;
};

export const appConfigController = {
  getConfig: async (req, res, next) => {
    try {
      const config = await appConfigService.getConfig();
      const baseUrl = getBaseUrl(req);
      const transformedConfig = transformLogoUrl(config, baseUrl);
      res.json(transformedConfig);
    } catch (error) {
      next(error);
    }
  },

  updateConfig: async (req, res, next) => {
    try {
      const { appName, removeLogo } = req.body;
      let appLogoUrl = undefined;

      if (removeLogo === 'true') {
        appLogoUrl = null;
      } else if (req.file) {
        appLogoUrl = `/uploads/${req.file.filename}`;
      }

      const updated = await appConfigService.updateConfig(appName, appLogoUrl);
      const baseUrl = getBaseUrl(req);
      const transformedConfig = transformLogoUrl(updated, baseUrl);
      res.json({ config: transformedConfig });
    } catch (error) {
      next(error);
    }
  },
};
