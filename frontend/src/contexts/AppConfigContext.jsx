import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppConfigContext = createContext();

const normalizeLogoUrl = (url) => {
  if (!url) return null;
  // Se a URL contém localhost ou IP com porta, extrai apenas o pathname
  if (url.includes('localhost') || url.includes('127.0.0.1') || url.match(/:\d+\//)) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      // Se não conseguir fazer parse, tenta extrair manualmente
      const match = url.match(/(\/uploads\/.*)$/);
      return match ? match[1] : null;
    }
  }
  return url;
};

export const AppConfigProvider = ({ children }) => {
  const [appConfig, setAppConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const loadConfig = async () => {
    try {
      const response = await api.get('/app-config');
      const normalizedLogo = normalizeLogoUrl(response.data.appLogo);
      setAppConfig({
        ...response.data,
        appLogo: normalizedLogo
      });
      if (response.data?.appName) {
         document.title = response.data.appName;
      }
      if (normalizedLogo) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = normalizedLogo;
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
    const normalizedLogo = normalizeLogoUrl(appLogo);
    setAppConfig(prev => ({
      ...prev,
      appName,
      appLogo: normalizedLogo
    }));
    if (appName) {
      document.title = appName;
    }
    if (normalizedLogo) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = normalizedLogo;
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
