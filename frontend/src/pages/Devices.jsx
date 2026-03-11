import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    linked: 'all'
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 25
  });

  const [formData, setFormData] = useState({
    deviceId: '',
    name: '',
    description: '',
    traccarDeviceId: '',
    localName: ''
  });

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await api.get('/devices');
      setDevices(response.data);
    } catch (err) {
      console.error('Erro ao carregar dispositivos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesSearch = !filters.search || 
        device.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        device.deviceId.toLowerCase().includes(filters.search.toLowerCase()) ||
        (device.description && device.description.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesStatus = filters.status === 'all' || device.status === filters.status;
      const matchesLinked = filters.linked === 'all' || 
        (filters.linked === 'linked' && device.linked) ||
        (filters.linked === 'unlinked' && !device.linked);
      
      return matchesSearch && matchesStatus && matchesLinked;
    });
  }, [devices, filters]);

  const stats = useMemo(() => ({
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    linked: devices.filter(d => d.linked).length
  }), [devices]);

  const totalPages = Math.ceil(filteredDevices.length / pagination.perPage);
  const paginatedDevices = useMemo(() => {
    const start = (pagination.page - 1) * pagination.perPage;
    return filteredDevices.slice(start, start + pagination.perPage);
  }, [filteredDevices, pagination]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDevice) {
        await api.put(`/devices/${editingDevice.id}`, formData);
      } else {
        await api.post('/devices', formData);
      }
      setShowModal(false);
      setEditingDevice(null);
      setFormData({ deviceId: '', name: '', description: '', traccarDeviceId: '', localName: '' });
      loadDevices();
    } catch (err) {
      console.error('Erro ao salvar dispositivo:', err);
    }
  };

  const handleEdit = (device) => {
    setEditingDevice(device);
    setFormData({
      deviceId: device.deviceId,
      name: device.name,
      description: device.description || '',
      traccarDeviceId: device.traccarDeviceId || '',
      localName: device.localName || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este dispositivo?')) return;
    try {
      await api.delete(`/devices/${id}`);
      loadDevices();
    } catch (err) {
      console.error('Erro ao excluir dispositivo:', err);
    }
  };

  const handleLink = async (id) => {
    const traccarDeviceId = prompt('ID do dispositivo no Traccar:');
    if (!traccarDeviceId) return;
    try {
      await api.post(`/devices/${id}/link`, { traccarDeviceId });
      loadDevices();
    } catch (err) {
      console.error('Erro ao vincular dispositivo:', err);
    }
  };

  const handleUnlink = async (id) => {
    try {
      await api.post(`/devices/${id}/unlink`);
      loadDevices();
    } catch (err) {
      console.error('Erro ao desvincular dispositivo:', err);
    }
  };

  const openNewModal = () => {
    setEditingDevice(null);
    setFormData({ deviceId: '', name: '', description: '', traccarDeviceId: '', localName: '' });
    setShowModal(true);
  };

  const clearFilters = () => {
    setFilters({ search: '', status: 'all', linked: 'all' });
    setPagination({ page: 1, perPage: 25 });
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
        <h1 className="font-heading text-2xl font-bold text-primary-800">Dispositivos</h1>
        <button onClick={openNewModal} className="btn-primary flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Novo</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 card-hover">
          <div className="text-sm text-gray-500 font-medium">Total</div>
          <div className="text-2xl font-heading font-bold text-primary-700">{stats.total}</div>
        </div>
        <div className="glass-card p-4 card-hover">
          <div className="text-sm text-gray-500 font-medium">Online</div>
          <div className="text-2xl font-heading font-bold text-status-online">{stats.online}</div>
        </div>
        <div className="glass-card p-4 card-hover">
          <div className="text-sm text-gray-500 font-medium">Offline</div>
          <div className="text-2xl font-heading font-bold text-status-offline">{stats.offline}</div>
        </div>
        <div className="glass-card p-4 card-hover">
          <div className="text-sm text-gray-500 font-medium">Vinculados</div>
          <div className="text-2xl font-heading font-bold text-accent-600">{stats.linked}</div>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nome, ID ou descrição..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input-field pl-10"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field"
          >
            <option value="all">Todos os status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <select
            value={filters.linked}
            onChange={(e) => setFilters({ ...filters, linked: e.target.value })}
            className="input-field"
          >
            <option value="all">Todos</option>
            <option value="linked">Vinculados</option>
            <option value="unlinked">Não vinculados</option>
          </select>
          <select
            value={pagination.perPage}
            onChange={(e) => setPagination({ ...pagination, perPage: Number(e.target.value), page: 1 })}
            className="input-field"
          >
            <option value={10}>10 por página</option>
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
        </div>
      </div>

      {filteredDevices.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-lg mb-4">Nenhum dispositivo encontrado</p>
          <button onClick={clearFilters} className="btn-primary">
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">Nome</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">Device ID</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">Local Name</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">Traccar ID</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">Última Atualização</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDevices.map((device) => (
                  <tr key={device.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className={`status-indicator ${device.status}`}></div>
                        <span className={`text-sm ${device.status === 'online' ? 'text-status-online' : 'text-status-offline'}`}>
                          {device.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-800">{device.name}</div>
                      {device.description && (
                        <div className="text-sm text-gray-500">{device.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                        {device.deviceId}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {device.localName || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {device.linked ? (
                        <span className="text-primary-600 text-sm">{device.traccarDeviceId}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">Não vinculado</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {device.lastUpdate ? new Date(device.lastUpdate).toLocaleString('pt-BR') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(device)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => device.linked ? handleUnlink(device.id) : handleLink(device.id)}
                          className="p-2 text-gray-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors cursor-pointer"
                          title={device.linked ? 'Desvincular' : 'Vincular'}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(device.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between py-3 px-4 border-t border-gray-200">
            <div className="text-gray-500 text-sm">
              Mostrando {((pagination.page - 1) * pagination.perPage) + 1} - {Math.min(pagination.page * pagination.perPage, filteredDevices.length)} de {filteredDevices.length}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Anterior
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination({ ...pagination, page: pageNum })}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer ${
                      pagination.page === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPagination({ ...pagination, page: Math.min(totalPages, pagination.page + 1) })}
                disabled={pagination.page === totalPages}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-semibold text-primary-800">
                {editingDevice ? 'Editar Dispositivo' : 'Novo Dispositivo'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device ID *</label>
                <input
                  type="text"
                  value={formData.deviceId}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                  className="input-field"
                  placeholder="CA:5E:0E:A3:94:A5"
                  required
                  disabled={editingDevice}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Nome do dispositivo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  placeholder="Descrição opcional"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Traccar Device ID</label>
                <input
                  type="text"
                  value={formData.traccarDeviceId}
                  onChange={(e) => setFormData({ ...formData, traccarDeviceId: e.target.value })}
                  className="input-field"
                  placeholder="ID no Traccar (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local Name (API Externa)</label>
                <input
                  type="text"
                  value={formData.localName}
                  onChange={(e) => setFormData({ ...formData, localName: e.target.value })}
                  className="input-field"
                  placeholder="QM01 (opcional)"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingDevice ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
