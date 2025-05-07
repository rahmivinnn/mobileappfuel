
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
          className="rounded-full w-7 h-7 flex items-center justify-center p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group ThemeToggle"
        >
          <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-yellow-500" />
          <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-green-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="animate-fade-in bg-card border-border py-1 px-1 min-w-[100px]">
        <DropdownMenuItem
          onClick={() => handleThemeChange("light")}
          className="cursor-pointer group flex items-center gap-1.5 hover:bg-muted/50 py-1 px-2"
        >
          <Sun className="h-3 w-3 text-yellow-500 group-hover:rotate-90 transition-transform duration-300" />
          <span className="group-hover:text-yellow-500 transition-colors text-[10px]">Light</span>
          {theme === 'light' && <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 ml-auto"></span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("dark")}
          className="cursor-pointer group flex items-center gap-1.5 hover:bg-muted/50 py-1 px-2"
        >
          <Moon className="h-3 w-3 text-green-500 group-hover:rotate-12 transition-transform duration-300" />
          <span className="group-hover:text-green-500 transition-colors text-[10px]">Dark</span>
          {theme === 'dark' && <span className="h-1.5 w-1.5 rounded-full bg-green-500 ml-auto"></span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("system")}
          className="cursor-pointer group flex items-center gap-1.5 hover:bg-muted/50 py-1 px-2"
        >
          <Laptop className="h-3 w-3 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
          <span className="group-hover:text-blue-500 transition-colors text-[10px]">System</span>
          {theme === 'system' && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 ml-auto"></span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
