import { Link } from "wouter";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="glass-card w-full max-w-md mx-4 p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Page Not Found</h1>
          <p className="text-white/60 text-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
            <button 
              className="glass-button mt-4 px-6 py-3 flex items-center gap-2 text-white font-medium hover:bg-white/15 transition-all duration-200"
              data-testid="button-go-home"
            >
              <Home className="h-4 w-4" />
              Go Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
