import { redirect } from "react-router";
import type { Route } from "./+types/index";

export async function loader({ request }: Route.LoaderArgs) {
  return redirect("/dashboard");
}

export default function YoutubeIndex() {
  return null;
}
