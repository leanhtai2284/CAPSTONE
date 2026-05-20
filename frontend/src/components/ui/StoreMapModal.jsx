import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, Navigation } from "lucide-react";

// Fix default icon issue in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const customUserIcon = L.divIcon({
  className: "custom-user-marker",
  html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const StoreMapModal = ({ isOpen, onClose, store, userLocation }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (isOpen && mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen || !store) return null;

  const storeLocation =
    store.location?.coordinates && store.location.coordinates.length === 2
      ? {
          lat: store.location.coordinates[1],
          lng: store.location.coordinates[0],
        }
      : null;

  const center = storeLocation || userLocation || { lat: 10.8231, lng: 106.6297 };

  const handleDirections = () => {
    if (storeLocation) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${storeLocation.lat},${storeLocation.lng}`,
        "_blank"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl relative flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{store.name}</h3>
            <p className="text-sm text-slate-500">
              {store.address || "Chưa cập nhật địa chỉ cụ thể"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative h-96 w-full bg-slate-100 flex-1 min-h-[300px]">
          {!storeLocation ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500 p-8 text-center">
              Siêu thị này chưa cập nhật tọa độ chính xác trên bản đồ.
            </div>
          ) : (
            <MapContainer
              center={center}
              zoom={14}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%", zIndex: 1 }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {userLocation && (
                <Marker position={userLocation} icon={customUserIcon}>
                  <Popup>Vị trí của bạn</Popup>
                </Marker>
              )}

              <Marker position={storeLocation}>
                <Popup>
                  <strong>{store.name}</strong>
                  <br />
                  {store.address}
                </Popup>
              </Marker>

              {userLocation && storeLocation && (
                <Polyline
                  positions={[userLocation, storeLocation]}
                  color="#10b981"
                  weight={3}
                  dashArray="5, 10"
                />
              )}
            </MapContainer>
          )}

          {storeLocation && (
            <button
              onClick={handleDirections}
              className="absolute bottom-4 right-4 z-[2] flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700 transition"
            >
              <Navigation className="h-4 w-4" />
              Chỉ đường
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreMapModal;
