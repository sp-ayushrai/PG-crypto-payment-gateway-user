import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Zap, Shield, TrendingUp } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    // {
    //   to: '/',
    //   label: 'Dashboard',
    //   icon: <TrendingUp className="w-4 h-4" />,
    //   description: 'Overview & Analytics'
    // },
    {
      to: "/",
      label: "Payment Interface",
      icon: <Zap className="w-4 h-4" />,
      description: "Process Transactions",
    },
    // {
    //   to: '/admin',
    //   label: 'Admin Panel',
    //   icon: <Shield className="w-4 h-4" />,
    //   description: 'System Management'
    // }
  ];

  return (
    <header className="relative bg-white backdrop-blur-lg border-b border-slate-200/50">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-blue-50 animate-pulse"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 group">
            <div className="">
              <img src="./logo.png" alt="Logo" className="h-10 md:h-12" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group relative px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 transition-all duration-300 hover:bg-slate-100/70 backdrop-blur-sm"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500 group-hover:text-blue-600 transition-colors duration-300">
                    {item.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors duration-300">
                      {item.description}
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-xl bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100/70 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="w-6 h-6 relative">
                <Menu
                  className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                    isMenuOpen ? "opacity-0 rotate-180" : "opacity-100 rotate-0"
                  }`}
                />
                <X
                  className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                    isMenuOpen
                      ? "opacity-100 rotate-0"
                      : "opacity-0 -rotate-180"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-96 opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-4"
          } overflow-hidden`}
        >
          <nav className="py-4 space-y-2">
            {navItems.map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-800 transition-all duration-300 hover:bg-slate-100/70 backdrop-blur-sm transform ${
                  isMenuOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-4 opacity-0"
                }`}
                style={{
                  transitionDelay: isMenuOpen ? `${index * 100}ms` : "0ms",
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-all duration-300">
                  <span className="text-blue-500 group-hover:text-blue-600 transition-colors duration-300">
                    {item.icon}
                  </span>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-base font-medium">{item.label}</span>
                  <span className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors duration-300">
                    {item.description}
                  </span>
                </div>
                <div className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-blue-300"></div>
    </header>
  );
};

export default Header;
