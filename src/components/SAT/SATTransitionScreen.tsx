
import React from 'react';

const SATTransitionScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">Analyzing your performance...</h2>
        <p className="text-indigo-200">Preparing your next module</p>
      </div>
    </div>
  );
};

export default SATTransitionScreen;
