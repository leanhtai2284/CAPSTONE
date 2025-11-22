import React, { useState } from "react";
import {
  XIcon,
  ChefHatIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
} from "lucide-react";
import { motion } from "framer-motion";

function CookingStepsView({ meal, onClose, onBackToDetails }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNextStep = () => {
    if (currentStep < meal.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onBackToDetails();
  };

  const isLastStep = currentStep === meal.steps.length - 1;

  return (
    <div className="h-full flex flex-col overflow-hidden animate-fade-in">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        .step-transition {
          animation: stepSlide 0.3s ease-out;
        }
        @keyframes stepSlide {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      {/* Header with image - cooking info overlaid on top */}
      <div className="relative flex-shrink-0 h-48 sm:h-56 md:h-64">
        <img
          src={meal.image_url}
          alt={meal.name_vi}
          className="w-full h-full object-cover"
        />

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-md transition-all duration-300 z-10"
        >
          <XIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>

        {/* Cooking Mode Header - Overlaid on image */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
          {/* Top section - Back button */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ x: -4 }}
              onClick={onBackToDetails}
              className="flex items-center gap-2 text-white hover:text-white transition-all duration-300 text-sm sm:text-base backdrop-blur-sm bg-black/30 px-3 py-2 rounded-full hover:bg-black/50"
            >
              <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Quay lại</span>
            </motion.button>
          </div>

          {/* Bottom section - Dish info */}
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out shadow-lg shadow-secondary"
                style={{
                  width: `${((currentStep + 1) / meal.steps.length) * 100}%`,
                }}
              />
            </div>

            {/* Dish name and step info */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-secondary rounded-full flex items-center justify-center shadow-lg shadow-[#22C55E]/40 ring-2 ring-white/30">
                <ChefHatIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg truncate">
                  {meal.name_vi}
                </h2>
                <p className="text-white/70 text-xs sm:text-sm mt-1">
                  {currentStep === 0 && "Chuẩn bị nguyên liệu"}
                  {currentStep > 0 &&
                    currentStep < meal.steps.length - 1 &&
                    "👨‍🍳 Đang thực hiện"}
                  {currentStep === meal.steps.length - 1 && "✨ Hoàn thành"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content - scrollable */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100/10 dark:bg-gray-900/80">
        <div
          className="max-w-2xl mx-auto space-y-4 sm:space-y-6 step-transition pb-4"
          key={currentStep}
        >
          {/* Step Number */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-[#22C55E]/30">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {currentStep + 1}
              </span>
            </div>

            <div className="flex-1">
              <p className="text-xs sm:text-sm  uppercase tracking-wide">
                Bước {currentStep + 1}
              </p>
              <p className="text-base sm:text-lg font-semibold ">
                {isLastStep ? "Hoàn thành món ăn" : "Đang thực hiện"}
              </p>
            </div>
          </div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800  rounded-2xl p-6 sm:p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-all duration-300"
          >
            <p className="text-lg sm:text-xl leading-relaxed ">
              {meal.steps[currentStep]}
            </p>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-3 sm:p-4 bg-secondary rounded-xl border border-green-300/70"
          >
            <ClockIcon className="w-5 h-5 text-green-200 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-gray-200">
              <span className="text-green-200 font-medium">Mẹo: </span>
              {currentStep === 0 &&
                "Chuẩn bị đầy đủ nguyên liệu trước khi bắt đầu"}
              {currentStep > 0 &&
                currentStep < meal.steps.length - 1 &&
                "Thực hiện từ từ và cẩn thận"}
              {isLastStep &&
                "Kiểm tra độ chín và nêm nếm lại trước khi hoàn thành"}
            </p>
          </motion.div>

          {/* Step Dots */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-2 sm:pt-4">
            {meal.steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentStep
                    ? "w-7 h-2.5 sm:w-8 sm:h-3 bg-primary"
                    : index < currentStep
                    ? "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400"
                    : "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex-shrink-0 bg-gray-100/10 dark:bg-gray-900/80 border-t p-4 sm:p-6">
        <div className="flex gap-2 sm:gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
              currentStep === 0
                ? "bg-white dark:bg-slate-800 text-gray-600 cursor-not-allowed"
                : "bg-white dark:bg-slate-800 text-gray-600 hover:bg-primary hover:text-white"
            }`}
          >
            <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Quay lại</span>
          </motion.button>

          {isLastStep ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleComplete}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-primary hover:bg-green-500 text-white font-semibold py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg shadow-[#22C55E]/30 text-sm sm:text-base"
            >
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Hoàn tất</span>
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNextStep}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 b bg-primary hover:bg-secondary text-white font-semibold py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg shadow-[#22C55E]/30 text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Tiếp theo</span>
              <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CookingStepsView;
