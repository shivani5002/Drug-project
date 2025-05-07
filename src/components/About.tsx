import React from 'react';
import { Award, Users, Target, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stats = [
  { icon: Users, value: '10,000+', label: 'Medical Professionals' },
  { icon: Target, value: '95%', label: 'Diagnosis Accuracy' },
  { icon: Sparkles, value: '500+', label: 'Drug Candidates' },
  { icon: Award, value: '25+', label: 'Research Partners' },
];

const About = () => {

  const navigate = useNavigate();

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Pioneering the Future of Medical Innovation
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              At GenAI Medical, we're combining cutting-edge artificial intelligence with medical
              expertise to revolutionize disease diagnosis and drug discovery. Our team of experts
              works tirelessly to develop innovative solutions that improve patient outcomes and
              accelerate medical research.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Our mission is to make advanced medical diagnostics and drug discovery more
              accessible, accurate, and efficient through the power of generative AI and
              machine learning.
            </p>
            <button onClick={() => navigate('/careers')}
            className="bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition-colors">
              Join Our Team
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-blue-50 rounded-2xl p-6 text-center hover:bg-blue-100 transition-colors"
              >
                <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;