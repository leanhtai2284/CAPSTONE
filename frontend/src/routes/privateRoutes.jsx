import SavedMenusPage from "../pages/SavedMenusPage";
import ProfilePage from "../pages/ProfilePage";
import ReportsPage from "../pages/ReportsPage";
import HelpFeedback from "../pages/HelpFeedback";
import SearchPage from "../pages/SearchPage";
import ForYouPage from "../pages/ForYouPage";
import React from "react";

export const privateRoutes = [
  { path: "/foryou", element: <ForYouPage /> },
  { path: "/saved-menus", element: <SavedMenusPage /> },
  { path: "/profile", element: <ProfilePage /> },
  { path: "/nutrition-report", element: <ReportsPage /> },
  { path: "/help", element: <HelpFeedback /> },
  { path: "/search", element: <SearchPage /> },
];
