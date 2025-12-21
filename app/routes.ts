import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

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

    route("youtube", "routes/dashboard/youtube/layout.tsx", [
      index("routes/dashboard/youtube/index.tsx"),
      route(":handle", "routes/dashboard/youtube/channel.tsx", [
        index("routes/dashboard/youtube/overview.tsx"),
        route("shorts", "routes/dashboard/youtube/shorts.tsx"),
      ]),
    ]),
  ]),

  route("privacy-policy", "routes/privacy-policy.tsx"),
  route("terms-of-service", "routes/terms-of-service.tsx"),
  route("faqs", "routes/faqs.tsx"),
] satisfies RouteConfig;
