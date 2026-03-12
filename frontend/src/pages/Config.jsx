import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAppConfig } from '../contexts/AppConfigContext';

const Config = () => {
  const { updateConfig } = useAppConfig();
  const [apiConfig, setApiConfig] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
    enabled: false,
    syncInterval: 60,
    localName: '',
    syncTime: 1,
    syncSize: 100
  });
  const [traccarConfig, setTraccarConfig] = useState({
    url: '',
    port: 5055,
    protocol: 'http',
    enabled: false
  });
  const [appConfig, setAppConfig] = useState({
    appName: '',
    appLogo: null
  });
  const [systemInfo, setSystemInfo] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const [apiRes, traccarRes, appConfigRes, systemRes] = await Promise.all([
        api.get('/config/api'),
        api.get('/config/traccar'),
        api.get('/app-config'),
        api.get('/config/system')
      ]);
      
      if (apiRes.data) {
        setApiConfig({
          name: apiRes.data.name || '',
          baseUrl: apiRes.data.baseUrl || '',
          apiKey: apiRes.data.apiKey || '',
          enabled: apiRes.data.enabled || false,
          syncInterval: apiRes.data.syncInterval || 60,
          localName: apiRes.data.localName || '',
          syncTime: apiRes.data.syncTime || 1,
          syncSize: apiRes.data.syncSize || 100
        });
      }
      if (traccarRes.data) {
        setTraccarConfig({
          url: traccarRes.data.url || '',
          port: traccarRes.data.port || 5055,
          protocol: traccarRes.data.protocol || 'http',
          enabled: traccarRes.data.enabled || false
        });
      }
      if (appConfigRes.data) {
        setAppConfig({
          appName: appConfigRes.data.appName || 'SyncTAG',
          appLogo: appConfigRes.data.appLogo || null
        });
      }
      if (systemRes.data) {
        setSystemInfo(systemRes.data);
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const saveApiConfig = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.put('/config/api', apiConfig);
      toast.success('Configurações da API externa salvas!');
      setMessage({ type: 'success', text: 'Configurações da API externa salvas!' });
    } catch (err) {
      toast.error('Erro ao salvar configurações da API');
      setMessage({ type: 'error', text: 'Erro ao salvar configurações da API' });
    } finally {
      setSaving(false);
    }
  };

  const saveAppConfig = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const formData = new FormData();
      formData.append('appName', appConfig.appName);
      if (logoFile) {
        formData.append('appLogo', logoFile);
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const res = await api.post('/app-config', formData, config);
      
      toast.success('Aparência do App salva!');
      setMessage({ type: 'success', text: 'Aparência do App salva!' });
      
      if (res.data && res.data.config) {
        setAppConfig({
          appName: res.data.config.appName,
          appLogo: res.data.config.appLogo
        });
        setLogoFile(null);
        updateConfig(res.data.config.appName, res.data.config.appLogo);
      }
    } catch (err) {
      toast.error('Erro ao salvar Aparência do App');
      setMessage({ type: 'error', text: 'Erro ao salvar Aparência do App' });
    } finally {
      setSaving(false);
    }
  };

  const saveTraccarConfig = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.put('/config/traccar', traccarConfig);
      toast.success('Configurações do Traccar salvas!');
      setMessage({ type: 'success', text: 'Configurações do Traccar salvas!' });
    } catch (err) {
      toast.error('Erro ao salvar configurações do Traccar');
      setMessage({ type: 'error', text: 'Erro ao salvar configurações do Traccar' });
    } finally {
      setSaving(false);
    }
  };

  const testTraccar = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Use api instance instead of axios directly
      const res = await api.post('/config/traccar/test', traccarConfig);
      setTestResult(res.data);
      if (res.data.success) {
        toast.success(res.data.message || 'Conexão com Traccar bem-sucedida!');
      } else {
        toast.error(`Falha no teste: ${res.data.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || error.message || 'Erro ao realizar teste de conexão';
      toast.error(errorMsg);
      setTestResult({ success: false, error: errorMsg });
    } finally {
      setTesting(false);
    }
  };

  const triggerSync = async () => {
    setSyncing(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await api.post('/config/sync/trigger');
      const msg = `Sincronização concluída! Inseridas: ${response.data.inserted}, Puladas: ${response.data.skipped}`;
      toast.success(msg);
      setMessage({ 
        type: 'success', 
        text: msg
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao sincronizar';
      toast.error(errorMsg);
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-primary-800">Configurações</h1>

      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-lg font-semibold text-primary-800">Aparência do App</h2>
              <p className="text-sm text-gray-500">Configuração de nome e logo da aplicação</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Aplicação</label>
              <input
                type="text"
                value={appConfig.appName}
                onChange={(e) => setAppConfig({ ...appConfig, appName: e.target.value })}
                className="input-field max-w-md"
                placeholder="SyncTAG"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo da Aplicação</label>
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                  {logoFile ? (
                    <img src={URL.createObjectURL(logoFile)} alt="Preview" className="h-full w-full object-contain p-2" />
                  ) : appConfig.appLogo ? (
                    <img src={appConfig.appLogo} alt="Current Logo" className="h-full w-full object-contain p-2" />
                  ) : (
                    <span className="text-gray-400 text-xs text-center">Sem Logo</span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setLogoFile(e.target.files[0]);
                      }
                    }}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">Recomendado: Imagem PNG transparente (máx 2MB).</p>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <button
                onClick={saveAppConfig}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Salvando...' : 'Salvar Aparência'}
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-lg font-semibold text-primary-800">API Externa</h2>
              <p className="text-sm text-gray-500">Configuração da API de dispositivos</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={apiConfig.enabled}
                onChange={(e) => setApiConfig({ ...apiConfig, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">{apiConfig.enabled ? 'Ativada' : 'Desativada'}</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={apiConfig.name}
                onChange={(e) => setApiConfig({ ...apiConfig, name: e.target.value })}
                className="input-field"
                placeholder="Minha API"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Base *</label>
              <input
                type="url"
                value={apiConfig.baseUrl}
                onChange={(e) => setApiConfig({ ...apiConfig, baseUrl: e.target.value })}
                className="input-field"
                placeholder="https://api.exemplo.com/device/findByBoundDeviceLocationData"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key (opcional)</label>
              <input
                type="password"
                value={apiConfig.apiKey}
                onChange={(e) => setApiConfig({ ...apiConfig, apiKey: e.target.value })}
                className="input-field"
                placeholder="Chave de API"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intervalo de Sincronização (segundos)</label>
              <input
                type="number"
                value={apiConfig.syncInterval}
                onChange={(e) => setApiConfig({ ...apiConfig, syncInterval: parseInt(e.target.value) || 60 })}
                className="input-field"
                min="30"
                max="3600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Local Name</label>
              <input
                type="text"
                value={apiConfig.localName}
                onChange={(e) => setApiConfig({ ...apiConfig, localName: e.target.value })}
                className="input-field"
                placeholder="QM01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempo (horas)</label>
              <input
                type="number"
                value={apiConfig.syncTime}
                onChange={(e) => setApiConfig({ ...apiConfig, syncTime: parseInt(e.target.value) || 1 })}
                className="input-field"
                min="1"
                max="24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade por requisição (Size)</label>
              <input
                type="number"
                value={apiConfig.syncSize}
                onChange={(e) => setApiConfig({ ...apiConfig, syncSize: parseInt(e.target.value) || 100 })}
                className="input-field"
                min="1"
                max="1000"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={saveApiConfig}
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={triggerSync}
                disabled={syncing || !apiConfig.enabled}
                className="btn-accent flex items-center space-x-2"
              >
                {syncing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                <span>Sincronizar Agora</span>
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-lg font-semibold text-primary-800">Traccar</h2>
              <p className="text-sm text-gray-500">Configuração do servidor Traccar</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={traccarConfig.enabled}
                onChange={(e) => setTraccarConfig({ ...traccarConfig, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">{traccarConfig.enabled ? 'Ativado' : 'Desativado'}</span>
            </label>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                <input
                  type="text"
                  value={traccarConfig.url}
                  onChange={(e) => setTraccarConfig({ ...traccarConfig, url: e.target.value })}
                  className="input-field"
                  placeholder="seu-servidor.traccar.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Porta OsmAnd</label>
                <input
                  type="number"
                  value={traccarConfig.port}
                  onChange={(e) => setTraccarConfig({ ...traccarConfig, port: parseInt(e.target.value) || 5055 })}
                  className="input-field"
                  placeholder="5055"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Protocolo</label>
              <select
                value={traccarConfig.protocol}
                onChange={(e) => setTraccarConfig({ ...traccarConfig, protocol: e.target.value })}
                className="input-field"
              >
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={saveTraccarConfig}
                disabled={saving}
                className="flex-1 btn-primary"
              >
                {saving ? 'Salvando...' : 'Salvar Configuração'}
              </button>

              <button
                onClick={testTraccar}
                disabled={testing}
                className={`flex-1 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                  testing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                {testing ? 'Testando...' : 'Testar Conexão'}
              </button>
            </div>

            {testResult && (
              <div className={`mt-2 p-3 rounded-md text-sm ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {testResult.success ? (
                  <p>✅ {testResult.message}</p>
                ) : (
                  <p>❌ Erro: {testResult.error}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-heading text-lg font-semibold text-primary-800 mb-4">Informações do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Ambiente</p>
            <p className="font-medium text-gray-800">{systemInfo?.environment || 'Carregando...'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Banco de Dados</p>
            <p className="font-medium text-gray-800">{systemInfo?.database || 'Carregando...'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Versão</p>
            <p className="font-medium text-gray-800">{systemInfo?.version || '1.0.0'}</p>
          </div>
        </div>
        {systemInfo?.stats && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-600">Usuários</p>
              <p className="text-2xl font-bold text-primary-800">{systemInfo.stats.usuarios}</p>
            </div>
            <div className="p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-600">Dispositivos</p>
              <p className="text-2xl font-bold text-primary-800">{systemInfo.stats.dispositivos}</p>
            </div>
            <div className="p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-600">Posições</p>
              <p className="text-2xl font-bold text-primary-800">{systemInfo.stats.posicoes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Config;
