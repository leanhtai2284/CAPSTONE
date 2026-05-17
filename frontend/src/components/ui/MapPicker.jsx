import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

const LocationMarker = ({ position, setPosition, onChange }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      if (onChange) {
        onChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
};

const MapPicker = ({
  defaultPosition,
  onChange,
  label = "Chọn vị trí trên bản đồ",
}) => {
  // Default to HCMC if no position provided
  const [position, setPosition] = useState(defaultPosition || null);
  const mapCenter = defaultPosition || { lat: 10.8231, lng: 106.6297 }; // HCMC center
  const mapRef = useRef(null);
  const [geoStatus, setGeoStatus] = useState({ loading: false, error: "" });

  useEffect(() => {
    if (defaultPosition) {
      setPosition(defaultPosition);
      if (mapRef.current) {
        mapRef.current.flyTo(defaultPosition, mapRef.current.getZoom());
      }
    }
  }, [defaultPosition]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoStatus({
        loading: false,
        error: "Trinh duyet khong ho tro dinh vi.",
      });
      return;
    }

    setGeoStatus({ loading: true, error: "" });
    const applyPosition = (pos) => {
      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setPosition(coords);
      if (onChange) {
        onChange(coords.lat, coords.lng);
      }
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        mapRef.current.flyTo(coords, 16);
      }
      setGeoStatus({ loading: false, error: "" });
    };

    const handleError = (err, allowRetry) => {
      if (allowRetry && (err.code === 2 || err.code === 3)) {
        navigator.geolocation.getCurrentPosition(
          applyPosition,
          (finalErr) => {
            const message =
              finalErr.code === 1
                ? "Ban da tu choi quyen dinh vi."
                : finalErr.code === 2
                  ? "Khong the lay vi tri. Hay bat Location tren may."
                  : "Dinh vi qua lau, vui long thu lai.";
            setGeoStatus({ loading: false, error: message });
          },
          { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 },
        );
        return;
      }

      const message =
        err.code === 1
          ? "Ban da tu choi quyen dinh vi."
          : err.code === 2
            ? "Khong the lay vi tri. Hay bat Location tren may."
            : "Dinh vi qua lau, vui long thu lai.";
      setGeoStatus({ loading: false, error: message });
    };

    navigator.geolocation.getCurrentPosition(
      applyPosition,
      (err) => handleError(err, true),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 },
    );
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}{" "}
          <span className="text-xs font-normal text-slate-400 ml-1">
            (Nhấp vào bản đồ để ghim)
          </span>
        </label>
      )}
      <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-200 relative z-0">
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            onChange={onChange}
          />
        </MapContainer>
        <button
          type="button"
          onClick={handleLocateMe}
          className="absolute right-3 top-3 z-[2] rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow hover:bg-white"
          disabled={geoStatus.loading}
        >
          {geoStatus.loading ? "Dang dinh vi..." : "Ve vi tri cua toi"}
        </button>
      </div>
      <p className="text-xs text-slate-500 mt-1">
        Vị trí đang chọn:{" "}
        {position
          ? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`
          : "Chưa chọn"}
      </p>
      {geoStatus.error && (
        <p className="text-xs text-rose-600 mt-1">{geoStatus.error}</p>
      )}
    </div>
  );
};

export default MapPicker;
