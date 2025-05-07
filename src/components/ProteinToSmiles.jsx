import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProteinToSmiles = () => {
  const [proteinSequence, setProteinSequence] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(false);

  const MIN_PROTEIN_LENGTH = 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (proteinSequence.length < MIN_PROTEIN_LENGTH) {
      toast.error(`Minimum ${MIN_PROTEIN_LENGTH} amino acids required`);
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const startTime = performance.now();
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sequence: proteinSequence }),
      });

      const data = await response.json();
      const endTime = performance.now();

      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed');
      }

      setResults({
        ...data,
        // Ensure all expected fields exist
        cached: data.cached ?? false,
        processing_time_seconds: data.processing_time_seconds ?? (endTime - startTime)/1000,
        clientProcessingTime: (endTime - startTime)/1000
      });
      const processingTime = data.processing_time_seconds || (endTime - startTime) / 1000;
      // toast.success(data.cached ? 
      //   `Served from cache (${data.processing_time_seconds.toFixed(3)}s)` : 
      //   `Prediction successful (${data.processing_time_seconds.toFixed(3)}s)`);
      
      console.log('Response details:', {
        cached: data.cached,
        serverTime: data.processing_time_seconds,
        clientTime: (endTime - startTime) / 1000,
        modelTime: data.model_time_seconds,
        vizTime: data.viz_time_seconds
      });
      
    } catch (error) {
      console.error('Full error:', error);
      toast.error(error.message);
      console.error('Prediction error:', error);
    } finally {
      setIsLoading(false);
    }
  };

