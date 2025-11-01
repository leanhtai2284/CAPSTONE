import React from "react";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const weekdays = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
];

function WeekdaySelector({ selectedDay, onDayChange }) {
  const handlePrevDay = () => {
    const currentIndex = weekdays.findIndex((d) => d.value === selectedDay);
    const prevIndex =
      currentIndex === 0 ? weekdays.length - 1 : currentIndex - 1;
    onDayChange(weekdays[prevIndex].value);
  };

  const handleNextDay = () => {
    const currentIndex = weekdays.findIndex((d) => d.value === selectedDay);
    const nextIndex =
      currentIndex === weekdays.length - 1 ? 0 : currentIndex + 1;
    onDayChange(weekdays[nextIndex].value);
  };

  return (
    <div className="bg-white dark:bg-slate-950 rounded-2xl p-4 border border-gray-300 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Nút ngày trước */}
        <button
          onClick={handlePrevDay}
          className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors"
          aria-label="Ngày trước"
        >
          <ChevronLeftIcon className="w-5 h-5 " />
        </button>

        {/* Danh sách ngày trong tuần */}
        <div className="flex-1 flex items-center justify-center gap-4 overflow-x-auto scrollbar-hide">
          {weekdays.map((day) => (
            <motion.button
              key={day.value}
              onClick={() => onDayChange(day.value)}
              // Giữ layout cố định
              className={`min-w-[70px] h-10 flex-shrink-0 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedDay === day.value
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-200 dark:bg-gray-800 hover:text-white hover:bg-primary"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {day.label}
            </motion.button>
          ))}
        </div>

        {/* Nút ngày tiếp theo */}
        <button
          onClick={handleNextDay}
          className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors"
          aria-label="Ngày tiếp theo"
        >
          <ChevronRightIcon className="w-5 h-5 " />
        </button>
      </div>
    </div>
  );
}

export default WeekdaySelector;
