import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatDisplayDate } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0, linked: 0 });
  const [latestPositions, setLatestPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, positionsRes] = await Promise.all([
        api.get('/devices/stats'),
        api.get('/positions/latest')
      ]);
      setStats(statsRes.data);
      setLatestPositions(positionsRes.data.slice(0, 10));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-800">{getGreeting()}, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-gray-500 mt-1">Bem-vindo ao sistema de rastreamento</p>
        </div>
        <Link to="/map" className="btn-primary flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span>Ver Mapa</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total de Dispositivos</p>
              <p className="text-3xl font-heading font-bold text-primary-700 mt-1">{stats.total}</p>
            </div>
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Online</p>
              <p className="text-3xl font-heading font-bold text-status-online mt-1">{stats.online}</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <div className="w-8 h-8 bg-status-online rounded-full animate-pulse-slow"></div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Offline</p>
              <p className="text-3xl font-heading font-bold text-status-offline mt-1">{stats.offline}</p>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
              <div className="w-8 h-8 bg-status-offline rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Vinculados ao Traccar</p>
              <p className="text-3xl font-heading font-bold text-accent-600 mt-1">{stats.linked}</p>
            </div>
            <div className="w-14 h-14 bg-accent-100 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-primary-800">Últimas Posições</h2>
            <Link to="/history" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Ver todos
            </Link>
          </div>
          
          {latestPositions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <p>Nenhuma posição registrada</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {latestPositions.map((pos) => (
                <div key={pos.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`status-indicator ${pos.device?.status || 'offline'}`}></div>
                    <div>
                      <p className="font-medium text-gray-800">{pos.device?.name || 'Desconhecido'}</p>
                      <p className="text-xs text-gray-500">
                        {pos.latitude.toFixed(6)}, {pos.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{formatDisplayDate(pos.timestamp)}</p>
                    <p className="text-xs text-gray-400">{pos.accuracy ? `${pos.accuracy}m` : '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="font-heading text-lg font-semibold text-primary-800 mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/devices" className="p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors card-hover">
              <svg className="w-8 h-8 text-primary-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="font-medium text-primary-800">Gerenciar Dispositivos</p>
            </Link>
            <Link to="/map" className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors card-hover">
              <svg className="w-8 h-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="font-medium text-green-800">Ver Mapa</p>
            </Link>
            <Link to="/history" className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors card-hover">
              <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium text-purple-800">Histórico</p>
            </Link>
            <Link to="/config" className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors card-hover">
              <svg className="w-8 h-8 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="font-medium text-gray-800">Configurações</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
