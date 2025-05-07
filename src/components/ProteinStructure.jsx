import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import * as $3Dmol from '3dmol';
import './ProteinPredictor.css';
 
const ProteinPredictor = () => {
  const [sequence, setSequence] = useState('MGSSHHHHHHSSGLVPRGSHMRGPNPTAASLEASAGPFTVRSFTVSRPSGYGAGTVYYPTNAGGTVGAIAIVPGYTARQSSIKWWGPRLASHGFVVITIDTNSTLDQPSSRSSQQMAALRQVASLNGTSSSPIYGKVDTARMGVMGWSMGGGGSLISAANNPSLKAAAPQAPWDSSTNFSSVTVPTLIFACENDSIAPVNSSALPIYDSMSRNAKQFLEINGGSHSCANSGNSNQALIGKKGVAWMKRFMDNDTRYSTFACENPNSTRVSDFRTANCSLEDPAANKARKEAELAAATAEQ');
  const [pdbData, setPdbData] = useState(null);
  const [plDDT, setPlDDT] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visualizationStyle, setVisualizationStyle] = useState('cartoon');
  const [colorScheme, setColorScheme] = useState('spectrum');
  const [sequenceLength, setSequenceLength] = useState(0);
  const [predictionSource, setPredictionSource] = useState(null);
  const [webGLAvailable, setWebGLAvailable] = useState(true);
  const [viewerStatus, setViewerStatus] = useState('initializing');
  const [isRotating, setIsRotating] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(5);
  const [secondaryStructure, setSecondaryStructure] = useState(null);
  
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const rotationIntervalRef = useRef(null);

  const exampleSequences = [
    {
      name: "Default Example",
      sequence: "MGSSHHHHHHSSGLVPRGSHMRGPNPTAASLEASAGPFTVRSFTVSRPSGYGAGTVYYPTNAGGTVGAIAIVPGYTARQSSIKWWGPRLASHGFVVITIDTNSTLDQPSSRSSQQMAALRQVASLNGTSSSPIYGKVDTARMGVMGWSMGGGGSLISAANNPSLKAAAPQAPWDSSTNFSSVTVPTLIFACENDSIAPVNSSALPIYDSMSRNAKQFLEINGGSHSCANSGNSNQALIGKKGVAWMKRFMDNDTRYSTFACENPNSTRVSDFRTANCSLEDPAANKARKEAELAAATAEQ"
    },
    {
      name: "Short Example",
      sequence: "MKLLILTCLVAVALARPKLPTTASAAAKKK"
    },
    {
      name: "Enzyme Example",
      sequence: "MKLFVALYFMVVSIGNVLSSLLTANLLAVVLPGGTTLTLADKLVTDLYVKPTVADYSVGLSDKLLSSVTVVQVLKPNYIDKLLDITDADOITKELVKQ"
    }
  ];

  // Check WebGL support
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebGLAvailable(false);
      setError('WebGL not supported. Try Chrome/Firefox with hardware acceleration enabled.');
    }
  }, []);

  // Update sequence length
  useEffect(() => {
    setSequenceLength(sequence.length);
  }, [sequence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
      if (viewerRef.current) {
        viewerRef.current.clear();
      }
    };
  }, []);

  // Enhanced render protein function
  const renderProtein = useCallback((pdb) => {
    if (!viewerRef.current) return;

    try {
      setViewerStatus('rendering');
      stopRotation();
      viewerRef.current.removeAllModels();
      viewerRef.current.addModel(pdb, 'pdb');
      
      const style = {};
      if (secondaryStructure && colorScheme === 'ss') {
        style.cartoon = {
          colorfunc: (atom) => {
            const resNum = atom.resi;
            const ss = secondaryStructure.find(s => s.resNum === resNum)?.ssType;
            return ss === 'H' ? 'blue' : ss === 'E' ? 'red' : 'yellow';
          }
        };
      } else {
        switch (visualizationStyle) {
          case 'stick': 
            style.stick = { radius: 0.3, color: colorScheme }; 
            break;
          case 'sphere': 
            style.sphere = { scale: 0.6, color: colorScheme }; 
            break;
          default: 
            style.cartoon = { color: colorScheme };
        }
      }
      
      viewerRef.current.setStyle({}, style);
      viewerRef.current.zoomTo();
      viewerRef.current.zoom(1.2, 1000);
      
      if (isRotating) startRotation();
      viewerRef.current.render();
      setViewerStatus('ready');
    } catch (err) {
      console.error('Rendering error:', err);
      setViewerStatus('failed');
      setError('Failed to render protein structure');
    }
  }, [visualizationStyle, colorScheme, isRotating, rotationSpeed, secondaryStructure]);

  // Initialize viewer
  useEffect(() => {
    if (!webGLAvailable || !containerRef.current) return;

    const initViewer = () => {
      try {
        if (viewerRef.current) viewerRef.current.clear();

        const config = {
          backgroundColor: 'white',
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        };

        const viewer = $3Dmol.createViewer(containerRef.current, config);
        viewerRef.current = viewer;
        setViewerStatus('ready');
        
        if (pdbData) renderProtein(pdbData);
      } catch (err) {
        console.error('Viewer initialization failed:', err);
        setViewerStatus('failed');
        setError('Failed to initialize 3D viewer. Please refresh the page.');
      }
    };

    const timer = setTimeout(initViewer, 100);
    return () => clearTimeout(timer);
  }, [webGLAvailable, pdbData, renderProtein]);

  // Update visualization when style changes
  useEffect(() => {
    if (pdbData && viewerRef.current) {
      renderProtein(pdbData);
    }
  }, [visualizationStyle, colorScheme, pdbData, renderProtein]);

  // Rotation control functions
  const startRotation = () => {
    stopRotation();
    rotationIntervalRef.current = setInterval(() => {
      if (viewerRef.current) {
        viewerRef.current.rotate(0.5 * (rotationSpeed / 5), 'y');
        viewerRef.current.render();
      }
    }, 100);
  };

  const stopRotation = () => {
    if (rotationIntervalRef.current) {
      clearInterval(rotationIntervalRef.current);
      rotationIntervalRef.current = null;
    }
  };

  const toggleRotation = () => {
    const newRotationState = !isRotating;
    setIsRotating(newRotationState);
    if (newRotationState) startRotation();
    else stopRotation();
  };

  const handleSpeedChange = (e) => {
    const speed = parseInt(e.target.value);
    setRotationSpeed(speed);
    if (isRotating) startRotation();
  };

  const predictStructure = async () => {
    if (sequence.length < 10) {
      setError('Sequence too short (minimum 10 amino acids)');
      return;
    }

    setLoading(true);
    setError(null);
    setPdbData(null);
    setPlDDT(null);
    setSecondaryStructure(null);
    setPredictionSource(null);
    setIsRotating(false);
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/predict-protein',
        { sequence },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 180000
        }
      );
      
      setPdbData(response.data.pdb);
      setPlDDT(response.data.plDDT);
      setPredictionSource(response.data.source);
      
      // Process secondary structure from backend
      if (response.data.secondaryStructure) {
        setSecondaryStructure(
          response.data.secondaryStructure.map(item => ({
            resNum: item.resNum,
            ssType: item.ssType
          }))
        );
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.response?.data?.error || 
               err.response?.data?.details || 
               'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDB = () => {
    const blob = new Blob([pdbData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'predicted_structure.pdb';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = (example) => {
    setSequence(example.sequence);
    setPdbData(null);
    setPlDDT(null);
    setSecondaryStructure(null);
    setError(null);
    setPredictionSource(null);
    setIsRotating(false);
  };

  return (
    <div className="protein-app-container">
      {!webGLAvailable && (
        <div className="error-overlay">
          <h2>WebGL Not Supported</h2>
          <p>Your browser or device doesn't support WebGL, which is required for 3D visualization.</p>
          <p>Please try Google Chrome or Mozilla Firefox with hardware acceleration enabled.</p>
        </div>
      )}
      
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>🎈 ESMFold Visualization</h1>
          <p className="app-description">
            Visualize 3D protein structures from amino acid sequences.
          </p>
        </div>
        
        <div className="example-sequences">
          <h3>Example Sequences</h3>
          <select 
            onChange={(e) => loadExample(exampleSequences[e.target.value])}
            className="example-select"
            disabled={loading}
          >
            <option value="">Select an example...</option>
            {exampleSequences.map((example, index) => (
              <option key={index} value={index}>{example.name}</option>
            ))}
          </select>
        </div>
        
        <div className="sequence-input">
          <div className="sequence-header">
            <h3>Protein Sequence</h3>
            <span className="sequence-length">{sequenceLength} amino acids</span>
          </div>
          <textarea
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            rows={10}
            placeholder="Enter protein sequence..."
            className="sequence-textarea"
            disabled={loading}
          />
        </div>
        
        <div className="action-buttons">
          <button 
            onClick={predictStructure} 
            disabled={loading || sequence.length < 10}
            className={`predict-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Predicting...
              </>
            ) : 'Predict Structure'}
          </button>
          
          {pdbData && (
            <button onClick={downloadPDB} className="download-button">
              Download PDB
            </button>
          )}
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        {predictionSource && (
          <div className="prediction-source">
            <p>Prediction source: <strong>{predictionSource}</strong></p>
          </div>
        )}
        
        {plDDT && (
          <div className="confidence-section">
            <h3>Prediction Confidence (plDDT)</h3>
            <div className="plddt-info">
              <p>plDDT is a per-residue estimate of the confidence in prediction on a scale from 0-100.</p>
              <div className="plddt-value">
                <span className="value">{plDDT}</span>
                <div className="confidence-bar" style={{width: `${plDDT}%`}}></div>
              </div>
              <div className="confidence-labels">
                <span>0 (Low)</span>
                <span>50</span>
                <span>100 (High)</span>
              </div>
            </div>
          </div>
        )}
        
        {secondaryStructure && (
          <div className="secondary-structure-section">
            <h3>Secondary Structure Prediction</h3>
            <div className="ss-visualization">
              {sequence.split('').map((char, index) => {
                const ss = secondaryStructure.find(s => s.resNum === index + 1);
                const ssType = ss ? ss.ssType : 'C';
                return (
                  <div 
                    key={index}
                    className={`ss-element ss-${ssType}`}
                    title={`Residue ${index + 1}: ${char} (${getSSName(ssType)})`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
            <div className="ss-legend">
              <div className="ss-legend-item">
                <span className="ss-sample ss-H"></span> Helix (H)
              </div>
              <div className="ss-legend-item">
                <span className="ss-sample ss-E"></span> Sheet (E)
              </div>
              <div className="ss-legend-item">
                <span className="ss-sample ss-C"></span> Coil (C)
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="main-content">
        {!pdbData ? (
          <div className="welcome-message">
            <h2>👈 Enter protein sequence data!</h2>
            <p>Paste your protein sequence to visualize its 3D structure.</p>
            <div className="tips">
              <h3>Tips:</h3>
              <ul>
                <li>Minimum sequence length: 10 amino acids</li>
                <li>Maximum sequence length: 1000 amino acids</li>
                <li>Try the example sequences to get started</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="visualization-header">
              <h2>Visualized Protein Structure</h2>
              <div className="visualization-controls">
                <select 
                  value={visualizationStyle} 
                  onChange={(e) => setVisualizationStyle(e.target.value)}
                  disabled={viewerStatus !== 'ready'}
                >
                  <option value="cartoon">Cartoon</option>
                  <option value="stick">Stick</option>
                  <option value="sphere">Sphere</option>
                </select>
                <select 
                  value={colorScheme} 
                  onChange={(e) => setColorScheme(e.target.value)}
                  disabled={viewerStatus !== 'ready'}
                >
                  <option value="spectrum">Spectrum</option>
                  <option value="ss">Secondary Structure</option>
                  <option value="residue">Residue Index</option>
                  <option value="chain">Chain</option>
                </select>
              </div>
            </div>
            
            <div 
              ref={containerRef}
              className={`protein-viewer-container ${!pdbData ? 'empty' : ''}`}
            >
              {viewerStatus === 'initializing' && (
                <div className="viewer-message">Initializing 3D viewer...</div>
              )}
              {viewerStatus === 'rendering' && (
                <div className="viewer-message">Rendering protein...</div>
              )}
              {viewerStatus === 'failed' && (
                <div className="viewer-message error">Failed to initialize viewer</div>
              )}
            </div>
            
            {viewerStatus === 'ready' && pdbData && (
              <div className="visualization-actions">
                <button onClick={() => viewerRef.current.zoomTo()}>
                  Zoom To Fit
                </button>
                <button 
                  onClick={toggleRotation}
                  className={isRotating ? 'active' : ''}
                >
                  {isRotating ? 'Stop Rotation' : 'Start Rotation'}
                </button>
                <div className="speed-control">
                  <label>Speed:</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={rotationSpeed}
                    onChange={handleSpeedChange}
                  />
                  <span>{rotationSpeed}x</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

function getSSName(code) {
  switch(code) {
    case 'H': return 'Alpha Helix';
    case 'E': return 'Beta Sheet';
    case 'C': return 'Random Coil';
    default: return 'Unknown';
  }
}

export default ProteinPredictor;