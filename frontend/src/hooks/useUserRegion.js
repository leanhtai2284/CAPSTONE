import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { userService } from "../services/userService";

/**
 * Custom hook để lấy và quản lý vùng miền của user từ profile
 * @returns {Object} { region, regionTitle, loading, error }
 */
export const useUserRegion = () => {
  const { user } = useAuth();
  const [region, setRegion] = useState("Bắc");
  const [regionTitle, setRegionTitle] = useState("Hương vị miền Bắc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function để map region từ backend sang title
  const getRegionTitle = (regionValue) => {
    const mapping = {
      Bắc: "Hương vị miền Bắc",
      Trung: "Hương vị miền Trung",
      Nam: "Hương vị miền Nam",
    };
    return mapping[regionValue] || "Hương vị miền Bắc";
  };

  useEffect(() => {
    const loadUserRegion = async () => {
      setLoading(true);
      setError(null);

      // Nếu chưa đăng nhập, dùng mặc định
      if (!user) {
        setRegion("Bắc");
        setRegionTitle("Hương vị miền Bắc");
        setLoading(false);
        return;
      }

      try {
        const response = await userService.getProfile();

        if (response.success && response.data?.preferences?.region) {
          const userRegion = response.data.preferences.region;
          setRegion(userRegion);
          setRegionTitle(getRegionTitle(userRegion));
        } else {
          // Nếu chưa có preferences, dùng mặc định
          setRegion("Bắc");
          setRegionTitle("Hương vị miền Bắc");
        }
      } catch (err) {
        console.error(" Lỗi khi tải profile:", err);
        setError(err.message || "Không thể tải thông tin vùng miền");
        // Nếu lỗi, dùng mặc định
        setRegion("Bắc");
        setRegionTitle("Hương vị miền Bắc");
      } finally {
        setLoading(false);
      }
    };

    loadUserRegion();
  }, [user]);

  return {
    region,
    regionTitle,
    loading,
    error,
  };
};
