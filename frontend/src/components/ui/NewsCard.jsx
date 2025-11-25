import React from "react";
import { Link } from "react-router-dom";
import { Clock, Eye, Calendar } from "lucide-react";

const NewsCard = ({ news, featured = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (featured) {
    return (
      <Link
        to={`/news/${news.id}`}
        className="group block relative h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
      >
        <div className="relative h-64 overflow-hidden">
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/800x400?text=News+Image";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-block px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full mb-2">
              {news.category}
            </span>
            <h3 className="text-white text-xl font-bold line-clamp-2 group-hover:text-green-300 transition-colors">
              {news.title}
            </h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
            {news.summary}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{formatDate(news.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{news.readTime}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{news.views.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/news/${news.id}`}
      className="group block rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-500"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/800x400?text=News+Image";
          }}
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
            {news.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
          {news.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
          {news.summary}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{news.readTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={12} />
              <span>{news.views.toLocaleString()}</span>
            </div>
          </div>
          <span className="text-gray-400 dark:text-gray-500">
            {formatDate(news.publishedAt)}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {news.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;