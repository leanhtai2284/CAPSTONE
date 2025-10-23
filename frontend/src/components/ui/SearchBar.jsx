import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

// Hook debounce tránh gọi API liên tục
function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

// Fake dữ liệu mẫu
const FAKE_FOODS = [
  { id: 1, name: "Phở bò Hà Nội" },
  { id: 2, name: "Bánh mì thịt" },
  { id: 3, name: "Cơm tấm sườn bì chả" },
  { id: 4, name: "Gỏi cuốn tôm thịt" },
  { id: 5, name: "Bún chả" },
];

function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const debouncedQuery = useDebounce(query);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    // Giả lập API tìm kiếm
    setTimeout(() => {
      const filtered = FAKE_FOODS.filter((item) =>
        item.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
      setResults(filtered);
    }, 300);
  }, [debouncedQuery]);

  // Xử lý khi nhấn Enter hoặc click nút
  const handleSearch = () => {
    if (!query.trim()) return;
    console.log("Tìm kiếm:", query);
    // TODO: gọi API khi bạn có endpoint thực tế
  };

  return (
    <div className="hidden sm:block flex-1 ml-2 relative max-w-[300px]">
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

      {/* Kết quả tìm kiếm */}
      {results.length > 0 && (
        <ul
          className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 
          border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg 
          max-h-60 overflow-y-auto z-50 transition-all duration-200"
        >
          {results.map((item) => (
            <li
              key={item.id}
              className="p-2.5 text-sm text-gray-800 dark:text-gray-100 
              hover:bg-gray-100 dark:bg-slate-950 dark:hover:bg-gray-800 cursor-pointer transition"
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
