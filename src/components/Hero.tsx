import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
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
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full hover:shadow-lg transition-all duration-300 flex items-center justify-center group">
              Explore Our Tools
              <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white bg-opacity-50 backdrop-blur-sm border-2 border-blue-200 text-blue-700 px-8 py-4 rounded-full hover:shadow-lg hover:border-blue-300 transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>
      </div>

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