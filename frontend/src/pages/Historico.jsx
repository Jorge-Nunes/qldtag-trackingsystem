import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { formatDisplayDate } from '../utils/dateUtils';


const createIcon = (status) => {
  const color = status === 'online' ? '#22C55E' : '#EF4444';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const createStartIcon = () => L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: #2563EB;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const createEndIcon = () => L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: #F97316;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const createSelectedIcon = () => L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #8B5CF6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 1.5s infinite;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5); }
        50% { transform: scale(1.1); box-shadow: 0 6px 20px rgba(139, 92, 246, 0.7); }
        100% { transform: scale(1); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5); }
      }
    </style>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const MapBounds = ({ positions, selectedPosition }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedPosition) {
      map.setView([selectedPosition.latitude, selectedPosition.longitude], 16);
    } else if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(p => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, selectedPosition, map]);
  
  return null;
};

const Historico = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [positions, setPositions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 25
  });

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await api.get('/devices');
      setDevices(response.data);
      if (response.data.length > 0) {
        setSelectedDevice(response.data[0].deviceId);
      }
    } catch (err) {
      console.error('Erro ao carregar dispositivos:', err);
    }
  };

  const loadHistory = async () => {
    if (!selectedDevice || !startDate || !endDate) {
      alert('Por favor, selecione um dispositivo e as datas');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/positions/history', {
        params: {
          deviceId: selectedDevice,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString()
        }
      });
      setPositions(response.data);
      setPagination(prev => ({ ...prev, page: 1 }));
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newOffset) => {
    loadHistory(newOffset);
  };

  const getDefaultDates = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 1);
    
    setStartDate(start.toISOString().slice(0, 16));
    setEndDate(end.toISOString().slice(0, 16));
  };

  const totalPages = Math.ceil(positions.length / pagination.perPage);
  const paginatedPositions = useMemo(() => {
    const start = (pagination.page - 1) * pagination.perPage;
    return positions.slice(start, start + pagination.perPage);
  }, [positions, pagination]);

  useEffect(() => {
    if (devices.length > 0 && !startDate && !endDate) {
      getDefaultDates();
    }
  }, [devices]);

  const polylinePositions = paginatedPositions.map(p => [p.latitude, p.longitude]);

  const showOnMap = (position) => {
    setSelectedPosition(position);
    setShowMap(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-primary-800">Histórico de Posições</h1>

      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dispositivo</label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="input-field"
            >
              <option value="">Selecione...</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} ({device.deviceId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={loadHistory}
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Buscar</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${showMap ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}
              title={showMap ? 'Ocultar mapa' : 'Mostrar mapa'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showMap && positions.length > 0 && (
        <div className="glass-card overflow-hidden" style={{ height: '400px' }}>
          <MapContainer
            center={[positions[0]?.latitude || 0, positions[0]?.longitude || 0]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapBounds positions={positions} selectedPosition={selectedPosition} />

            {polylinePositions.length > 1 && (
              <Polyline
                positions={polylinePositions}
                color="#2563EB"
                weight={3}
                opacity={0.7}
                dashArray="10, 10"
              />
            )}

            {positions.length > 0 && (
              <>
                <Marker
                  position={[positions[0].latitude, positions[0].longitude]}
                  icon={createStartIcon()}
                >
                  <Popup>Início: {formatDisplayDate(positions[0].timestamp)}</Popup>
                </Marker>

                <Marker
                  position={[positions[positions.length - 1].latitude, positions[positions.length - 1].longitude]}
                  icon={createEndIcon()}
                >
                  <Popup>Fim: {formatDisplayDate(positions[positions.length - 1].timestamp)}</Popup>
                </Marker>

                {selectedPosition && (
                  <Marker
                    position={[selectedPosition.latitude, selectedPosition.longitude]}
                    icon={createSelectedIcon()}
                  >
                    <Popup>
                      <div className="p-1">
                        <p className="font-semibold">Posição Selecionada</p>
                        <p className="text-sm">{formatDisplayDate(selectedPosition.timestamp)}</p>
                        <p className="text-xs text-gray-500">
                          {selectedPosition.latitude.toFixed(6)}, {selectedPosition.longitude.toFixed(6)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </>
            )}
          </MapContainer>
        </div>
      )}

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-primary-800">
            Posições ({positions.length})
          </h2>
          {positions.length > 0 && (
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
          )}
        </div>

        {positions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Selecione um dispositivo e datas para ver o histórico</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Data/Hora</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Latitude</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Longitude</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Precisão</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPositions.map((pos, index) => (
                    <tr 
                      key={pos.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => showOnMap(pos)}
                    >
                      <td className="py-3 px-4 text-sm">{formatDisplayDate(pos.timestamp)}</td>
                      <td className="py-3 px-4 text-sm font-mono">{pos.latitude.toFixed(6)}</td>
                      <td className="py-3 px-4 text-sm font-mono">{pos.longitude.toFixed(6)}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{formatDisplayDate(pos.timestamp)}</p>
                          <p className="text-xs text-gray-400">{pos.accuracy ? `${pos.accuracy}m` : '-'}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between py-3 px-4 border-t border-gray-200">
                <div className="text-gray-500 text-sm">
                  Mostrando {((pagination.page - 1) * pagination.perPage) + 1} - {Math.min(pagination.page * pagination.perPage, positions.length)} de {positions.length}
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Historico;
