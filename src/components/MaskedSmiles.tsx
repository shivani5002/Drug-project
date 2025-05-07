import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const MaskedSmiles = () => {
  const [smiles, setSmiles] = useState<string>("");
  const [predictions, setPredictions] = useState<Array<{token: string, probability: number}>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'predict' | 'examples'>('predict');
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePredict = async () => {
    if (!smiles.includes("<mask>")) {
      setError("SMILES must contain <mask> token");
      return;
    }
  
    setLoading(true);
    setError("");
    setPredictions([]);
  
    try {
      const response = await fetch("http://localhost:5000/api/predict-smiles", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ smiles }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      if (!data?.predictions) {
        throw new Error("Invalid response format from server");
      }
      
      setPredictions(data.predictions);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Prediction failed: ${message}`);
      console.error("API Error:", {
        error: err,
        input: smiles,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const exampleSmiles = [
    { input: "CCO<mask>", description: "Predict the end of ethanol" },
    { input: "C1CC<mask>CC1", description: "Complete the cyclohexane ring" },
    { input: "NC(=O)<mask>", description: "Finish the amide group" },
    { input: "C<mask>Br", description: "Predict middle atom in bromoalkane" },
  ];

  const handleUsePrediction = (token: string) => {
    if (smiles.includes("<mask>")) {
      const newSmiles = smiles.replace("<mask>", token);
      setSmiles(newSmiles);
      setPredictions([]);
    }
  };

  const handleExampleClick = (example: string) => {
    setSmiles(example);
    setSelectedExample(example);
    setActiveTab('predict');
    setPredictions([]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <Header />
      </header>
      
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Background elements */}
        <div className="fixed inset-0 overflow-hidden -z-10 opacity-10">
          <div className="absolute top-1/4 left-1/4 animate-float">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle cx="50" cy="50" r="30" stroke="#4F46E5" strokeWidth="2" fill="none" />
              <circle cx="100" cy="100" r="30" stroke="#4F46E5" strokeWidth="2" fill="none" />
              <circle cx="150" cy="50" r="30" stroke="#4F46E5" strokeWidth="2" fill="none" />
              <line x1="80" y1="50" x2="120" y2="100" stroke="#4F46E5" strokeWidth="2" />
              <line x1="120" y1="50" x2="80" y2="100" stroke="#4F46E5" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="relative z-10">
          {/* Main heading */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                MaskedSMILES Predictor
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover missing molecular fragments with AI-powered predictions
            </p>
          </div>

          {/* Main card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200/70">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`px-8 py-5 font-medium text-sm flex-1 text-center transition-all ${activeTab === 'predict' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('predict')}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Prediction
                </div>
              </button>
              <button
                className={`px-8 py-5 font-medium text-sm flex-1 text-center transition-all ${activeTab === 'examples' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('examples')}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  Examples
                </div>
              </button>
            </div>

            {/* Tab content */}
            <div className="p-8">
              {activeTab === 'predict' && (
                <>
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-gray-700 font-medium text-lg">
                        SMILES Input (Alzheimer disease):
                      </label>
                      {selectedExample && (
                        <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Example: {selectedExample}
                        </span>
                      )}
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={smiles}
                        onChange={(e) => {
                          setSmiles(e.target.value);
                          setSelectedExample(null);
                        }}
                        placeholder="Enter SMILES with <mask> token..."
                        className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-mono bg-white/70"
                      />
                      {smiles && (
                        <button
                          onClick={() => {
                            setSmiles("");
                            setSelectedExample(null);
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {error && (
                      <div className="mt-3 px-4 py-3 bg-red-50/80 text-red-600 rounded-lg text-sm flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center mb-6">
                    <button
                      onClick={handlePredict}
                      disabled={loading || !smiles.includes("<mask>")}
                      className={`px-10 py-5 rounded-xl font-bold text-lg transition-all relative overflow-hidden group ${loading 
                        ? 'bg-indigo-400 cursor-not-allowed' 
                        : !smiles.includes("<mask>") 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'}`}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Predicting...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Predict Missing Fragment
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'examples' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {exampleSmiles.map((example, index) => (
                    <div 
                      key={index} 
                      className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-colors cursor-pointer group hover:shadow-md bg-white/50"
                      onClick={() => handleExampleClick(example.input)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-indigo-100 text-indigo-800 rounded-lg p-3 flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 mb-2 font-mono text-lg group-hover:text-indigo-600 transition-colors">
                            {example.input}
                          </h4>
                          <p className="text-gray-600">{example.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {predictions.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Prediction Results
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {predictions.map((pred, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-4xl font-bold text-indigo-600 font-mono">
                            {pred.token}
                          </span>
                          <span className="text-sm font-medium px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Confidence</span>
                            <span>{(pred.probability * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${pred.probability * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={() => handleUsePrediction(pred.token)}
                            className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            Use This Prediction
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div> 
  );
};

export default MaskedSmiles;