const MOCK_DB_KEY = "mock_recipe_likes_v1";

const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const createId = () =>
  `like_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const readLikesFromStorage = () => {
  try {
    const raw = localStorage.getItem(MOCK_DB_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLikesToStorage = (likes) => {
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(likes));
};

const mockRecipeLikeApi = {
  async getLikeStatus({ userId, recipeId }) {
    await wait();
    const likes = readLikesFromStorage();
    const liked = likes.some(
      (record) => record.user_id === userId && record.recipe_id === recipeId
    );
    const likesCount = likes.filter(
      (record) => record.recipe_id === recipeId
    ).length;

    return { liked, likesCount };
  },

  async toggleLike({ userId, recipeId }) {
    await wait();
    const likes = readLikesFromStorage();
    const existingIndex = likes.findIndex(
      (record) => record.user_id === userId && record.recipe_id === recipeId
    );

    let liked;
    if (existingIndex >= 0) {
      likes.splice(existingIndex, 1);
      liked = false;
    } else {
      likes.push({
        _id: createId(),
        user_id: userId,
        recipe_id: recipeId,
        created_at: new Date().toISOString(),
      });
      liked = true;
    }

    writeLikesToStorage(likes);

    const likesCount = likes.filter(
      (record) => record.recipe_id === recipeId
    ).length;

    return { liked, likesCount };
  },
};

let recipeLikeApi = mockRecipeLikeApi;

export const setRecipeLikeApi = (apiImplementation) => {
  recipeLikeApi = apiImplementation || mockRecipeLikeApi;
};

export const recipeLikeService = {
  async getLikeStatus({ userId, recipeId }) {
    if (!userId || !recipeId) {
      return { liked: false, likesCount: 0 };
    }
    return recipeLikeApi.getLikeStatus({ userId, recipeId });
  },

  async toggleLike({ userId, recipeId }) {
    if (!userId || !recipeId) {
      throw new Error("Thiếu userId hoặc recipeId để toggle like");
    }
    return recipeLikeApi.toggleLike({ userId, recipeId });
  },
};
