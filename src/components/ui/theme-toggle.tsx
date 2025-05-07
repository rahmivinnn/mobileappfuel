
import React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as "light" | "dark" | "system");
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme activated`,
      description: `The application theme has been set to ${newTheme}`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-8 h-8 flex items-center justify-center p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-yellow-500" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-green-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="animate-fade-in bg-card border-border">
        <DropdownMenuItem
          onClick={() => handleThemeChange("light")}
          className="cursor-pointer group flex items-center gap-2 hover:bg-muted/50"
        >
          <Sun className="h-4 w-4 text-yellow-500 group-hover:rotate-90 transition-transform duration-300" />
          <span className="group-hover:text-yellow-500 transition-colors">Light</span>
          {theme === 'light' && <span className="h-2 w-2 rounded-full bg-yellow-500 ml-auto"></span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("dark")}
          className="cursor-pointer group flex items-center gap-2 hover:bg-muted/50"
        >
          <Moon className="h-4 w-4 text-green-500 group-hover:rotate-12 transition-transform duration-300" />
          <span className="group-hover:text-green-500 transition-colors">Dark</span>
          {theme === 'dark' && <span className="h-2 w-2 rounded-full bg-green-500 ml-auto"></span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("system")}
          className="cursor-pointer group flex items-center gap-2 hover:bg-muted/50"
        >
          <Laptop className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
          <span className="group-hover:text-blue-500 transition-colors">System</span>
          {theme === 'system' && <span className="h-2 w-2 rounded-full bg-blue-500 ml-auto"></span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
