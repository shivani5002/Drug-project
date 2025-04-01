// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Home from './Home'; // Main page with tools
// import TumorSegmentation from './components/TumorSegmentation'; // Page for tumor segmentation

// const App = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Home />} /> {/* Main page with tools */}
//         <Route path="/tumor-segmentation" element={<TumorSegmentation />} /> {/* Tumor segmentation page */}
//       </Routes>
//     </Router>
//   );
// };

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home'; // Main page with tools
import TumorSegmentation from './components/TumorSegmentation'; // Page for tumor segmentation
import ProteinPredictor from './components/ProteinStructure'; // Import the Protein Predictor component

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Main page with tools */}
        <Route path="/" element={<Home />} />
        
        {/* Tumor segmentation page */}
        <Route path="/tumor-segmentation" element={<TumorSegmentation />} />
        
        {/* Protein structure prediction page */}
        <Route path="/protein-structure" element={<ProteinPredictor />} />
        
        {/* Add more tool routes here as needed */}
      </Routes>
    </Router>
  );
};

export default App;