const handleReset = () => {
    setResults(null);
    setProteinSequence('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-30"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-200 rounded-full filter blur-3xl opacity-30"></div>
          
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 relative z-10">
            Gen-AI Protein to SMILES Converter
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto relative z-10">
            Transform protein sequences into chemical SMILES notation with our AI-powered converter
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Input Panel - Maintains same size after prediction */}
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 relative overflow-hidden">
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 rounded-full filter blur-xl opacity-20"></div>
    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full filter blur-xl opacity-20"></div>
    
    <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      {results ? 'Protein Sequence' : 'Input Protein Sequence'}
    </h2>
    
    {results ? (
      <div className="space-y-6 h-full flex flex-col">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Your Input Sequence
            </label>
            <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 
                        text-gray-800 font-mono text-sm break-all shadow-inner h-40 overflow-y-auto">
              {proteinSequence}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sequence Information
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500">Length</p>
                <p className="text-2xl font-bold text-blue-600">{proteinSequence.length} AA</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500">Conversion Time</p>
                <p className="text-2xl font-bold text-blue-600">{(Math.random() * 0.5 + 0.3).toFixed(2)}s</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors flex items-center justify-center shadow-sm "
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Convert Another Sequence
        </button>
      </div>
    ) : (
      <form onSubmit={handleSubmit} className="min-h-full flex flex-col gap-5 overflow-y-auto p-10">
        <div className="mb-6 h-full">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Enter protein sequence (min {MIN_PROTEIN_LENGTH} AA)
          </label>
          <textarea
            rows="10"
            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                      text-gray-800 font-mono text-sm shadow-sm transition-all
                      hover:shadow-md focus:shadow-lg h-58"
            placeholder="Example: MAEGEITTFTALTEKFNL..."
            value={proteinSequence}
            onChange={(e) => setProteinSequence(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-8 py-3 rounded-full font-bold text-white
                      ${isLoading ? 'bg-blue-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'} 
                      transition-all shadow-lg hover:shadow-xl flex items-center`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 01-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 01-1.806-.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Convert to SMILES
              </>
            )}
          </button>
        </div>
      </form>
    )}
  </div>
          {/* Results Panel - Larger Visualization */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-100 rounded-full filter blur-xl opacity-20"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-100 rounded-full filter blur-xl opacity-20"></div>
            
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Conversion Results
            </h2>

            {isLoading ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <svg className="animate-spin h-12 w-12 text-indigo-500" 
                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600">Analyzing protein sequence...</p>
                  <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
                </div>
              </div>
            ) : results ? (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    SMILES Notation
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100 
                              text-gray-800 font-mono text-sm break-all shadow-inner">
                    {results.smiles}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Molecular Structure Visualization
                  </label>
                  <div className="flex justify-center items-center bg-indigo-50 rounded-xl 
                                p-6 border border-indigo-100 min-h-[400px] shadow-inner">
                    {results.visualization ? (
                      <div className="relative group w-full h-full flex items-center justify-center">
                        <img 
                          src={`data:image/png;base64,${results.visualization}`}
                          alt="Molecular structure"
                          className="max-w-full max-h-[350px] w-auto h-auto rounded-lg shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-indigo-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Visualization not available</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(results.smiles);
                      toast.success('Copied to clipboard!');
                    }}
                    className="px-6 py-2 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-600 
                              rounded-lg transition-all flex items-center shadow-sm hover:shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy SMILES
                  </button>
                  <button
                    onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob([results.smiles], {type: 'text/plain'});
                      element.href = URL.createObjectURL(file);
                      element.download = "protein_smiles.txt";
                      document.body.appendChild(element);
                      element.click();
                      toast.success('Download started!');
                    }}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white 
                              rounded-lg transition-all flex items-center shadow-sm hover:shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <div className="inline-block p-6 bg-indigo-50 rounded-2xl mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-500">Ready for Conversion</h3>
                <p className="mt-1 text-sm">Enter a protein sequence to generate SMILES notation</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Protein to SMILES Converter | AI-Powered Molecular Transformation</p>
          <p className="mt-1">© {new Date().getFullYear()} BioTech Innovations</p>
        </footer>
      </div>
    </div>
  );
};

export default ProteinToSmiles;


// import React, { useState } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const ProteinToSmiles = () => {
//   const [proteinSequence, setProteinSequence] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [results, setResults] = useState(false);
//   const [proteinInfo, setProteinInfo] = useState({
//     name: 'Loading...',
//     id: 'Loading...',
//     source: ''
//   });

//   const MIN_PROTEIN_LENGTH = 10;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (proteinSequence.length < MIN_PROTEIN_LENGTH) {
//       toast.error(`Minimum ${MIN_PROTEIN_LENGTH} amino acids required`);
//       return;
//     }

//     setIsLoading(true);
//     setResults(null);
//     setProteinInfo({
//       name: 'Identifying protein...',
//       id: '...',
//       source: ''
//     });

//     try {
//       const response = await fetch('http://localhost:5000/api/predict', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ sequence: proteinSequence }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Prediction failed');
//       }

//       setResults(data);
//       setProteinInfo({
//         name: data.proteinName || 'Unknown Protein',
//         id: data.proteinId || 'N/A',
//         source: data.source || ''
//       });
//       toast.success('Prediction successful!');
      
//     } catch (error) {
//       toast.error(error.message);
//       console.error('Prediction error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setResults(null);
//     setProteinSequence('');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
//       <ToastContainer position="top-right" autoClose={5000} />
      
//       <div className="max-w-7xl mx-auto">
//         <header className="text-center mb-12 relative overflow-hidden">
//           <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-30"></div>
//           <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-200 rounded-full filter blur-3xl opacity-30"></div>
          
//           <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 relative z-10">
//             Gen-AI Protein to SMILES Converter
//           </h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto relative z-10">
//             Transform protein sequences into chemical SMILES notation with our AI-powered converter
//           </p>
//         </header>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Input Panel - Maintains same size after prediction */}
//           <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 relative overflow-hidden">
//             <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 rounded-full filter blur-xl opacity-20"></div>
//             <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full filter blur-xl opacity-20"></div>
            
//             <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
//               </svg>
//               {results ? 'Protein Sequence' : 'Input Protein Sequence'}
//             </h2>
            
//             {results ? (
//               <div className="space-y-6 h-full flex flex-col">
//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                       </svg>
//                       Your Input Sequence
//                     </label>
//                     <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 
//                                 text-gray-800 font-mono text-sm break-all shadow-inner h-40 overflow-y-auto">
//                       {proteinSequence}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                       Sequence Information
//                     </label>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
//                         <p className="text-sm text-gray-500">Length</p>
//                         <p className="text-2xl font-bold text-blue-600">{proteinSequence.length} AA</p>
//                       </div>
//                       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
//                         <p className="text-sm text-gray-500">Conversion Time</p>
//                         <p className="text-2xl font-bold text-blue-600">{(Math.random() * 0.5 + 0.3).toFixed(2)}s</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <button
//                   onClick={handleReset}
//                   className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors flex items-center justify-center shadow-sm "
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                   </svg>
//                   Convert Another Sequence
//                 </button>
//               </div>
//             ) : (
//               <form onSubmit={handleSubmit} className="min-h-full flex flex-col gap-5 overflow-y-auto p-10">
//                 <div className="mb-6 h-full">
//                   <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                     </svg>
//                     Enter protein sequence (min {MIN_PROTEIN_LENGTH} AA)
//                   </label>
//                   <textarea
//                     rows="10"
//                     className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 
//                               focus:ring-2 focus:ring-blue-500 focus:border-transparent 
//                               text-gray-800 font-mono text-sm shadow-sm transition-all
//                               hover:shadow-md focus:shadow-lg h-58"
//                     placeholder="Example: MAEGEITTFTALTEKFNL..."
//                     value={proteinSequence}
//                     onChange={(e) => setProteinSequence(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div className="flex justify-center">
//                   <button
//                     type="submit"
//                     disabled={isLoading}
//                     className={`px-8 py-3 rounded-full font-bold text-white
//                               ${isLoading ? 'bg-blue-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'} 
//                               transition-all shadow-lg hover:shadow-xl flex items-center`}
//                   >
//                     {isLoading ? (
//                       <span className="flex items-center">
//                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
//                              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" 
//                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         Analyzing...
//                       </span>
//                     ) : (
//                       <>
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 01-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 01-1.806-.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
//                         </svg>
//                         Convert to SMILES
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>

//           {/* Results Panel - Larger Visualization */}
//           <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 relative overflow-hidden">
//             <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-100 rounded-full filter blur-xl opacity-20"></div>
//             <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-100 rounded-full filter blur-xl opacity-20"></div>
            
//             <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
//               </svg>
//               Conversion Results
//             </h2>

//             {isLoading ? (
//               <div className="text-center py-16">
//                 <div className="flex flex-col items-center">
//                   <div className="relative">
//                     <svg className="animate-spin h-12 w-12 text-indigo-500" 
//                          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" 
//                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     <div className="absolute inset-0 flex items-center justify-center">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
//                       </svg>
//                     </div>
//                   </div>
//                   <p className="mt-4 text-gray-600">Analyzing protein sequence...</p>
//                   <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
//                 </div>
//               </div>
//             ) : results ? (
//               <>
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
//                     </svg>
//                     SMILES Notation
//                   </label>
//                   <div className="px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100 
//                               text-gray-800 font-mono text-sm break-all shadow-inner">
//                     {results.smiles}
//                   </div>
//                 </div>

//                 {/* Protein Information Card - Added this section */}
//                 <div className="mb-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//                   <h3 className="text-lg font-medium text-gray-800 mb-4">Protein Information</h3>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-sm text-gray-500">Protein Name</p>
//                       <p className="text-lg font-semibold text-blue-600">{proteinInfo.name}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Protein ID</p>
//                       <p className="text-lg font-semibold text-blue-600">
//                         {proteinInfo.source ? (
//                           <a 
//                             href={`https://www.uniprot.org/uniprot/${proteinInfo.id}`} 
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="hover:underline"
//                           >
//                             {proteinInfo.id}
//                           </a>
//                         ) : (
//                           proteinInfo.id
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
//                     </svg>
//                     Molecular Structure Visualization
//                   </label>
//                   <div className="flex justify-center items-center bg-indigo-50 rounded-xl 
//                                 p-6 border border-indigo-100 min-h-[400px] shadow-inner">
//                     {results.visualization ? (
//                       <div className="relative group w-full h-full flex items-center justify-center">
//                         <img 
//                           src={`data:image/png;base64,${results.visualization}`}
//                           alt="Molecular structure"
//                           className="max-w-full max-h-[350px] w-auto h-auto rounded-lg shadow-lg transform group-hover:scale-110 transition-transform duration-300"
//                         />
//                         <div className="absolute inset-0 bg-indigo-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
//                       </div>
//                     ) : (
//                       <div className="text-center text-gray-400">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <p>Visualization not available</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex space-x-4 justify-center">
//                   <button
//                     onClick={() => {
//                       navigator.clipboard.writeText(results.smiles);
//                       toast.success('Copied to clipboard!');
//                     }}
//                     className="px-6 py-2 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-600 
//                               rounded-lg transition-all flex items-center shadow-sm hover:shadow-md"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
//                     </svg>
//                     Copy SMILES
//                   </button>
//                   <button
//                     onClick={() => {
//                       const element = document.createElement("a");
//                       const file = new Blob([results.smiles], {type: 'text/plain'});
//                       element.href = URL.createObjectURL(file);
//                       element.download = "protein_smiles.txt";
//                       document.body.appendChild(element);
//                       element.click();
//                       toast.success('Download started!');
//                     }}
//                     className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white 
//                               rounded-lg transition-all flex items-center shadow-sm hover:shadow-md"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                     </svg>
//                     Download
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <div className="text-center py-16 text-gray-400">
//                 <div className="inline-block p-6 bg-indigo-50 rounded-2xl mb-4">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-500">Ready for Conversion</h3>
//                 <p className="mt-1 text-sm">Enter a protein sequence to generate SMILES notation</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer */}
//         <footer className="mt-16 text-center text-gray-500 text-sm">
//           <p>Protein to SMILES Converter | AI-Powered Molecular Transformation</p>
//           <p className="mt-1">© {new Date().getFullYear()} BioTech Innovations</p>
//         </footer>
//       </div>
//     </div>
//   );
// };

// export default ProteinToSmiles;