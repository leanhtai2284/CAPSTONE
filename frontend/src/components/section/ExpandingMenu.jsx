import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  BarChart3,
  Activity,
  Clock,
  FileText,
  History,
  Mail,
} from "lucide-react";

const menuItems = [
  {
    id: "live-pricing",
    title: "Live Pricing",
    description:
      "Experience truly live pricing with Fey. Unlike other tools, there are no delays—get instant, real-time quotes every time.",
    icon: <Clock className="w-4 h-4" />,
    cta: "Preview live pricing",
    gradient:
      "radial-gradient(circle at 70% 30%, rgba(120,0,50,0.6) 0%, transparent 50%), linear-gradient(135deg, rgba(30,0,20,1), rgba(0,0,0,1))",
  },
  {
    id: "analytics",
    title: "Analytics estimates",
    description:
      "Get detailed analytics and estimates for your financial planning and decision making.",
    icon: <PieChart className="w-4 h-4" />,
    cta: "View analytics",
    gradient:
      "radial-gradient(circle at 10% 40%, rgba(40,80,120,0.5) 0%, transparent 45%), linear-gradient(180deg, rgba(20,40,60,1), rgba(0,0,0,1))",
  },
  {
    id: "financials",
    title: "Company financials",
    description:
      "Unlock the full picture with Fey. Access key stats, income statements, balance sheets, cash flow, and more.",
    icon: <BarChart3 className="w-4 h-4" />,
    cta: "Preview financials",
    gradient:
      "radial-gradient(ellipse at 30% 20%, rgba(50,50,100,0.5) 0%, transparent 60%), linear-gradient(225deg, rgba(30,30,60,1), rgba(0,0,0,1))",
  },
  {
    id: "peer-analysis",
    title: "Peer analysis",
    description:
      "Compare and conquer with Fey's Peer Analysis. Evaluate stocks, spot trends, and benchmark against industry standards.",
    icon: <Activity className="w-4 h-4" />,
    cta: "Preview peer analysis",
    gradient:
      "radial-gradient(circle at 60% 30%, rgba(70,110,60,0.5) 0%, transparent 50%), linear-gradient(135deg, rgba(20,40,10,1), rgba(0,0,0,1))",
  },
  {
    id: "historical",
    title: "Historical earnings",
    description:
      "Uncover trends with comprehensive historical earnings data. Track past EPS and performance to support future strategies.",
    icon: <FileText className="w-4 h-4" />,
    cta: "Preview historical earnings",
    gradient:
      "radial-gradient(ellipse at 40% 20%, rgba(80,80,90,0.4) 0%, transparent 55%), linear-gradient(180deg, rgba(30,30,35,1), rgba(0,0,0,1))",
  },
  {
    id: "insider",
    title: "Insider transactions",
    description:
      "Monitor insider trading activity to gauge internal confidence levels.",
    icon: <History className="w-4 h-4" />,
    cta: "View transactions",
    gradient:
      "radial-gradient(circle at 30% 30%, rgba(100,50,90,0.5) 0%, transparent 50%), linear-gradient(225deg, rgba(50,20,40,1), rgba(0,0,0,1))",
  },
  {
    id: "email",
    title: "Email updates",
    description:
      "Stay informed with regular updates delivered straight to your inbox.",
    icon: <Mail className="w-4 h-4" />,
    cta: "Subscribe now",
    gradient:
      "radial-gradient(ellipse at 70% 20%, rgba(30,80,110,0.5) 0%, transparent 60%), linear-gradient(135deg, rgba(10,30,50,1), rgba(0,0,0,1))",
  },
];

const ExpandingMenu = () => {
  const [activeId, setActiveId] = useState("peer-analysis");

  return (
    <div className="flex w-full max-w-6xl overflow-hidden">
      <div className="flex w-full h-[380px] gap-3">
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            isActive={activeId === item.id}
            onHover={() => setActiveId(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

const MenuItem = ({ item, isActive, onHover }) => (
  <motion.div
    className="relative h-full rounded-2xl overflow-hidden cursor-pointer flex flex-col bg-gray-200"
    style={{ background: item.gradient }}
    animate={{ flex: isActive ? 3 : 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    onMouseEnter={onHover}
  >
    {/* Lớp tối mờ */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-0" />

    {/* Tiêu đề dọc */}
    <div className="absolute bottom-10 left-5 h-full flex items-center z-10">
      <span
        className="text-white font-semibold text-sm tracking-wide whitespace-nowrap origin-center"
        style={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
        }}
      >
        {item.title}
      </span>
    </div>
    {/* Icon */}
    <div className="absolute left-6 bottom-6 text-white z-10">{item.icon}</div>

    {/* Nội dung hiển thị khi active */}
    {isActive && (
      <>
        <p className="absolute left-6 bottom-16 w-[300px] text-sm text-gray-100 leading-relaxed">
          {item.description}
        </p>
        <div className="absolute left-10 bottom-6 text-white text-sm font-medium">
          {item.cta}
        </div>
      </>
    )}
  </motion.div>
);

export default ExpandingMenu;
