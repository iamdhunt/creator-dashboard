import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("auth", "routes/auth/layout.tsx", [
    route("login", "routes/auth/login.tsx"),
    route("signup", "routes/auth/signup.tsx"),
    route("forgot-password", "routes/auth/forgot-password.tsx"),
    route("reset-password", "routes/auth/reset-password.tsx"),
    route("/auth/google/callback", "routes/auth/google/callback.tsx"),
  ]),

  route("dashboard", "routes/dashboard/layout.tsx", [
    index("routes/dashboard/home.tsx"),
    route("content", "routes/dashboard/content.tsx"),
    route("settings", "routes/dashboard/settings.tsx"),
  ]),
] satisfies RouteConfig;
