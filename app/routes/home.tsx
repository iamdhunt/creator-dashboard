import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { redirectIfLoggedIn } from "~/server/auth.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Synqlo — Cross-Platform Creator Analytics Dashboard" },
    {
      name: "description",
      content:
        "Track, compare, and understand your creator performance across platforms with Synqlo’s unified analytics dashboard. Clear insights. Smarter growth.",
    },
    { name: "robots", content: "index, follow" },

    // Open Graph
    {
      property: "og:title",
      content: "Synqlo — Cross-Platform Creator Analytics Dashboard",
    },
    {
      property: "og:description",
      content:
        "Track, compare, and understand your creator performance across platforms with Synqlo’s unified analytics dashboard.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://synqlo.io" },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: "Synqlo — Cross-Platform Creator Analytics Dashboard",
    },
    {
      name: "twitter:description",
      content:
        "All your creator stats in one place. Platform-agnostic analytics built for modern creators.",
    },
    { name: "application-name", content: "Synqlo" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  await redirectIfLoggedIn(request);
  return null;
}

export default function Home() {
  return <Welcome />;
}
