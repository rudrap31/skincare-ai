import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
import Navbar from "./Navbar";

const Dashboard = () => {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState('scanner');

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto p-4">
        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <button 
            className={`tab ${activeTab === 'scanner' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('scanner')}
          >
            Product Scanner
          </button>
          <button 
            className={`tab ${activeTab === 'routine' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('routine')}
          >
            Routine Analyzer
          </button>
          <button 
            className={`tab ${activeTab === 'analyzer' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('analyzer')}
          >
            Face Analyzer
          </button>
        </div>

        {/* Tab Content */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {activeTab === 'scanner' && <ProductScanner />}
            {activeTab === 'routine' && <RoutineAnalyzer />}
            {activeTab === 'analyzer' && <FaceAnalyzer />}
          </div>
        </div>
      </main>
    </div>
  );
};

// Product Scanner Component
const ProductScanner = () => {
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = () => {
    setScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setScanning(false);
      setResult({
        name: "Sample Product",
        rating: 4.5,
        ingredients: ["Water", "Glycerin", "Niacinamide"],
        analysis: "This product is good for your skin type. It contains niacinamide which helps with texture and tone."
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-4">Product Scanner</h2>
      <p className="text-center mb-6">Scan a product barcode to get an AI-powered rating and analysis</p>
      
      <div className="w-full max-w-md mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter barcode manually"
            className="input input-bordered flex-1"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
          <button 
            className="btn btn-primary"
            onClick={handleScan}
            disabled={scanning}
          >
            {scanning ? 'Scanning...' : 'Scan'}
          </button>
        </div>
      </div>

      {scanning && (
        <div className="flex flex-col items-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-2">Scanning product...</p>
        </div>
      )}

      {result && !scanning && (
        <div className="w-full max-w-md">
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title">{result.name}</h3>
              <div className="flex items-center gap-2">
                <span>Rating:</span>
                <div className="rating rating-sm">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <input
                      key={star}
                      type="radio"
                      name="rating-2"
                      className="mask mask-star-2 bg-orange-400"
                      checked={star <= Math.round(result.rating)}
                      readOnly
                    />
                  ))}
                </div>
                <span>{result.rating}/5</span>
              </div>
              <div className="mt-2">
                <h4 className="font-semibold">Key Ingredients:</h4>
                <ul className="list-disc list-inside">
                  {result.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <h4 className="font-semibold">Analysis:</h4>
                <p>{result.analysis}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Routine Analyzer Component
const RoutineAnalyzer = () => {
  const [morningProducts, setMorningProducts] = useState([]);
  const [nightProducts, setNightProducts] = useState([]);
  const [newProduct, setNewProduct] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const addProduct = (routine) => {
    if (!newProduct.trim()) return;
    
    if (routine === 'morning') {
      setMorningProducts([...morningProducts, newProduct]);
    } else {
      setNightProducts([...nightProducts, newProduct]);
    }
    setNewProduct('');
  };

  const removeProduct = (product, routine) => {
    if (routine === 'morning') {
      setMorningProducts(morningProducts.filter(p => p !== product));
    } else {
      setNightProducts(nightProducts.filter(p => p !== product));
    }
  };

  const analyzeRoutine = () => {
    if (morningProducts.length === 0 && nightProducts.length === 0) {
      toast.error('Please add at least one product to your routine');
      return;
    }

    setAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysis({
        rating: 3.8,
        feedback: "Your routine is generally good, but could be improved. Consider adding a vitamin C serum in the morning for better protection against environmental damage. Your night routine is well-balanced with proper hydration and treatment products.",
        suggestions: [
          "Add a vitamin C serum in the morning",
          "Consider using a retinol product 2-3 times per week",
          "Make sure to apply sunscreen daily"
        ]
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-semibold mb-4">Routine Analyzer</h2>
      <p className="mb-6">Add your skincare products to get a personalized analysis of your routine</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Morning Routine */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title">Morning Routine</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add product"
                className="input input-bordered flex-1"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
              />
              <button 
                className="btn btn-primary"
                onClick={() => addProduct('morning')}
              >
                Add
              </button>
            </div>
            <ul className="space-y-2">
              {morningProducts.map((product, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{product}</span>
                  <button 
                    className="btn btn-xs btn-ghost"
                    onClick={() => removeProduct(product, 'morning')}
                  >
                    Remove
                  </button>
                </li>
              ))}
              {morningProducts.length === 0 && (
                <li className="text-gray-500 italic">No products added</li>
              )}
            </ul>
          </div>
        </div>

        {/* Night Routine */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title">Night Routine</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add product"
                className="input input-bordered flex-1"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
              />
              <button 
                className="btn btn-primary"
                onClick={() => addProduct('night')}
              >
                Add
              </button>
            </div>
            <ul className="space-y-2">
              {nightProducts.map((product, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{product}</span>
                  <button 
                    className="btn btn-xs btn-ghost"
                    onClick={() => removeProduct(product, 'night')}
                  >
                    Remove
                  </button>
                </li>
              ))}
              {nightProducts.length === 0 && (
                <li className="text-gray-500 italic">No products added</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button 
          className="btn btn-primary"
          onClick={analyzeRoutine}
          disabled={analyzing}
        >
          {analyzing ? 'Analyzing...' : 'Analyze Routine'}
        </button>
      </div>

      {analyzing && (
        <div className="flex flex-col items-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-2">Analyzing your routine...</p>
        </div>
      )}

      {analysis && !analyzing && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title">Routine Analysis</h3>
            <div className="flex items-center gap-2 mb-4">
              <span>Overall Rating:</span>
              <div className="rating rating-sm">
                {[1, 2, 3, 4, 5].map((star) => (
                  <input
                    key={star}
                    type="radio"
                    name="rating-3"
                    className="mask mask-star-2 bg-orange-400"
                    checked={star <= Math.round(analysis.rating)}
                    readOnly
                  />
                ))}
              </div>
              <span>{analysis.rating}/5</span>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold">Feedback:</h4>
              <p>{analysis.feedback}</p>
            </div>
            <div>
              <h4 className="font-semibold">Suggestions:</h4>
              <ul className="list-disc list-inside">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Face Analyzer Component
const FaceAnalyzer = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFace = () => {
    if (!image) {
      toast.error('Please upload an image first');
      return;
    }

    setAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysis({
        overall: 3.5,
        metrics: [
          { name: 'Redness', score: 2.5, comment: 'Mild redness detected' },
          { name: 'Texture', score: 3.0, comment: 'Some uneven texture' },
          { name: 'Acne', score: 4.0, comment: 'Minimal acne present' },
          { name: 'Hydration', score: 3.5, comment: 'Skin appears moderately hydrated' }
        ],
        recommendations: [
          "Consider using a gentle exfoliant 1-2 times per week",
          "Add a hydrating serum to your routine",
          "Use products with niacinamide to reduce redness"
        ]
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-4">Face Analyzer</h2>
      <p className="text-center mb-6">Upload a photo of your face to get an AI-powered skin analysis</p>
      
      <div className="w-full max-w-md mb-6">
        <div className="flex flex-col items-center">
          {preview ? (
            <div className="relative w-64 h-64 mb-4">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover rounded-lg"
              />
              <button 
                className="btn btn-circle btn-xs absolute top-2 right-2"
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="btn btn-outline btn-primary mb-4">
              Upload Photo
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
        
        <button 
          className="btn btn-primary w-full"
          onClick={analyzeFace}
          disabled={analyzing || !image}
        >
          {analyzing ? 'Analyzing...' : 'Analyze Skin'}
        </button>
      </div>

      {analyzing && (
        <div className="flex flex-col items-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-2">Analyzing your skin...</p>
        </div>
      )}

      {analysis && !analyzing && (
        <div className="w-full max-w-md">
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title">Skin Analysis</h3>
              <div className="flex items-center gap-2 mb-4">
                <span>Overall Rating:</span>
                <div className="rating rating-sm">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <input
                      key={star}
                      type="radio"
                      name="rating-4"
                      className="mask mask-star-2 bg-orange-400"
                      checked={star <= Math.round(analysis.overall)}
                      readOnly
                    />
                  ))}
                </div>
                <span>{analysis.overall}/5</span>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold">Metrics:</h4>
                <div className="space-y-2">
                  {analysis.metrics.map((metric, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{metric.name}:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${(metric.score / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span>{metric.score}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold">Recommendations:</h4>
                <ul className="list-disc list-inside">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 