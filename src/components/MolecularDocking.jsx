import React, { useState, useEffect, useRef } from 'react';
import { ArrowBack } from '@mui/icons-material'; // Import back arrow icon
import { useNavigate } from 'react-router-dom'; // Import navigation hook
import { 
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Container
} from '@mui/material';
import axios from 'axios';
import * as $3Dmol from '3dmol';

const MolecularDockingViewer = () => {
  const navigate = useNavigate();
  const [ecNumber, setEcNumber] = useState('3.4.21.4');
  const [ligandId, setLigandId] = useState('13U');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdbContent, setPdbContent] = useState(null);
  const viewerRef = useRef(null);
  const viewerInstance = useRef(null);

  // Initialize/update viewer
  useEffect(() => {
    if (!pdbContent || !viewerRef.current) return;

    const initViewer = () => {
      // Clear existing viewer
      if (viewerInstance.current) {
        viewerRef.current.innerHTML = '';
        viewerInstance.current = null;
      }

      // Create new viewer
      viewerInstance.current = $3Dmol.createViewer(viewerRef.current, {
        backgroundColor: "white",
        width: '100%',
        height: '100%'
      });

      try {
        viewerInstance.current.addModel(pdbContent, "pdb");
        viewerInstance.current.setStyle({}, {
          cartoon: { 
            color: 'lightblue',
            thickness: 0.6
          }
        });
        viewerInstance.current.setStyle({hetflag: true}, {
          stick: {
            color: 'red',
            radius: 0.3
          }
        });
        viewerInstance.current.zoomTo();
        viewerInstance.current.render();
      } catch (e) {
        console.error('3Dmol error:', e);
        setError('Failed to render 3D structure');
      }
    };

    initViewer();

    return () => {
      if (viewerInstance.current) {
        viewerRef.current.innerHTML = '';
      }
    };
  }, [pdbContent]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setPdbContent(null);

    try {
      const response = await axios.post('http://localhost:5004/process', {
        ECnumber: ecNumber,
        LIGAND_ID: ligandId
      });
      
      if (response.data?.pdb_content) {
        setPdbContent(response.data.pdb_content);
      } else {
        throw new Error(response.data?.error || 'Invalid response format');
      }
    } catch (err) {
      setError(err.message || 'Failed to load structure. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (

    <Container maxWidth="lg" disableGutters sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4, px: 2 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700,
            color: '#1976d2',
            mb: 1
          }}
        >
          Autodocking
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Explore molecular structures in 3D
        </Typography>
      </Box>

      {/* Input Section */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        mb: 4,
        px: 2
      }}>
        <TextField
          label="EC Number"
          value={ecNumber}
          onChange={(e) => setEcNumber(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{ flex: 1 }}
        />
        <TextField
          label="Ligand ID"
          value={ligandId}
          onChange={(e) => setLigandId(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ 
            px: 4,
            height: '56px',
            alignSelf: { xs: 'stretch', md: 'flex-end' }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Visualize'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, mx: 2 }}>
          {error}
        </Alert>
      )}

      {/* Visualization Section */}
      <Box sx={{ 
        height: '70vh',
        minHeight: '500px',
        width: '100%',
        position: 'relative',
        border: '1px solid #eee',
        borderRadius: 1,
        overflow: 'hidden',
        backgroundColor: '#fafafa'
      }}>
        <Box
          ref={viewerRef}
          sx={{
            width: '100%',
            height: '100%',
            position: 'absolute'
          }}
        />
        {!pdbContent && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary'
          }}>
            <Typography>Submit parameters to view the structure</Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default MolecularDockingViewer;

// import React, { useState, useEffect, useRef } from 'react';
// import { ArrowBack } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Box,
//   Button,
//   TextField,
//   Typography,
//   CircularProgress,
//   Alert,
//   Container,
//   IconButton,
//   Paper
// } from '@mui/material';
// import axios, { AxiosError } from 'axios';
// import * as $3Dmol from '3dmol';

// const MolecularDockingViewer = () => {
//   const navigate = useNavigate();
//   const [ecNumber, setEcNumber] = useState('3.4.21.4');
//   const [ligandId, setLigandId] = useState('13U');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [pdbContent, setPdbContent] = useState<string | null>(null);
//   const viewerRef = useRef<HTMLDivElement>(null);
//   const viewerInstance = useRef<$3Dmol.GLViewer | null>(null);

//   // Initialize/update viewer
//   useEffect(() => {
//     if (!pdbContent || !viewerRef.current) return;

