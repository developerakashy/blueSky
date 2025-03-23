import { createBrowserRouter } from "react-router-dom";
import Profile from "./pages/Profile";
import FollowingsAndFollowers from "./pages/Following";
import PostView from "./pages/PostView";
import Notification from "./pages/Notification";
import Chats from "./pages/Chats";
import ChatMessages from "./pages/ChatMessages";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Bookmark from "./pages/Bookmark";
import Explore from "./pages/Explore";


const router = createBrowserRouter([
    {
    path: "/",
    element: <Layout/>,
    children: [
      { index: true, element: <Home /> },
      { path: "user/:username", element: <Profile /> },
      { path: "user/:username/replies", element: <Profile /> },
      { path: "user/:username/likes", element: <Profile /> },
      { path: "user/:username/followers", element: <FollowingsAndFollowers /> },
      { path: "user/:username/followings", element: <FollowingsAndFollowers /> },
      { path: "post/:postId", element: <PostView /> },
      { path: "notifications", element: <Notification /> },
      { path: "chat", element: <Chats /> },
      { path: "chat/messages/:chatId", element: <ChatMessages /> },
      { path: "bookmarks", element: <Bookmark /> },
      { path: "explore", element: <Explore /> },
      { path: "*", element: <p className="h-screen text-center pt-12 font-semibold text-red-500">Page not found</p> }
    ],
  },
  {
    path: "/auth",
    children: [
      { path: "registration", element: <Registration /> },
      { path: "login", element: <Login /> },
    ],
  },
]);

export default router;
