import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
  SendIcon,
} from "lucide-react";
import Footer from "../components/layout/Footer";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Liên hệ với
            <span className="hidden md:inline whitespace-nowrap">
              <span className="text-red-600"> Smart</span>
              <span className="text-red-600">Meal</span>
              <span className="text-yellow-300">VN</span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-white/90"
          >
            Chúng tôi luôn sẵn sàng lắng nghe phản hồi và góp ý từ bạn
          </motion.p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Thông tin liên hệ
                </h2>
                <p className="text-gray-600 mb-8">
                  Hãy liên hệ với chúng tôi qua các kênh sau để được hỗ trợ
                  nhanh nhất
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MailIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                    <p className="text-gray-600">support@smartmeal.vn</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Hotline
                    </h3>
                    <p className="text-gray-600">0123 456 789</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Địa chỉ
                    </h3>
                    <p className="text-gray-600">TP. Đà Nẵng, Việt Nam</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-4">
                  Kết nối với chúng tôi
                </h3>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="w-12 h-12 bg-primary/10 hover:bg-primary rounded-lg flex items-center justify-center transition-colors group"
                  >
                    <FacebookIcon className="w-6 h-6 text-primary group-hover:text-white" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-primary/10 hover:bg-primary rounded-lg flex items-center justify-center transition-colors group"
                  >
                    <InstagramIcon className="w-6 h-6 text-primary group-hover:text-white" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-primary/10 hover:bg-primary rounded-lg flex items-center justify-center transition-colors group"
                  >
                    <YoutubeIcon className="w-6 h-6 text-primary group-hover:text-white" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Gửi tin nhắn cho chúng tôi
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nội dung
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Nhập nội dung tin nhắn của bạn"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-[#2ab858] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105"
                >
                  <SendIcon className="w-5 h-5" />
                  Gửi liên hệ
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative h-96 rounded-2xl overflow-hidden shadow-lg"
          >
            <img
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80"
              alt="Vietnamese Kitchen"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Đến thăm chúng tôi</h3>
                <p className="text-white/90">
                  Chúng tôi luôn chào đón bạn tại 120 Hoàng Minh Thảo, TP. Đà
                  Nẵng, Việt Nam
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
