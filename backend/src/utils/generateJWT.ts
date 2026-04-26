import jwt from "jsonwebtoken";

export const generateToken = (userId: string, userTypeId: number): string => {
  return jwt.sign({ userId, userTypeId }, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });
};
