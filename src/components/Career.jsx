import React from 'react';
import { Briefcase, Globe, Users, Clock } from 'lucide-react';

const Careers = () => (
  <div className="container mx-auto px-6 py-20">
    <h1 className="text-4xl font-bold text-center mb-16">Join Our Team</h1>
    
    <div className="grid md:grid-cols-2 gap-8 mb-16">
      {/* Left Column - Adjusted */}
      <div className="flex flex-col items-center md:items-start md:pl-40"> {/* Centered on mobile, slight right shift on desktop */}
        <h2 className="text-2xl md:text-[1.7rem] font-semibold mb-4 text-center md:text-left mt-16">Why Work With Us?</h2> {/* Slightly larger */}
        <ul className="space-y-4 w-full max-w-md"> {/* Constrained width for better centering */}
          {[
            { icon: Briefcase, text: "Work on cutting-edge AI/medical projects" },
            { icon: Globe, text: "Remote-friendly culture" },
            { icon: Users, text: "Collaborate with top researchers" },
            { icon: Clock, text: "Flexible work hours" },
          ].map((item, i) => (
            <li key={i} className="flex items-start">
              <item.icon className="h-5 w-5 mt-1 mr-3 text-blue-600" />
              <span className="text-[1.1rem]"> {/* Slightly larger text */}
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Column - Unchanged */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Open Positions</h2>
        <div className="space-y-4">
          {[
            "AI Research Scientist",
            "Frontend Developer (React)",
            "Bioinformatics Specialist",
            "Clinical Data Analyst",
          ].map((job, i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50">
              <h3 className="font-medium">{job}</h3>
              <p className="text-sm text-gray-600">Full-time · Remote</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Footer CTA - Unchanged */}
    <div className="text-center">
      <p className="mb-6">Don’t see your role? We’re always interested in meeting talented people.</p>
      <a
        href="mailto:careers@genaimedical.com"
        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700"
      >
        Email Your Resume
      </a>
    </div>
  </div>
);

export default Careers;