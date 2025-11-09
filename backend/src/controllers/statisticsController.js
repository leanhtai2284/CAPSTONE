import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import mongoose from "mongoose";

// @desc    Get comprehensive statistics
// @route   GET /api/admin/statistics
// @access  Private/Admin
export const getStatistics = async (req, res) => {
  try {
    // Overall stats
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalRegularUsers = await User.countDocuments({ role: "user" });

    // Time-based stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const newUsersLast7Days = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });
    const newRecipesLast30Days = await Recipe.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const newRecipesLast7Days = await Recipe.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Recipe statistics by category
    const recipesByCategory = await Recipe.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recipe statistics by region
    const recipesByRegion = await Recipe.aggregate([
      {
        $group: {
          _id: "$region",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recipe statistics by difficulty
    const recipesByDifficulty = await Recipe.aggregate([
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // User registration trends (last 30 days, daily)
    const userTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recipe creation trends (last 30 days, daily)
    const recipeTrends = await Recipe.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top recipes by calories (average)
    const avgCaloriesByCategory = await Recipe.aggregate([
      {
        $match: {
          "nutrition.calories": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$category",
          avgCalories: { $avg: "$nutrition.calories" },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgCalories: -1 } },
    ]);

    // User registration by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const userRegistrationByMonth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recipe creation by month (last 12 months)
    const recipeCreationByMonth = await Recipe.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalRecipes,
          totalAdmins,
          totalRegularUsers,
          newUsersLast30Days,
          newUsersLast7Days,
          newRecipesLast30Days,
          newRecipesLast7Days,
        },
        recipes: {
          byCategory: recipesByCategory,
          byRegion: recipesByRegion,
          byDifficulty: recipesByDifficulty,
          avgCaloriesByCategory,
        },
        trends: {
          userRegistration: userTrends,
          recipeCreation: recipeTrends,
          userRegistrationByMonth,
          recipeCreationByMonth,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê",
      error: error.message,
    });
  }
};

// @desc    Get recipe statistics
// @route   GET /api/admin/statistics/recipes
// @access  Private/Admin
export const getRecipeStatistics = async (req, res) => {
  try {
    const totalRecipes = await Recipe.countDocuments();
    
    const recipesByCategory = await Recipe.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const recipesByRegion = await Recipe.aggregate([
      {
        $group: {
          _id: "$region",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const recipesByDifficulty = await Recipe.aggregate([
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRecipes,
        byCategory: recipesByCategory,
        byRegion: recipesByRegion,
        byDifficulty: recipesByDifficulty,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê công thức",
      error: error.message,
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/statistics/users
// @access  Private/Admin
export const getUserStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalRegularUsers = await User.countDocuments({ role: "user" });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const userRegistrationByMonth = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalRegularUsers,
        recentUsers,
        registrationByMonth: userRegistrationByMonth.reverse(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê người dùng",
      error: error.message,
    });
  }
};

