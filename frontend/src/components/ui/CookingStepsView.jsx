import React, { useState } from "react";
import {
  XIcon,
  ChefHatIcon,
  ArrowLeftIcon,
  ClockIcon,
  VideoOffIcon,
  UserIcon,
} from "lucide-react";

function CookingStepsView({ meal, onClose, onBackToDetails }) {
  // Validate meal data
  if (!meal || !meal.steps || meal.steps.length === 0) {
    return (
      <div className="flex flex-col max-h-[90vh] bg-white">
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <button
            onClick={onBackToDetails}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Quay lại</span>
          </button>
          <h2 className="text-lg font-bold text-gray-900">Lỗi dữ liệu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <XIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-gray-600 font-medium">
              Không thể tải thông tin công thức
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Vui lòng kết nối lại và thử lại
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if video is valid
  const hasVideo = meal.video_url && meal.video_url.trim().length > 0;

  // Calculate total cooking time (fallback: 30 minutes if not provided)
  const totalTime = meal.total_time || meal.time || 30;

  return (
    <div className="flex flex-col max-h-[90vh] bg-white animate-cooking-fade-in">
      <style>{`
        @keyframes cookingFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-cooking-fade-in {
          animation: cookingFadeIn 0.35s ease-out;
        }
      `}</style>

      {/* Header Bar — fixed height */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black">
        <button
          onClick={onBackToDetails}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-300 hover:text-gray-800 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Quay lại</span>
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-secondary dark:text-primary truncate max-w-[200px] md:max-w-none">
            {meal.name_vi || "Không tên"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
        >
          <XIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Scrollable: Video + Steps together */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Video Section */}
        <div className="px-5 py-4 bg-white dark:bg-black">
          {hasVideo ? (
            <div className="space-y-2">
              <div
                className="relative w-full rounded-2xl overflow-hidden shadow-lg shadow-black/10"
                style={{
                  aspectRatio: "16/9",
                }}
              >
                <iframe
                  src={meal.video_url}
                  title={`Video hướng dẫn ${meal.name_vi}`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={(e) => {
                    console.warn("Video iframe loading error:", e);
                  }}
                />
              </div>
              {meal.uploaded_by && (
                <div className="flex items-center gap-1.5 px-1">
                  <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    Đăng bởi{" "}
                    <span className="text-gray-600 font-medium">
                      {meal.uploaded_by}
                    </span>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              className="w-full rounded-2xl bg-gray-100 dark:bg-gray-950 border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-3"
              style={{
                aspectRatio: "16/9",
              }}
            >
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                <VideoOffIcon className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400 font-medium">
                Chưa có video hướng dẫn
              </p>
              <p className="text-xs text-gray-300">
                Video sẽ được cập nhật sớm
              </p>
            </div>
          )}
        </div>

        {/* Info Bar */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black ">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <ClockIcon className="w-4 h-4 text-primary" />
            <span>{totalTime} phút</span>
          </div>
          <div className="w-px h-4 bg-gray-300" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {meal.steps.length} bước
          </span>
          <div className="w-px h-4 bg-gray-300" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {meal.difficulty || "Trung bình"}
          </span>
        </div>

        {/* Steps List */}
        <div className="px-5 pb-8 space-y-4 bg-white dark:bg-black">
          {meal.steps.map((step, index) => (
            <div key={index} className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/20">
                  {index + 1}
                </div>
                {index < meal.steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-emerald-200 mt-2" />
                )}
              </div>
              <div
                className={`flex-1 ${
                  index < meal.steps.length - 1 ? "pb-4" : ""
                }`}
              >
                <div className="bg-white dark:bg-gray-950 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 group-hover:border-emerald-200 group-hover:shadow-md transition-all duration-200">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                    Bước {index + 1}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[15px]">
                    {step}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Completion Card */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                <ChefHatIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                <p className="text-emerald-700 font-semibold">Hoàn thành! 🎉</p>
                <p className="text-emerald-600 text-sm mt-1">
                  Chúc bạn có một bữa ăn ngon miệng với món {meal.name_vi}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookingStepsView;
