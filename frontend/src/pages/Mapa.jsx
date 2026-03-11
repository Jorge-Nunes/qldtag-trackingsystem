import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { formatDisplayDate } from '../utils/dateUtils';

const createIcon = (status) => {
  const color = status === 'online' ? '#22C55E' : '#EF4444';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const MapCenter = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

const Mapa = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [center, setCenter] = useState(null);

  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadDevices = async () => {
    try {
      const response = await api.get('/devices');
      const devicesWithPositions = response.data.filter(d => d.positions && d.positions.length > 0);
      setDevices(devicesWithPositions);

      if (devicesWithPositions.length > 0 && !selectedDevice) {
        const firstPos = devicesWithPositions[0].positions[0];
        setCenter({ lat: firstPos.latitude, lng: firstPos.longitude });
      }
    } catch (err) {
      console.error('Erro ao carregar dispositivos:', err);
    } finally {
      setLoading(false);
    }
  };

  const centerOnDevice = (device) => {
    if (device.positions && device.positions.length > 0) {
      const pos = device.positions[0];
      setCenter({ lat: pos.latitude, lng: pos.longitude });
      setSelectedDevice(device);
    }
  };

  const onlineCount = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const defaultCenter = center || [-23.5505, -46.6333];
  const defaultZoom = center ? 15 : 5;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-primary-800">Mapa de Dispositivos</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-status-online rounded-full animate-pulse-slow"></div>
            <span className="text-sm font-medium text-gray-600">{onlineCount} Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-status-offline rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">{offlineCount} Offline</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {devices.length === 0 ? (
            <div className="glass-card p-6 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <p>Nenhum dispositivo com posição</p>
            </div>
          ) : (
            devices.map((device) => (
              <button
                key={device.id}
                onClick={() => centerOnDevice(device)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  selectedDevice?.id === device.id
                    ? 'bg-primary-50 border-2 border-primary-500'
                    : 'bg-white border border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800 truncate">{device.name}</span>
                  <div className={`status-indicator ${device.status}`}></div>
                </div>
                <div className="text-xs text-gray-500">
                  {device.positions && device.positions[0] && (
                    <span>{formatDisplayDate(device.positions[0].timestamp)}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
            <MapContainer
              center={defaultCenter}
              zoom={defaultZoom}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapCenter center={center} />

              {devices.map((device) => {
                if (!device.positions || device.positions.length === 0) return null;
                
                const pos = device.positions[0];
                
                return (
                  <Marker
                    key={device.id}
                    position={[pos.latitude, pos.longitude]}
                    icon={createIcon(device.status)}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <h3 className="font-heading font-semibold text-lg mb-2">{device.name}</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Status:</span> {device.status === 'online' ? '🟢 Online' : '🔴 Offline'}</p>
                          <p><span className="font-medium">ID:</span> {device.deviceId}</p>
                          <p><span className="font-medium">Última atualização:</span> {formatDisplayDate(pos.timestamp)}</p>
                          <p><span className="font-medium">Coordenadas:</span> {pos.latitude.toFixed(6)}, {pos.longitude.toFixed(6)}</p>
                          {pos.accuracy && <p><span className="font-medium">Precisão:</span> {pos.accuracy}m</p>}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mapa;