//     const initViewer = () => {
//       // Clear existing viewer
//       if (viewerInstance.current) {
//         viewerInstance.current.clear();
//       }

//       // Create new viewer
//       viewerInstance.current = $3Dmol.createViewer(viewerRef.current, {
//         backgroundColor: "white",
//         width: '100%',
//         height: '100%'
//       });

//       try {
//         viewerInstance.current.addModel(pdbContent, "pdb");
//         viewerInstance.current.setStyle({}, {
//           cartoon: { 
//             color: 'spectrum',
//             thickness: 0.6
//           }
//         });
//         viewerInstance.current.setStyle({hetflag: true}, {
//           stick: {
//             color: 'red',
//             radius: 0.3
//           },
//           sphere: { radius: 0.5 }
//         });
//         viewerInstance.current.zoomTo();
//         viewerInstance.current.render();
//       } catch (e) {
//         console.error('3Dmol error:', e);
//         setError('Failed to render 3D structure');
//       }
//     };

//     initViewer();

//     return () => {
//       if (viewerInstance.current) {
//         viewerInstance.current.clear();
//       }
//     };
//   }, [pdbContent]);

//   const handleSubmit = async () => {
//     setLoading(true);
//     setError('');
//     setPdbContent(null);

//     try {
//       const response = await axios.post('/api/process', {
//         ECnumber: ecNumber,
//         LIGAND_ID: ligandId
//       });
      
//       if (response.data?.pdb_content) {
//         setPdbContent(response.data.pdb_content);
//       } else {
//         throw new Error(response.data?.error || 'Invalid response format');
//       }
//     } catch (err) {
//       let errorMessage = 'Failed to load structure. Check console for details.';
//       if (axios.isAxiosError(err)) {
//         errorMessage = err.response?.data?.error || err.message;
//       } else if (err instanceof Error) {
//         errorMessage = err.message;
//       }
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container maxWidth="lg" sx={{ py: 4, pt: 8 }}>
//       {/* Back Button */}
//       <IconButton 
//         onClick={() => navigate(-1)}
//         sx={{ 
//           position: 'absolute',
//           top: 16,
//           left: 16,
//           zIndex: 1,
//           color: 'primary.main'
//         }}
//       >
//         <ArrowBack fontSize="large" />
//       </IconButton>

//       {/* Main Content */}
//       <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
//         <Typography 
//           variant="h4" 
//           sx={{ 
//             fontWeight: 700,
//             color: 'primary.main',
//             mb: 2,
//             textAlign: 'center'
//           }}
//         >
//           Protein Interaction Viewer
//         </Typography>
        
//         <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
//           Visualize protein-ligand interactions in 3D
//         </Typography>

//         {/* Input Section */}
//         <Box sx={{ 
//           display: 'flex',
//           flexDirection: { xs: 'column', md: 'row' },
//           gap: 3,
//           mb: 4
//         }}>
//           <TextField
//             label="EC Number"
//             value={ecNumber}
//             onChange={(e) => setEcNumber(e.target.value)}
//             variant="outlined"
//             fullWidth
//             size="small"
//           />
//           <TextField
//             label="Ligand ID"
//             value={ligandId}
//             onChange={(e) => setLigandId(e.target.value)}
//             variant="outlined"
//             fullWidth
//             size="small"
//           />
//           <Button
//             variant="contained"
//             onClick={handleSubmit}
//             disabled={loading}
//             sx={{ 
//               px: 4,
//               height: '40px',
//               alignSelf: { xs: 'stretch', md: 'center' }
//             }}
//           >
//             {loading ? <CircularProgress size={24} /> : 'Visualize'}
//           </Button>
//         </Box>

//         {error && (
//           <Alert severity="error" sx={{ mb: 3 }}>
//             {error}
//           </Alert>
//         )}
//       </Paper>

//       {/* Visualization Section */}
//       <Paper elevation={3} sx={{ p: 2 }}>
//         <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
//           3D Molecular Visualization
//         </Typography>
//         <Box
//           ref={viewerRef}
//           sx={{
//             width: '100%',
//             height: '60vh',
//             minHeight: '500px',
//             border: '1px solid',
//             borderColor: 'divider',
//             borderRadius: 1,
//             overflow: 'hidden',
//             backgroundColor: 'background.paper'
//           }}
//         >
//           {!pdbContent && (
//             <Box sx={{
//               height: '100%',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: 'text.secondary'
//             }}>
//               <Typography>Submit parameters to view the structure</Typography>
//             </Box>
//           )}
//         </Box>
//       </Paper>
//     </Container>
//   );
// };

// export default MolecularDockingViewer;