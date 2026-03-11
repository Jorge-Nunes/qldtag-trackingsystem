import { appConfigRepository } from '../repositories/appConfigRepository.js';

export const appConfigService = {
  getConfig: async () => {
    return appConfigRepository.getConfig();
  },

  updateConfig: async (appName, appLogoUrl) => {
    const data = {};
    if (appName !== undefined) data.appName = appName;
    if (appLogoUrl !== undefined) data.appLogo = appLogoUrl;

    return appConfigRepository.updateConfig(data);
  },
};
