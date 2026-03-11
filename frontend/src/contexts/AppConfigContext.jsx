import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppConfigContext = createContext();

export const AppConfigProvider = ({ children }) => {
  const [appConfig, setAppConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const loadConfig = async () => {
    try {
      const response = await api.get('/app-config');
      setAppConfig(response.data);
      if (response.data?.appName) {
         document.title = response.data.appName;
      }
      if (response.data?.appLogo) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = response.data.appLogo;
      }
    } catch (error) {
      console.error('Failed to load app config:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const updateConfig = (appName, appLogo) => {
    setAppConfig(prev => ({
      ...prev,
      appName,
      appLogo
    }));
    if (appName) {
      document.title = appName;
    }
    if (appLogo) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = appLogo;
    }
  };

  return (
    <AppConfigContext.Provider value={{ appConfig, loadingConfig, refreshConfig: loadConfig, updateConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  return useContext(AppConfigContext);
};
