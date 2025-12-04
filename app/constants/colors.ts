export const PLATFORM_COLORS: Record<string, string> = {
  youtube: "#FF0000",
  twitter: "#1DA1F2",
  instagram: "#E1306C",
  tiktok: "#000000",
  twitch: "#9146FF",
  linkedin: "#0A66C2",
  default: "#9CA3AF",
};

export const getPlatformColor = (platform: string) => {
  return PLATFORM_COLORS[platform.toLowerCase()] || PLATFORM_COLORS.default;
};
