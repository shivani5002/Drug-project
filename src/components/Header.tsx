import React from 'react';
import { Menu, X, Brain, FlaskRound as Flask, ScrollText } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-semibold text-gray-800">GenAI Medical</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
            <a href="#tools" className="text-gray-600 hover:text-blue-600 transition-colors">Tools</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <a href="#features" className="block py-2 text-gray-600">Features</a>
            <a href="#about" className="block py-2 text-gray-600">About</a>
            <a href="#tools" className="block py-2 text-gray-600">Tools</a>
            <a href="#contact" className="block py-2 text-gray-600">Contact</a>
            <button className="mt-4 w-full bg-blue-600 text-white px-6 py-2 rounded-full">
              Get Started
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;