import { Link } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-800 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="white" fillOpacity="0.15" />
              <path d="M8 24V12l8-6 8 6v12H20v-7h-4v7H8z" fill="white" />
            </svg>
            <span className="text-xl font-bold tracking-tight">VBP Estimator</span>
          </Link>
          <span className="text-blue-200 text-sm font-medium ml-1">Bid Document Portal</span>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t bg-white text-center text-xs text-gray-400 py-3">
        VorkBrothers Painting &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
