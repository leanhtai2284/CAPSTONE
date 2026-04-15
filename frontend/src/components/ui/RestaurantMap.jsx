import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Loader2,
  MapPinIcon,
  NavigationIcon,
  RefreshCcwIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import {
  FALLBACK_LOCATION,
  fetchRestaurantsByDish,
} from "../../services/restaurantMapService";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const defaultIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 0.8 });
  }, [center, map]);
  return null;
}

function openGoogleMapsNavigation(lat, lng) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

async function getUserLocation() {
  return {
    coords: FALLBACK_LOCATION,
    notice: `Đang dùng tọa độ cố định Đà Nẵng: ${FALLBACK_LOCATION.lat}, ${FALLBACK_LOCATION.lng}.`,
  };
}

export default function RestaurantMap({ meal, onClose }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationNotice, setLocationNotice] = useState("");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [mapCenter, setMapCenter] = useState([
    FALLBACK_LOCATION.lat,
    FALLBACK_LOCATION.lng,
  ]);

  const dishName = useMemo(
    () => meal?.name_vi || meal?.title || "món ăn này",
    [meal],
  );

  const loadRestaurants = async () => {
    if (!meal) return;

    setLoading(true);
    setError("");
    setLocationNotice("");

    try {
      const { coords, notice } = await getUserLocation();
      setLocationNotice(notice);

      const data = await fetchRestaurantsByDish({
        meal,
        lat: coords.lat,
        lng: coords.lng,
        intent: "eat-out",
      });

      const list = Array.isArray(data?.restaurants) ? data.restaurants : [];
      setRestaurants(list);

      if (list.length > 0) {
        const first = list[0];
        setMapCenter([first.lat, first.lng]);
        setSelectedRestaurantId(first.name);
      } else {
        setMapCenter([coords.lat, coords.lng]);
        setSelectedRestaurantId(null);
      }
    } catch (apiError) {
      const message =
        apiError?.message ||
        "Không thể tải dữ liệu quán ăn lúc này. Vui lòng thử lại.";
      setError(message);

      setRestaurants([]);
      setSelectedRestaurantId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, [meal?._id, meal?.id]);

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurantId(restaurant.name);
    setMapCenter([restaurant.lat, restaurant.lng]);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-center py-[10px]"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 w-full max-w-6xl mx-auto rounded-3xl h-[97vh] flex flex-col overflow-hidden border border-gray-800 shadow-2xl"
        >
          <div className="w-full flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>

          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-300 dark:border-gray-800">
            <div>
              <h2 className="text-xl font-bold ">
                Quán ăn quanh đây cho{" "}
                <span className="text-primary">{dishName}</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadRestaurants}
                className="p-2 bg-gray-300 dark:bg-gray-700 hover:bg-primary rounded-full text-gray-400 hover:text-white transition-colors"
                title="Tải lại"
              >
                <RefreshCcwIcon className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-gray-300 dark:bg-gray-700 hover:bg-primary rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {locationNotice ? (
            <div className="mx-6 mt-3 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-300">
              {locationNotice}
            </div>
          ) : null}

          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col lg:flex-row">
              <div className="h-[320px] lg:h-full lg:w-1/2 xl:w-3/5 relative bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                  </div>
                ) : (
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: "100%", width: "100%", zIndex: 10 }}
                    zoomControl={false}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapUpdater center={mapCenter} />
                    {restaurants.map((restaurant) => (
                      <Marker
                        key={`${restaurant.name}-${restaurant.lat}-${restaurant.lng}`}
                        position={[restaurant.lat, restaurant.lng]}
                        icon={
                          selectedRestaurantId === restaurant.name
                            ? selectedIcon
                            : defaultIcon
                        }
                        eventHandlers={{
                          click: () => handleRestaurantClick(restaurant),
                        }}
                      >
                        <Popup>
                          <div className="font-semibold text-gray-900">
                            {restaurant.name}
                          </div>
                          <div className="text-sm text-gray-700">
                            {restaurant.address}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </div>

              <div className="flex-1 overflow-y-auto border-t lg:border-t-0 lg:border-l border-gray-300 dark:border-gray-800">
                <div className="p-6 space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex gap-4 p-4 rounded-2xl bg-black animate-pulse"
                      >
                        <div className="w-14 h-14 bg-gray-700 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-3 py-1">
                          <div className="h-4 bg-gray-700 rounded w-3/4" />
                          <div className="h-3 bg-gray-700 rounded w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : error ? (
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium text-white mb-2">
                        Không tải được quán ăn
                      </h3>
                      <p className="text-gray-400 text-sm">{error}</p>
                    </div>
                  ) : restaurants.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPinIcon className="w-8 h-8 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">
                        Không tìm thấy quán phù hợp
                      </h3>
                      <p className="text-gray-400">
                        Chưa có quán nào cho {dishName} quanh vị trí của bạn.
                      </p>
                    </div>
                  ) : (
                    restaurants.map((restaurant) => (
                      <motion.div
                        key={`${restaurant.name}-${restaurant.lat}-${restaurant.lng}-item`}
                        layout
                        onClick={() => handleRestaurantClick(restaurant)}
                        className={`flex gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                          selectedRestaurantId === restaurant.name
                            ? "bg-gray-100 dark:bg-gray-700 border-2 border-primary"
                            : "bg-gray-100 dark:bg-gray-700 border-2 border-transparent hover:border-secondary"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 text-primary flex items-center justify-center flex-shrink-0">
                          <MapPinIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold  truncate pr-2 mb-1">
                              {restaurant.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {restaurant.address}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <div className="flex items-center gap-1">
                                <StarIcon className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                <span>
                                  {Number(restaurant.rating || 0).toFixed(1)}
                                </span>
                              </div>
                              <span>•</span>
                              <span>{restaurant.distance}</span>
                            </div>
                          </div>
                          <div className="flex justify-end mt-3">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                openGoogleMapsNavigation(
                                  restaurant.lat,
                                  restaurant.lng,
                                );
                              }}
                              className="flex items-center gap-1.5 text-xs font-medium text-white hover:bg-secondary transition-colors bg-primary px-3 py-1.5 rounded-lg"
                            >
                              <NavigationIcon className="w-3.5 h-3.5" />
                              Chỉ đường
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
