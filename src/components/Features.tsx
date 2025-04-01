import React from 'react';
import { Brain, FlaskRound as Flask, ScrollText, Microscope } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'CT Image Analysis',
    description: 'Advanced AI algorithms for accurate lung disease diagnosis from CT scans.',
  },
  {
    icon: Flask,
    title: 'Drug Molecule Identification',
    description: 'AI-powered identification of potential drug molecules for targeted treatments.',
  },
  {
    icon: Microscope,
    title: 'Protein Structure Prediction',
    description: 'State-of-the-art protein structure prediction using machine learning.',
  },
  {
    icon: ScrollText,
    title: 'Research Insights',
    description: 'Data-driven insights for accelerated drug discovery and development.',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Medical Innovation
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI technology with medical expertise to deliver
            breakthrough solutions in diagnosis and drug discovery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;