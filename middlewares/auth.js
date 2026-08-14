import jwt from "jsonwebtoken";

const protectedApi = async (req, res, next) => {
  try {
    let token;

    // Expect header: Authorization: Bearer <token>
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user info to request for use in controllers
    req.user = decoded; // e.g. { id: userId, ... }

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Not authorized, token invalid or expired" });
  }
};
export { protectedApi };
