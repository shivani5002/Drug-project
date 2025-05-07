import React, { useState } from "react";
import axios from "axios";
import { FlaskRound, Award } from "lucide-react";

const commonMolecules = [
  { name: "Aspirin", smiles: "CC(=O)OC1=CC=CC=C1C(=O)O" },
  { name: "Caffeine", smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C" },
  { name: "Ibuprofen", smiles: "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O" },
];

const DrugGenerator = () => {
  const [inputData, setInputData] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!inputData.trim()) {
      setError("Please enter a valid SMILES string");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(
        "http://localhost:5000/api/drug/generate",
        { SMILES: inputData },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data?.top_results) {
        // Sort by Reward (descending) before setting state
        const sortedResults = [...response.data.top_results].sort((a, b) => b.Reward - a.Reward);
        setResults(sortedResults);
      } else {
        setError("No results returned");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Generation failed");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          De-novo Drug Generator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Generate novel drug molecules using reinforcement learning
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input SMILES
            </label>
            <div className="flex gap-2">
              <select
                onChange={(e) => setInputData(e.target.value)}
                className="flex-shrink-0 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Examples</option>
                {commonMolecules.map((mol, i) => (
                  <option key={i} value={mol.smiles}>{mol.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="Enter SMILES (e.g., CCO)"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center"
              >
                {isLoading ? "Generating..." : "Generate"}
                <FlaskRound className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        {error && (
          <div className="mt-4 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Generated Molecules (Sorted by Reward)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, i) => (
              <div 
                key={i} 
                className={`relative bg-white rounded-xl shadow-md overflow-hidden border ${
                  i === 0 ? 'border-2 border-yellow-400 ring-2 ring-yellow-200' : 'border-gray-100'
                }`}
              >
                {i === 0 && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-1">
                    <Award className="h-5 w-5" />
                  </div>
                )}
                <div className="p-4 bg-gray-50 flex justify-center">
                  <img 
                    src={`data:image/png;base64,${result.image}`}
                    alt="Generated molecule"
                    className="h-48 w-full object-contain"
                  />
                </div>
                <div className="p-5">
                  <div className="flex justify-between mb-3">
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      i === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-50 text-blue-600'
                    }`}>
                      #{i+1} {i === 0 && "(Best Reward)"}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      Reward: {result.Reward.toFixed(4)}
                    </span>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-1">SMILES</h3>
                    <div className="bg-gray-50 p-2 rounded font-mono text-sm overflow-x-auto">
                      {result.SMILES}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">pIC50:</span>
                      <span className="ml-1 font-medium">{result.pIC50.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">LogP:</span>
                      <span className="ml-1 font-medium">{result.LogP.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugGenerator;