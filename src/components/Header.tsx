// import React from 'react';
// import { Menu, X, Brain, User, LogOut } from 'lucide-react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from './AuthContext';

// const Header = () => {
//   const [isMenuOpen, setIsMenuOpen] = React.useState(false);
//   const { user, signOut } = useAuth();
//   const navigate = useNavigate();

//   // Function to handle anchor link navigation
//   const handleAnchorLink = (hash: string) => {
//     setIsMenuOpen(false);
  
//     if (window.location.pathname === '/') {
//       // If we're already on home page, just scroll
//       const element = document.querySelector(hash);
//       if (element) {
//         element.scrollIntoView({ behavior: 'smooth' });
//       }
//     } else {
//       // If we're on another page, go home then scroll
//       navigate('/');
//       setTimeout(() => {
//         const element = document.querySelector(hash);
//         if (element) {
//           element.scrollIntoView({ behavior: 'smooth' });
//         }
//       }, 100);
//     }
//   };

//   return (
//     <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
//       <nav className="container mx-auto px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center">
//             <Brain className="h-8 w-8 text-blue-600" />
//             <Link to="/" className="ml-2 text-xl font-semibold text-gray-800">
//               GenAI Medical
//             </Link>
//           </div>
          
//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-8">
//             <button onClick={() => handleAnchorLink('#')} className="text-gray-600 hover:text-blue-600 transition-colors">
//               Home
//             </button>
//             <button onClick={() => handleAnchorLink('#features')} className="text-gray-600 hover:text-blue-600 transition-colors">
//               Features
//             </button>
//             <button onClick={() => handleAnchorLink('#about')} className="text-gray-600 hover:text-blue-600 transition-colors">
//               About
//             </button>
//             <button onClick={() => handleAnchorLink('#tools')} className="text-gray-600 hover:text-blue-600 transition-colors">
//               Tools
//             </button>
//             <button onClick={() => handleAnchorLink('#contact')} className="text-gray-600 hover:text-blue-600 transition-colors">
//               Contact
//             </button>
            
//             {user ? (
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center space-x-1 text-gray-600">
//                   <User className="h-5 w-5" />
//                   <span>{user.name || user.email || 'User'}</span>
//                 </div>
//                 <button 
//                   onClick={signOut}
//                   className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
//                 >
//                   <LogOut className="h-5 w-5" />
//                   <span>Sign Out</span>
//                 </button>
//               </div>
//             ) : (
//               <Link 
//                 to="/signin" 
//                 className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
//               >
//                 Sign In
//               </Link>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <button 
//             className="md:hidden"
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//           >
//             {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//           </button>
//         </div>

//         {/* Mobile Navigation */}
//         {isMenuOpen && (
//           <div className="md:hidden mt-4 pb-4 space-y-3">
//             <button onClick={() => handleAnchorLink('#')} className="block w-full text-left py-2 text-gray-600">
//               Home
//             </button>
//             <button onClick={() => handleAnchorLink('#features')} className="block w-full text-left py-2 text-gray-600">
//               Features
//             </button>
//             <button onClick={() => handleAnchorLink('#about')} className="block w-full text-left py-2 text-gray-600">
//               About
//             </button>
//             <button onClick={() => handleAnchorLink('#tools')} className="block w-full text-left py-2 text-gray-600">
//               Tools
//             </button>
//             <button onClick={() => handleAnchorLink('#contact')} className="block w-full text-left py-2 text-gray-600">
//               Contact
//             </button>
            
//             {user ? (
//               <>
//                 <div className="flex items-center py-2 text-gray-600">
//                   <User className="h-5 w-5 mr-2" />
//                   <span>{user.name || user.email || 'User'}</span>
//                 </div>
//                 <button 
//                   onClick={() => {
//                     signOut();
//                     setIsMenuOpen(false);
//                   }}
//                   className="flex items-center w-full py-2 text-gray-600 hover:text-red-600"
//                 >
//                   <LogOut className="h-5 w-5 mr-2" />
//                   <span>Sign Out</span>
//                 </button>
//               </>
//             ) : (
//               <Link 
//                 to="/signin" 
//                 className="block mt-4 w-full bg-blue-600 text-white px-6 py-2 rounded-full text-center"
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 Sign In
//               </Link>
//             )}
//           </div>
//         )}
//       </nav>
//     </header>
//   );
// };

// export default Header;

import React from 'react';
import { Menu, X, Brain, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    if (path.startsWith('#')) {
      // Handle anchor links
      if (window.location.pathname === '/') {
        const element = document.querySelector(path);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(path);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      // Handle regular paths
      navigate(path);
    }
  };

  return (
    <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-blue-600" />
            <button 
              onClick={() => handleNavigation('/')} 
              className="ml-2 text-xl font-semibold text-gray-800"
            >
              GenAI Medical
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNavigation('/')} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => handleNavigation('#features')} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => handleNavigation('#about')} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => handleNavigation('#tools')} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Tools
            </button>
            <button 
              onClick={() => handleNavigation('#contact')} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contact
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-gray-600">
                  <User className="h-5 w-5" />
                  <span>{user.name || user.email || 'User'}</span>
                </div>
                <button 
                  onClick={signOut}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => handleNavigation('/signin')} 
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )}
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
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <button 
              onClick={() => handleNavigation('/')} 
              className="block w-full text-left py-2 text-gray-600"
            >
              Home
            </button>
            <button 
              onClick={() => handleNavigation('#features')} 
              className="block w-full text-left py-2 text-gray-600"
            >
              Features
            </button>
            <button 
              onClick={() => handleNavigation('#about')} 
              className="block w-full text-left py-2 text-gray-600"
            >
              About
            </button>
            <button 
              onClick={() => handleNavigation('#tools')} 
              className="block w-full text-left py-2 text-gray-600"
            >
              Tools
            </button>
            <button 
              onClick={() => handleNavigation('#contact')} 
              className="block w-full text-left py-2 text-gray-600"
            >
              Contact
            </button>
            
            {user ? (
              <>
                <div className="flex items-center py-2 text-gray-600">
                  <User className="h-5 w-5 mr-2" />
                  <span>{user.name || user.email || 'User'}</span>
                </div>
                <button 
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full py-2 text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => handleNavigation('/signin')} 
                className="block mt-4 w-full bg-blue-600 text-white px-6 py-2 rounded-full text-center"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;