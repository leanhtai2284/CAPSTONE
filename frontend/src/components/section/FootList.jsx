import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Clock, Tag, Wallet } from "lucide-react";

function FoodList() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1, // Khi 10% section vào khung nhìn
  });

  useEffect(() => {
    const fetchRandomFoods = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/recipes");
        const data = await res.json();
        const items = data.items || [];
        const shuffled = [...items].sort(() => 0.5 - Math.random());
        setFoods(shuffled.slice(0, 3));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRandomFoods();
  }, []);

  if (loading)
    return <p className="text-center text-gray-600 py-10">Đang tải...</p>;
  if (error)
    return <p className="text-center text-red-500 py-10">Lỗi: {error}</p>;

  return (
    <section ref={ref} className="py-16 container mx-auto">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Món ăn nổi bật
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Được chọn ngẫu nhiên từ thực đơn hôm nay
          </p>
        </motion.div>

        <div className="space-y-20">
          {foods.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: isEven ? -80 : 80 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: index * 0.2 }}
                className={`flex flex-col md:flex-row gap-10 items-center ${
                  !isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  src={item.image_url}
                  alt={item.name_vi}
                  className="flex-1 w-full h-80 object-cover rounded-2xl shadow-xl"
                />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
                  className="flex-1"
                >
                  <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
                    {item.name_vi}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  {/* ✅ Card info 3 ô có dark mode */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Thời gian
                        </p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {item.cook_time_min} phút
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/40">
                        <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Giá ước tính
                        </p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {item.price_estimate.min.toLocaleString()} –{" "}
                          {item.price_estimate.max.toLocaleString()}{" "}
                          {item.price_estimate.currency}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/40">
                        <Tag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Phân loại
                        </p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">
                          {item.category}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FoodList;
