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
import ProteinToSmiles from './components/ProteinToSmiles'; // Add this import
import Careers from './components/Career';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import OTPVerification from './components/OTPVerification';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Navigate } from 'react-router-dom';
import EmailVerification from './components/EmailVerification';
import DrugGenerator from './components/DrugGenerator';
import MolecularDocking from './components/MolecularDocking';
import MaskedSmiles from './components/MaskedSmiles';
import Visualization from './components/Visualization'; 
import MolecularPropertyClassifier from './components/MolecularPropertyClassifier'

const App = () => {
  return (
    <Router basename="/">
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/verify-email" element={<EmailVerification />} /> 
          
          {/* Main page with tools */}
          {/* <Route path="/" element={<Home />} /> */}
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
            <Route path="/tumor-segmentation" element={<TumorSegmentation />} />
            <Route path="/protein-structure" element={<ProteinPredictor />} />
            <Route path="/protein-to-smiles" element={<ProteinToSmiles />} />
            <Route path="/masked-smiles" element={<MaskedSmiles />} /> 
            <Route path="/drug-generator" element={<DrugGenerator />} />
            <Route path="/molecular-docking" element={<MolecularDocking />} />
            <Route path="/molecular-property-classifier" element={<MolecularPropertyClassifier />} />
            <Route path="/3d-visualization" element={<Visualization />} />
            <Route path="/careers" element={<Careers />} />
          </Route>
           {/* Redirect to signin by default */}
           <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
