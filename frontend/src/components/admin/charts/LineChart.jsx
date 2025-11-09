import React from "react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const LineChart = ({ data, dataKey, nameKey = "date", color = "#3b82f6", title, strokeWidth = 3 }) => {
  // Calculate domain for Y-axis to show data better
  const maxValue = Math.max(...data.map((d) => d[dataKey] || 0), 1);
  const yAxisDomain = [0, maxValue === 0 ? 1 : Math.ceil(maxValue * 1.1)];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
          <XAxis
            dataKey={nameKey}
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            tick={{ fill: "currentColor", fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={70}
            interval={data.length > 30 ? Math.floor(data.length / 10) : data.length > 12 ? 2 : 0}
            minTickGap={5}
          />
          <YAxis
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            tick={{ fill: "currentColor", fontSize: 12 }}
            domain={yAxisDomain}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ color: "#374151", fontWeight: "bold" }}
            className="dark:bg-gray-700 dark:border-gray-600"
          />
          <Legend wrapperStyle={{ paddingTop: "10px" }} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={strokeWidth}
            dot={{ r: 5, fill: color, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 7, fill: color, strokeWidth: 2, stroke: "#fff" }}
            connectNulls={false}
            animationDuration={1000}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;

