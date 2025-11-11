"use client";

import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onLogoClick: () => void;
  onNavigate: (page: 'home' | 'about' | 'cars' | 'contact') => void;
}

export function Header({ cartCount, onCartClick, onLogoClick, onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 cursor-pointer" 
          onClick={onLogoClick}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Zion Car Rentals</h1>
            <p className="text-sm text-muted-foreground">Luxury Cars, Seamless Booking</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => onNavigate('home')} 
            className="text-foreground hover:text-primary transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('cars')} 
            className="text-foreground hover:text-primary transition-colors"
          >
            Cars
          </button>
          <button 
            onClick={() => onNavigate('about')} 
            className="text-foreground hover:text-primary transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => onNavigate('contact')} 
            className="text-foreground hover:text-primary transition-colors"
          >
            Contact
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="relative"
            onClick={onCartClick}
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <button 
              onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} 
              className="text-foreground hover:text-primary transition-colors text-left"
            >
              Home
            </button>
            <button 
              onClick={() => { onNavigate('cars'); setIsMenuOpen(false); }} 
              className="text-foreground hover:text-primary transition-colors text-left"
            >
              Cars
            </button>
            <button 
              onClick={() => { onNavigate('about'); setIsMenuOpen(false); }} 
              className="text-foreground hover:text-primary transition-colors text-left"
            >
              About
            </button>
            <button 
              onClick={() => { onNavigate('contact'); setIsMenuOpen(false); }} 
              className="text-foreground hover:text-primary transition-colors text-left"
            >
              Contact
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}