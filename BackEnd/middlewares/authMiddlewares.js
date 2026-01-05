const jwt = require('jsonwebtoken')
const TokenBlackListedModel = require('../models/tokenBlackListed')
const UserModel = require('../models/userModel')

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1]
      const refreshToken = req.headers["refresh-token"]

      if (!accessToken) {
        return res.status(401).json({ message: "Access token missing" })
      }

      const isBlacklisted = await TokenBlackListedModel.exists({ token: accessToken })
      if (isBlacklisted) {
        return res.status(401).json({ message: "Token blacklisted, login again" })
      }

      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)

        if (roles.length && !roles.includes(decoded.role)) {
          return res.status(403).json({ message: "Forbidden: You do not have permission to modify this resource." })
        }

        const user = await UserModel.findById(decoded.userId)
        if (!user) {
          return res.status(401).json({ message: "User no longer exists" })
        }

        req.user = {
          id: decoded.userId,
          role: decoded.role
        }

        return next()
      } catch (err) {
        if (err.name !== "TokenExpiredError") {
          return res.status(401).json({ message: "Invalid token" })
        }
      }

      // 🔄 Access token expired → use refresh token
      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token missing" })
      }

      const refreshBlacklisted = await TokenBlackListedModel.exists({ token: refreshToken })
      if (refreshBlacklisted) {
        return res.status(401).json({ message: "Refresh token invalid" })
      }

      const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_SECRET)

      if (roles.length && !roles.includes(refreshDecoded.role)) {
        return res.status(403).json({ message: "Forbidden" })
      }

      const user = await UserModel.findById(refreshDecoded.userId)
      if (!user) {
        return res.status(401).json({ message: "User no longer exists" })
      }

      const newAccessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      )

      res.setHeader("x-new-access-token", newAccessToken)

      req.user = {
        id: user._id,
        role: user.role
      }

      next()
    } catch (error) {
      return res.status(401).json({ message: "Authentication failed" })
    }
  }
}

module.exports = authMiddleware