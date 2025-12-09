import axios from "axios";

const API_URL = "http://localhost:5000/api/news";

// Get auth token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem("token"); // Fixed: changed from "access_token" to "token"
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get all news with pagination and filters
 * @param {Object} params - Query parameters (page, limit, category, search)
 * @returns {Promise} News list with pagination info
 */
export const getNews = async (params = {}) => {
    try {
        const response = await axios.get(API_URL, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching news:", error);
        throw error;
    }
};

/**
 * Get featured news
 * @param {number} limit - Number of featured news to fetch
 * @returns {Promise} Featured news list
 */
export const getFeaturedNews = async (limit = 6) => {
    try {
        const response = await axios.get(`${API_URL}/featured`, {
            params: { limit },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching featured news:", error);
        throw error;
    }
};

/**
 * Get single news by ID
 * @param {string} id - News ID
 * @returns {Promise} News details
 */
export const getNewsById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching news by ID:", error);
        throw error;
    }
};

/**
 * Create new news (admin only)
 * @param {Object} newsData - News data
 * @returns {Promise} Created news
 */
export const createNews = async (newsData) => {
    try {
        const response = await axios.post(API_URL, newsData, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error("Error creating news:", error);
        throw error;
    }
};

/**
 * Update news (admin only)
 * @param {string} id - News ID
 * @param {Object} newsData - Updated news data
 * @returns {Promise} Updated news
 */
export const updateNews = async (id, newsData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, newsData, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error("Error updating news:", error);
        throw error;
    }
};

/**
 * Delete news (admin only)
 * @param {string} id - News ID
 * @returns {Promise} Delete confirmation
 */
export const deleteNews = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting news:", error);
        throw error;
    }
};

/**
 * Like/Unlike news
 * @param {string} id - News ID
 * @returns {Promise} Updated news with new like count
 */
export const likeNews = async (id) => {
    try {
        const response = await axios.post(
            `${API_URL}/${id}/like`,
            {},
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error liking news:", error);
        throw error;
    }
};

/**
 * Add comment to news
 * @param {string} id - News ID
 * @param {string} content - Comment content
 * @returns {Promise} Updated news with new comment
 */
export const addComment = async (id, content) => {
    try {
        const response = await axios.post(
            `${API_URL}/${id}/comment`,
            { content },
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
};

const newsService = {
    getNews,
    getFeaturedNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    likeNews,
    addComment,
};

export default newsService;
