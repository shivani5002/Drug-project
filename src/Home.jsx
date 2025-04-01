import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Tools from './components/Tools';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <Tools />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Home;

// import React from 'react';
// import { Link } from 'react-router-dom';

// const Header = () => {
//   return (
//     <header className="bg-white shadow-sm">
//       <div className="container mx-auto flex justify-between items-center py-4 px-6">
//         <Link to="/" className="text-xl font-bold text-slate-900">
//           My Website
//         </Link>
//         <nav>
//           <ul className="flex space-x-4">
//             <li>
//               <Link to="/signin" className="text-slate-700 hover:text-blue-600">
//                 Sign In
//               </Link>
//             </li>
//             <li>
//               <Link to="/signup" className="text-slate-700 hover:text-blue-600">
//                 Sign Up
//               </Link>
//             </li>
//           </ul>
//         </nav>
//       </div>
//     </header>
//   );
// };

// export default Header;