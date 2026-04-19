import { z } from "zod";

const register = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }),
    name: z.string({ required_error: "Name is required" }),
    password: z.string({ required_error: "Password is required" }),
  }),
});

const login = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }),
    password: z.string({ required_error: "Password is required" }),
  }),
});

export const UserValidator = {
  register,
  login,
};
