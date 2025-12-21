import { Link } from "react-router";

export function Welcome() {
  return (
    <div className="">
      <main className="flex items-center justify-center pt-16 pb-4 max-w-3xl mx-auto">
        <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
          <header className="flex flex-col items-center gap-9">
            <div className="p-4 text-white text-center space-y-6">
              <div className="text-2xl">
                Synqlo is a unified analytics dashboard for creators. We bring
                your key stats together, highlight what actually matters, and
                help you make smarter content decisions.
              </div>
            </div>
          </header>
          <div className="space-y-6">
            <div className="flex flex-row gap-6 items-center">
              <Link
                to="/auth/signup"
                className="px-12 py-4 bg-accent text-lg uppercase text-white font-bold rounded-md flex-1 text-center"
              >
                Signup
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
