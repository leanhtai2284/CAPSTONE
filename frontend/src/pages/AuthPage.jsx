import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "./auth/LoginForm";
import { RegisterForm } from "./auth/RegisterForm";
import { useAuth } from "../context/AuthContext";
import { LogOutIcon, UserIcon } from "lucide-react";

function Welcome() {
  const { user, logout } = useAuth();

  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
        <UserIcon className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Xin chào, {user?.name}!
      </h2>
      <p className="text-white mb-6">
        Bạn đã đăng nhập thành công vào hệ thống.
      </p>
      <button
        onClick={logout}
        className="py-2 px-4 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center justify-center mx-auto transition-colors"
      >
        <LogOutIcon className="h-4 w-4 mr-2" />
        Đăng xuất
      </button>
    </div>
  );
}

function AuthContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  if (user) return <Welcome />;

  return (
    <>
      {/* Tabs */}
      <div className="flex mb-8 relative">
        <button
          onClick={() => setActiveTab("login")}
          className={`w-1/2 py-2 text-center font-semibold text-lg ${
            activeTab === "login" ? "text-green-600" : "text-white"
          }`}
        >
          ĐĂNG NHẬP
        </button>
        <button
          onClick={() => setActiveTab("register")}
          className={`w-1/2 py-2 text-center font-semibold text-lg ${
            activeTab === "register" ? "text-green-600" : "text-white"
          }`}
        >
          ĐĂNG KÝ
        </button>
        <motion.div
          className="absolute bottom-0 h-0.5 bg-green-600"
          initial={false}
          animate={{
            left: activeTab === "login" ? "0%" : "50%",
            width: "50%",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        />
      </div>

      {/* Forms */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function AuthPage() {
  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/33062498/pexels-photo-33062498.jpeg"
          alt="Vietnamese coastal scene"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col md:flex-row w-full min-h-screen relative z-10">
        <div className="w-full md:w-[60%] flex flex-col justify-center p-8 md:p-16 text-white">
          <div className="flex items-center space-x-0 h-16">
            <span className="hidden md:inline text-2xl font-bold whitespace-nowrap ml-1">
              <span className="text-red-600">Smart</span>
              <span className="text-red-600">Meal</span>
              <span className="text-yellow-300">VN</span>
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            KHÁM PHÁ
            <br />
            ẨM THỰC
          </h1>
          <p className="text-xl mb-2">
            Nơi hương vị truyền thống Việt Nam
            <br />
            trở thành hiện thực.
          </p>
          <p className="text-md max-w-md">
            Bắt đầu hành trình ẩm thực nơi mỗi món ăn đều mang đến trải nghiệm
            dinh dưỡng cân bằng.
          </p>
        </div>

        <div className="w-full md:w-[40%] flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md bg-black/50 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8">
            <AuthContent />
          </div>
        </div>
      </div>
    </div>
  );
}
