
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SATMockTest from '@/components/SATMockTest';

const SATMockTestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-purple-50">
      <SATMockTest 
        userName="User" 
        onBack={() => navigate('/')}
      />
    </div>
  );
};

export default SATMockTestPage;
