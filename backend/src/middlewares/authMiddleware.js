import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes - verify JWT and attach user to req
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // decoded contains id and maybe role
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }
      
      // Update user online status if they're not banned and haven't been seen recently
      if (!user.isBanned) {
        const fifteenSecondsAgo = new Date(Date.now() - 15 * 1000);
        const lastSeen = user.lastLogin || user.createdAt;
        
        // Only update if user hasn't been seen in the last 15 seconds
        if (!lastSeen || new Date(lastSeen) < fifteenSecondsAgo) {
          await User.findByIdAndUpdate(user._id, { 
            isOnline: true,
            lastLogin: new Date()
          });
          user.isOnline = true;
          user.lastLogin = new Date();
        }
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }
};

// Authorize specific roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập, chỉ dành cho admin'
    });
  }
};

export default { protect, authorizeRoles, admin };
