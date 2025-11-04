import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

// Hook debounce để tránh gọi API liên tục khi nhập
function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query);
  const wrapperRef = useRef(null); // 🔸 để phát hiện click ngoài vùng

  // 🔍 Gợi ý nhanh khi người dùng nhập
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5000/api/recipes?text=${debouncedQuery}&limit=5`
        );
        const data = await res.json();
        setResults(data.items || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Lỗi khi tìm kiếm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  // 📦 Click ngoài → đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⌨️ Enter hoặc click search → sang trang /search
  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/search?text=${encodeURIComponent(query.trim())}`);
    setShowDropdown(false);
  };

  // 🖱️ Click vào gợi ý → sang trang search
  const handleSuggestionClick = (name) => {
    navigate(`/search?text=${encodeURIComponent(name)}`);
    setQuery(name);
    setShowDropdown(false);
  };

  return (
    <div
      ref={wrapperRef}
      className="hidden sm:block flex-1 ml-2 relative max-w-[300px]"
    >
      {/* Ô nhập */}
      <input
        type="text"
        placeholder="Tìm món ăn, nguyên liệu..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className="w-full pl-4 pr-12 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full 
        focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 
        bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 
        placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all duration-200"
      />

      {/* Nút search */}
      <button
        type="button"
        onClick={handleSearch}
        className="absolute right-2 top-1/2 -translate-y-1/2 
        flex items-center justify-center w-9 h-9 rounded-full 
        bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 
        hover:bg-gray-300 dark:hover:bg-gray-700 
        transition-all duration-200"
      >
        <Search size={18} strokeWidth={2.2} />
      </button>

      {/* Dropdown gợi ý */}
      {showDropdown && results.length > 0 && (
        <ul
          className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 
          border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg 
          max-h-60 overflow-y-auto z-50 transition-all duration-200"
        >
          {results.map((item) => (
            <li
              key={item._id}
              onClick={() => handleSuggestionClick(item.name_vi)}
              className="p-2.5 text-sm text-gray-800 dark:text-gray-100 
              hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition"
            >
              {item.name_vi || item.dish_name}
            </li>
          ))}
        </ul>
      )}

      {loading && query && (
        <div className="absolute top-full mt-2 w-full text-center text-gray-500 text-sm">
          Đang tìm kiếm...
        </div>
      )}
    </div>
  );
}

export default SearchBar;
