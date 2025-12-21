import { Form, Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface HeaderProps {
  userId?: string | null;
}

export default function Header({ userId }: HeaderProps) {
  return (
    <header className="relative flex flex-row items-center justify-center py-10">
      <div className="text-5xl font-display">
        <Link to="/">Synqlo</Link>
      </div>
      <div className="block absolute right-2 transition-all duration-500 ease-out transform hover:-translate-y-3">
        {userId ? (
          <Form method="post">
            <button
              type="submit"
              className="px-6 py-2 text-sm uppercase font-bold text-text-inverse text-center hover:cursor-pointer"
            >
              <FontAwesomeIcon
                icon={["fas", "right-from-bracket"]}
                className="mr-2 font-bold"
              />
              Sign Out
            </button>
          </Form>
        ) : (
          <Link
            to="/auth/login"
            className="px-6 py-2 text-sm uppercase font-bold text-text-inverse text-center"
          >
            <FontAwesomeIcon
              icon={["far", "user"]}
              className="mr-2 font-bold"
            />
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
