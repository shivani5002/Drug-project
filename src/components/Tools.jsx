// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Microscope, Dna, Scan, FlaskRound, Brain } from 'lucide-react';

// const tools = [
//   {
//     icon: Scan,
//     name: 'CT Scan Analysis',
//     description: 'Advanced deep learning algorithms analyze CT scans to detect and diagnose lung diseases with high accuracy.',
//     features: ['Real-time analysis', 'Multi-lesion detection', 'Severity assessment', 'Progress tracking'],
//     path: '/tumor-segmentation', // Path to navigate to
//   },
//   {
//     icon: FlaskRound,
//     name: 'Drug Discovery Suite',
//     description: 'AI-powered platform for identifying and validating potential drug candidates for various therapeutic targets.',
//     features: ['Molecule screening', 'Binding affinity prediction', 'Toxicity assessment', 'Drug-target interaction'],
//     path: '/drug-discovery', // Path to navigate to
//   },
//   {
//     icon: Brain,
//     name: 'Protein Structure Prediction',
//     description: 'State-of-the-art machine learning models for accurate protein structure prediction and analysis.',
//     features: ['3D structure prediction', 'Fold recognition', 'Domain analysis', 'Stability assessment'],
//     path: '/protein-structure', // Path to navigate to
//   },
//   {
//     icon: Dna,
//     name: 'Molecular Docking',
//     description: 'Advanced algorithms for protein-ligand docking and interaction analysis.',
//     features: ['Automated docking', 'Binding site prediction', 'Energy calculation', 'Pose optimization'],
//     path: '/molecular-docking', // Path to navigate to
//   },
// ];

// const Tools = () => {
//   const navigate = useNavigate();

//   return (
//     <section id="tools" className="py-20 bg-gradient-to-b from-white via-blue-50/50 to-green-50/50">
//       <div className="container mx-auto px-6">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
//             Cutting-edge Tools for Medical Innovation
//           </h2>
//           <p className="text-xl text-slate-600 max-w-2xl mx-auto">
//             Our comprehensive suite of AI-powered tools enables breakthrough discoveries
//             in medical diagnosis and drug development.
//           </p>
//         </div>

//         <div className="grid lg:grid-cols-2 gap-8">
//           {tools.map((tool, index) => (
//             <div
//               key={index}
//               className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-soft hover:shadow-lg transition-all duration-300 border border-slate-100 cursor-pointer"
//               onClick={() => navigate(tool.path)} // Navigate to the tool's page
//             >
//               <div className="flex items-start">
//                 <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl">
//                   <tool.icon className="h-12 w-12 text-blue-600" />
//                 </div>
//                 <div className="ml-6">
//                   <h3 className="text-2xl font-semibold text-slate-900 mb-3">{tool.name}</h3>
//                   <p className="text-slate-600 mb-4">{tool.description}</p>
//                   <ul className="grid grid-cols-2 gap-2">
//                     {tool.features.map((feature, featureIndex) => (
//                       <li
//                         key={featureIndex}
//                         className="flex items-center text-sm text-slate-600"
//                       >
//                         <span className="w-1.5 h-1.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mr-2" />
//                         {feature}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="mt-12 text-center">
//           <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full hover:shadow-lg transition-all duration-300 inline-flex items-center group">
//             Request Demo Access
//             <Microscope className="ml-2 h-5 w-5 transform group-hover:scale-110 transition-transform" />
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Tools;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Microscope, Dna, Scan, FlaskRound, Brain } from 'lucide-react';

const tools = [
  {
    icon: Scan,
    name: 'CT Scan Analysis',
    description: 'Advanced deep learning algorithms analyze CT scans to detect and diagnose lung diseases with high accuracy.',
    features: ['Real-time analysis', 'Multi-lesion detection', 'Severity assessment', 'Progress tracking'],
    path: '/tumor-segmentation',
  },
  {
    icon: FlaskRound,
    name: 'Drug Discovery Suite',
    description: 'AI-powered platform for identifying and validating potential drug candidates for various therapeutic targets.',
    features: ['Molecule screening', 'Binding affinity prediction', 'Toxicity assessment', 'Drug-target interaction'],
    path: '/drug-discovery',
  },
  {
    icon: Brain,
    name: 'Protein Structure Prediction',
    description: 'State-of-the-art machine learning models for accurate protein structure prediction and analysis.',
    features: ['3D structure prediction', 'Fold recognition', 'Domain analysis', 'Stability assessment'],
    path: '/protein-structure', // This should match your route for ProteinPredictor
  },
  {
    icon: Dna,
    name: 'Molecular Docking',
    description: 'Advanced algorithms for protein-ligand docking and interaction analysis.',
    features: ['Automated docking', 'Binding site prediction', 'Energy calculation', 'Pose optimization'],
    path: '/molecular-docking',
  },
];

const Tools = () => {
  const navigate = useNavigate();

  const handleToolClick = (path) => {
    // You can add any pre-navigation logic here if needed
    navigate(path);
  };

  return (
    <section id="tools" className="py-20 bg-gradient-to-b from-white via-blue-50/50 to-green-50/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Cutting-edge Tools for Medical Innovation
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Our comprehensive suite of AI-powered tools enables breakthrough discoveries
            in medical diagnosis and drug development.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-soft hover:shadow-lg transition-all duration-300 border border-slate-100 cursor-pointer group"
              onClick={() => handleToolClick(tool.path)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl group-hover:bg-gradient-to-br group-hover:from-blue-200 group-hover:to-green-200 transition-colors">
                  <tool.icon className="h-12 w-12 text-blue-600 group-hover:text-blue-700 transition-colors" />
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-semibold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-slate-600 mb-4">{tool.description}</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {tool.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center text-sm text-slate-600"
                      >
                        <span className="w-1.5 h-1.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button 
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full hover:shadow-lg transition-all duration-300 inline-flex items-center group"
            onClick={() => navigate('/contact')} // Update with your contact/demo route
          >
            Request Demo Access
            <Microscope className="ml-2 h-5 w-5 transform group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Tools;