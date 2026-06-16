import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { createSecretKey } from "crypto";
import env from "../../env.ts";

export interface JwtPayload extends JWTPayload {
  id: string;
  email: string;
  username: string;
  role: "user" | "admin";
}

export const generateToken = (payload: JwtPayload): Promise<string> => {
  const secret = env.ACCESS_TOKEN_SECRET;
  const secretKey = createSecretKey(secret, "utf-8");

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey);
};

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const secretKey = createSecretKey(env.ACCESS_TOKEN_SECRET, "utf-8");
  const { payload } = await jwtVerify(token, secretKey);

  return {
    id: payload.id as string,
    email: payload.email as string,
    username: payload.username as string,
    role: payload.role as "user" | "admin",
  };
};

export const generateRefreshToken = (
  payload: Pick<JwtPayload, "id" | "role">,
): Promise<string> => {
  const secret = env.REFRESH_TOKEN_SECRET;
  const secretKey = createSecretKey(secret, "utf-8");

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secretKey);
};

export const verifyRefreshToken = async (
  token: string,
): Promise<Pick<JwtPayload, "id" | "role">> => {
  const secretKey = createSecretKey(env.REFRESH_TOKEN_SECRET, "utf-8");
  const { payload } = await jwtVerify(token, secretKey);

  return {
    id: payload.id as string,
    role: payload.role as "user" | "admin",
  };
};
