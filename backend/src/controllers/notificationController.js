import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Get notifications for current user (or admin)
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;
    const role = req.user?.role || "user";

    const audienceFilter = ["both", role === "admin" ? "admin" : "user"];

    const filter = {
      $or: [
        { user: userId },
        { user: null, audience: { $in: audienceFilter } },
      ],
    };

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("getMyNotifications error", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể lấy thông báo" });
  }
};

// Simple in-memory SSE subscriber registry
const subscribers = {
  users: new Map(), // userId -> Set(res)
  admins: new Set(), // Set(res)
  guests: new Set(),
};

const sendSSE = (res, data, event = "notification") => {
  try {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  } catch (err) {
    // ignore write errors
    console.error("SSE write error", err);
  }
};

// Subscribe endpoint for SSE. Accepts token in query `token` or Authorization header.
export const subscribe = async (req, res) => {
  // set headers for SSE
  res.set({
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });
  res.flushHeaders?.();

  // determine user from token (query param or header)
  let token = req.query.token;
  if (!token) {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer ")) token = auth.split(" ")[1];
  }

  let user = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findById(decoded.id).select("-password");
    } catch (err) {
      console.error("SSE token error", err);
    }
  }

  // register subscriber
  if (user && user.role === "admin") {
    subscribers.admins.add(res);
  } else if (user && user._id) {
    const id = String(user._id);
    if (!subscribers.users.has(id)) subscribers.users.set(id, new Set());
    subscribers.users.get(id).add(res);
  } else {
    subscribers.guests.add(res);
  }

  // send initial ping
  sendSSE(res, { message: "connected" }, "connected");

  // heartbeat to keep connection alive
  const keepAlive = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch (err) {
      // ignore
    }
  }, 25000);

  // cleanup on close
  req.on("close", () => {
    clearInterval(keepAlive);
    if (user && user.role === "admin") {
      subscribers.admins.delete(res);
    } else if (user && user._id) {
      const id = String(user._id);
      const set = subscribers.users.get(id);
      if (set) {
        set.delete(res);
        if (set.size === 0) subscribers.users.delete(id);
      }
    } else {
      subscribers.guests.delete(res);
    }
  });
};

// Mark one or many notifications as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { ids } = req.body; // array of notification IDs

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Danh sách thông báo không hợp lệ" });
    }

    await Notification.updateMany(
      {
        _id: { $in: ids },
        $or: [{ user: userId }, { user: null }],
      },
      { $set: { read: true } }
    );

    return res
      .status(200)
      .json({ success: true, message: "Đã cập nhật trạng thái thông báo" });
  } catch (error) {
    console.error("markAsRead error", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể cập nhật thông báo" });
  }
};

// Delete one or many notifications of current user
export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { ids } = req.body; // array of notification IDs

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Danh sách thông báo không hợp lệ" });
    }

    await Notification.deleteMany({
      _id: { $in: ids },
      $or: [{ user: userId }, { user: null }],
    });

    return res.status(200).json({ success: true, message: "Đã xóa thông báo" });
  } catch (error) {
    console.error("deleteNotifications error", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể xóa thông báo" });
  }
};

// Helper để các controller khác có thể tạo thông báo một cách an toàn
export const createNotification = async (payload) => {
  try {
    const notification = await Notification.create(payload);
    // Broadcast to SSE subscribers
    try {
      const notifData = notification.toObject
        ? notification.toObject()
        : notification;

      // send to specific user connections
      if (notifData.user) {
        const id = String(notifData.user);
        const set = subscribers.users.get(id);
        if (set) {
          for (const res of set) sendSSE(res, notifData);
        }
      }

      // audience-based broadcasts
      if (!notifData.user) {
        if (notifData.audience === "admin" || notifData.audience === "both") {
          for (const res of subscribers.admins) sendSSE(res, notifData);
        }
        if (notifData.audience === "user" || notifData.audience === "both") {
          for (const [, set] of subscribers.users) {
            for (const res of set) sendSSE(res, notifData);
          }
        }
      }
    } catch (err) {
      console.error("Error broadcasting notification", err);
    }

    return notification;
  } catch (error) {
    console.error("createNotification error", error);
    // Không throw để tránh làm hỏng flow chính của business logic
    return null;
  }
};

export default {
  getMyNotifications,
  markAsRead,
  deleteNotifications,
  createNotification,
};
