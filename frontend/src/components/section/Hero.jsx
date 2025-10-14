import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaArrowRight } from "react-icons/fa";

const Hero = () => {
  const dishes = [
    {
      title: "Cá Kho Tộ",
      description:
        "Món ăn truyền thống đậm đà hương vị, cung cấp đầy đủ dinh dưỡng cho bữa cơm gia đình Việt.",
      image:
        "https://cdnv2.tgdd.vn/mwg-static/common/Common/05052025%20-%202025-05-09T154044.858.jpg",
      label: "Món ăn được yêu thích nhất tuần qua!",
      kcal: 550,
      protein: "30g",
      time: "45 phút",
    },
    {
      title: "Phở Bò",
      description:
        "Phở Bò – tinh hoa ẩm thực Việt Nam, nước dùng trong, ngọt tự nhiên từ xương và thịt bò tươi.",
      image:
        "https://media.istockphoto.com/id/910864612/vi/anh/vietnamese-soup-pho-bo.jpg?s=2048x2048&w=is&k=20&c=IuPrsaIGoEAV4kHWo6obGANhBzQTxFLPCZFcGpHiTRY=",
      label: "Món ăn đặc trưng Hà Nội!",
      kcal: 480,
      protein: "28g",
      time: "35 phút",
    },
    {
      title: "Bánh Mì Thịt",
      description:
        "Món ăn đường phố nổi tiếng của Việt Nam, sự kết hợp hoàn hảo giữa giòn, mềm và đậm vị.",
      image:
        "https://beptueu.vn/hinhanh/tintuc/top-15-hinh-anh-mon-an-ngon-viet-nam-khien-ban-khong-the-roi-mat-1.jpg",
      label: "Bữa sáng nhanh gọn, đủ chất!",
      kcal: 420,
      protein: "20g",
      time: "10 phút",
    },
  ];

  return (
    <section className="relative w-full min-h-[600px] overflow-hidden">
      <div className="container mx-auto px-4">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop
          className="h-full rounded-2xl overflow-hidden" // ✅ thêm bo góc và tránh tràn
        >
          {dishes.map((dish, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-[600px] rounded-2xl overflow-hidden">
                {/* Background image */}
                <img
                  src={dish.image}
                  alt={dish.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30 dark:bg-black/50 z-[1]" />

                {/* Content */}
                <div className="absolute inset-0 flex items-center p-6 md:p-12 z-10">
                  <div className="max-w-xl bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 dark:border-white/10">
                    {dish.label && (
                      <span className="inline-block bg-green-500 text-black dark:text-white text-sm font-medium py-1 px-4 rounded-full mb-4">
                        {dish.label}
                      </span>
                    )}

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white">
                      {dish.title}
                    </h1>

                    <p className="text-base md:text-lg mb-8 text-gray-100">
                      {dish.description}
                    </p>

                    {/* Info items */}
                    <div className="flex items-center space-x-6 mb-8 text-white">
                      {[
                        { label: "Kcal", value: dish.kcal },
                        { label: "Protein", value: dish.protein },
                        {
                          label: dish.time,
                          icon: (
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ),
                        },
                      ].map(({ label, value, icon }, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <span className="bg-white/30 rounded-full w-8 h-8 flex items-center justify-center">
                            {icon ?? (
                              <span className="text-sm font-bold">{value}</span>
                            )}
                          </span>
                          <span className="text-sm md:text-base font-medium">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-black dark:text-gray-100 
                                py-3 px-8 rounded-full font-semibold text-base flex items-center space-x-2
                                shadow-md hover:shadow-lg hover:bg-secondary/80 transition-all duration-300"
                    >
                      <span>Xem chi tiết thực đơn</span>
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Hero;
