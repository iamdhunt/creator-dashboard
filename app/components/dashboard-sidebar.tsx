import { NavLink, useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faYoutube,
  faInstagram,
  faTiktok,
  faTwitter,
  faFacebook,
  faTwitch,
} from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

interface Account {
  id: string;
  platform: string;
  username: string | null;
}

interface DashboardSidebarProps {
  accounts?: Account[];
}

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "youtube":
      return faYoutube;
    case "instagram":
      return faInstagram;
    case "tiktok":
      return faTiktok;
    case "twitter":
    case "x":
      return faTwitter;
    case "facebook":
      return faFacebook;
    case "twitch":
      return faTwitch;
    default:
      return faGlobe;
  }
};

export default function DashboardSidebar({
  accounts = [],
}: DashboardSidebarProps) {
  const location = useLocation();

  const isAnyAccountActive = accounts.some((account) =>
    location.pathname.startsWith(
      `/dashboard/${account.platform}/${account.username}`
    )
  );

  return (
    <div className="py-2 pl-8 w-64 h-full relative">
      <aside className="bg-surface shadow-md rounded-xl fixed w-56 min-h-1/4">
        <nav className="my-6 p-4 space-y-2 flex flex-col gap-3">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `block px-4 uppercase font-bold text-xl opacity-75 transition-all ${
                isActive
                  ? "opacity-100 border-l-6 border-l-text-inverse"
                  : "hover:opacity-100 hover:border-l-6 hover:border-l-text-inverse"
              }`
            }
          >
            Overview
          </NavLink>

          <div className="group">
            {accounts.length > 0 && (
              <div
                className={`block px-4 py-1 uppercase font-bold text-lg opacity-75 transition-all mb-2 group-hover:opacity-100 hover:cursor-default ${
                  isAnyAccountActive ? "opacity-100" : ""
                }`}
              >
                <div>Accounts</div>
              </div>
            )}
            {accounts.length > 0 && (
              <div className="space-y-1">
                {accounts.map((account) => (
                  <NavLink
                    key={account.id}
                    to={`/dashboard/${account.platform}/${account.username}`}
                    className={({ isActive }) =>
                      `flex px-4 uppercase text-sm font-bold opacity-75 transition-all ${
                        isActive
                          ? "opacity-100 border-l-6 border-l-text-inverse"
                          : "hover:opacity-100 hover:border-l-6 hover:border-l-text-inverse"
                      }`
                    }
                  >
                    <div className="w-6 justify-center mr-1">
                      <FontAwesomeIcon
                        icon={getPlatformIcon(account.platform)}
                      />
                    </div>
                    <div className="truncate">
                      @{account.username || account.platform}
                    </div>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `block px-4 uppercase font-bold text-xl opacity-75 transition-all ${
                isActive
                  ? "opacity-100 border-l-6 border-l-text-inverse"
                  : "hover:opacity-100 hover:border-l-6 hover:border-l-text-inverse"
              }`
            }
          >
            Settings
          </NavLink>
        </nav>
      </aside>
    </div>
  );
}
