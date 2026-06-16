import { useCallback, useEffect, useMemo, useState } from "react";
import { recipeLikeService } from "../services/recipeLikeService";

const LIKES_CHANGED_EVENT = "recipe-likes-changed";

const getCurrentUserId = () => {
  try {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      return user?._id || user?.id || "mock-user";
    }
  } catch {
    // fallback
  }
  return localStorage.getItem("user_id") || "mock-user";
};

export const useRecipeLikeState = (meal, options = {}) => {
  const recipeId = useMemo(
    () => meal?.id ?? meal?._id ?? meal?.recipe_id ?? meal?.uniqueKey ?? null,
    [meal]
  );
  const userId = useMemo(() => getCurrentUserId(), []);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(options.initialLikesCount ?? 0);
  const [isLoading, setIsLoading] = useState(false);

  const syncStatus = useCallback(async () => {
    if (!recipeId) return;
    setIsLoading(true);
    try {
      const status = await recipeLikeService.getLikeStatus({ userId, recipeId });
      setIsLiked(Boolean(status.liked));
      setLikesCount(Number(status.likesCount) || 0);
    } catch (error) {
      console.error("Error loading recipe like status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [recipeId, userId]);

  const toggleLike = useCallback(async () => {
    if (!recipeId || isLoading) return null;
    setIsLoading(true);
    try {
      const next = await recipeLikeService.toggleLike({ userId, recipeId });
      const nextLiked = Boolean(next.liked);
      const nextCount = Number(next.likesCount) || 0;

      setIsLiked(nextLiked);
      setLikesCount(nextCount);
      window.dispatchEvent(
        new CustomEvent(LIKES_CHANGED_EVENT, {
          detail: { recipeId, isLiked: nextLiked, likesCount: nextCount },
        })
      );
      return { isLiked: nextLiked, likesCount: nextCount };
    } catch (error) {
      console.error("Error toggling recipe like:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [recipeId, userId, isLoading]);

  useEffect(() => {
    syncStatus();
  }, [syncStatus]);

  useEffect(() => {
    const handleLikesChanged = (event) => {
      if (event.detail?.recipeId === recipeId) {
        setIsLiked(Boolean(event.detail?.isLiked));
        setLikesCount(Number(event.detail?.likesCount) || 0);
      }
    };

    window.addEventListener(LIKES_CHANGED_EVENT, handleLikesChanged);
    return () => {
      window.removeEventListener(LIKES_CHANGED_EVENT, handleLikesChanged);
    };
  }, [recipeId]);

  return { recipeId, isLiked, likesCount, isLoading, toggleLike };
};
