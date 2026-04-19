import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import { AuthModel } from "./auth.interface";
import { User } from "../user/user.model";
import { JwtHalers } from "../../../utils/jwt.helper";
import config from "../../../config";
import ApiError from "../../../errors/api_error";
import { IUser } from "../user/user.interface";

const login = async (payload: AuthModel) => {
  const { email: userEmail, password } = payload;
  const isExistUser = await User.findOne({ email: userEmail });
  if (!isExistUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }
  const match = await bcrypt.compare(password, isExistUser.password);
  if (!match) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password is not valid!");
  }
  const { email, role, subscriptionType, name, postsCount } = isExistUser;
  const accessToken = JwtHalers.createToken(
    { email, role, subscriptionType, name, postsCount },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );
  const refreshToken = JwtHalers.createToken(
    { email, role, subscriptionType, name, postsCount },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );
  return {
    accessToken,
    refreshToken,
  };
};

const register = async (payload: IUser) => {
  const { email: userEmail } = payload;
  const isExistUser = await User.findOne({ email: userEmail });
  if (isExistUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User already exist!");
  }
  const result = await User.create(payload);
  const { email, role, subscriptionType, name, postsCount } = result;
  const accessToken = JwtHalers.createToken(
    { email, role, subscriptionType, name, postsCount },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );
  const refreshToken = JwtHalers.createToken(
    { email, role, subscriptionType, name, postsCount },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );
  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let verifiedToken = null;
  try {
    verifiedToken = JwtHalers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    );
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, "Invalid refresh token");
  }

  const { email: userEmail } = verifiedToken;
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }
  const { email, role, subscriptionType, name, postsCount } = user;
  const newAccessToken = JwtHalers.createToken(
    { email, role, subscriptionType, name, postsCount },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );
  return {
    accessToken: newAccessToken,
  };
};

export const AuthService = {
  login,
  register,
  refreshToken,
};
