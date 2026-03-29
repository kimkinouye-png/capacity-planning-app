import { Outlet, Link, useLocation } from "react-router";
import { LayoutGrid, Users, HelpCircle, Settings as SettingsIcon, Sun, Moon, Menu, X, Calculator } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export function Layout() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const navItems = [
    { path: "/", label: "Get Started", icon: LayoutGrid },
    { path: "/scenarios", label: "Plans", icon: Users },
    { path: "/calculator", label: "Calculator", icon: Calculator },
    { path: "/help", label: "Help", icon: HelpCircle },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      {/* Mobile Top Bar */}
      <div className="md:hidden border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Capacity Planner
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="px-4 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-cyan-500 text-white"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Mobile Theme Toggle */}
            <Button
              variant="outline"
              className="w-full justify-start mt-2"
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark Mode
                </>
              )}
            </Button>
          </nav>
        )}
      </div>

      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Capacity Planner
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Plan smarter, deliver better</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-cyan-500 text-white"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setIsDark(!isDark)}
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4 mr-2" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-2" />
                Dark Mode
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}