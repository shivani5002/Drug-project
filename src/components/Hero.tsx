import React, {useState} from 'react';
import { ArrowRight, X} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {

  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const scrollToTools = () => {
    // If we're already on the home page, scroll to tools
    if (window.location.pathname === '/') {
      const toolsSection = document.getElementById('tools');
      toolsSection?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Otherwise navigate to home then scroll
      navigate('/');
      setTimeout(() => {
        const toolsSection = document.getElementById('tools');
        toolsSection?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };


  return (
    <div className="relative min-h-screen flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-green-50" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-40 right-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 relative">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Transforming Lung Disease Diagnosis and Drug Discovery with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Generative AI
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Revolutionize healthcare with our advanced AI-powered platform for accurate lung disease diagnosis
            and accelerated drug discovery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={scrollToTools}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full hover:shadow-lg transition-all duration-300 flex items-center justify-center group">
              Explore Our Tools
              <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => setIsDemoOpen(true)}
             className="bg-white bg-opacity-50 backdrop-blur-sm border-2 border-blue-200 text-blue-700 px-8 py-4 rounded-full hover:shadow-lg hover:border-blue-300 transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Demo Video Modal */}
      {isDemoOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-xl overflow-hidden">
            <button 
              onClick={() => setIsDemoOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            
            <div className="aspect-w-16 aspect-h-9 w-full">
              <iframe
                className="w-full h-[500px]"
                src="https://www.youtube.com/embed/Yf7OXkGJONQ?autoplay=1"
                title="Product Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}


      {/* Decorative Image */}
      <div className="absolute right-12  top-2/4 -translate-y-1/2 hidden lg:block w-1/3 h-2/3">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-green-600/10 rounded-l-3xl" />
        <img
          src="https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80"
          alt="Medical AI Visualization"
          className="w-full h-full object-cover rounded-l-3xl shadow-2xl "
        />
      </div>
    </div>
  );
};

export default Hero;