import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="flex flex-row uppercase gap-4 items-center justify-center py-8 mt-20">
      <Link
        to="/faqs"
        className="text-sm text-center hover:font-bold transition-all duration-500 ease-out transform hover:-translate-y-1.5"
      >
        FAQs
      </Link>{" "}
      /
      <Link
        to="/privacy-policy"
        className="text-sm text-center hover:font-bold transition-all duration-500 ease-out transform hover:-translate-y-1.5"
      >
        Privacy Policy
      </Link>{" "}
      /
      <Link
        to="/terms-of-service"
        className="text-sm text-center hover:font-bold transition-all duration-500 ease-out transform hover:-translate-y-1.5"
      >
        Terms of Service
      </Link>
    </footer>
  );
}
