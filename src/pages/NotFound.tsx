
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "@/components/ui/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NotFound = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-background' : 'bg-gray-100'}`}>
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="text-center">
        <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>404</h1>
        <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Oops! Page not found</p>
        <a href="/" className="text-green-500 hover:text-green-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
