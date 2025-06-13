
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Marathon from '@/components/Marathon';
import MarathonSettings from '@/components/MarathonSettings';
import { MarathonSettings as MarathonSettingsType } from '@/types/marathon';

const MarathonPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session, loading } = useAuth();
  const [marathonSettings, setMarathonSettings] = useState<MarathonSettingsType | null>(
    location.state?.marathonSettings || null
  );
  const [showSettings, setShowSettings] = useState(!marathonSettings);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && (!user || !session)) {
      navigate('/');
    }
  }, [user, session, loading, navigate]);

  // Set body styles for full-screen mode
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  const handleMarathonSettingsComplete = (settings: MarathonSettingsType) => {
    setMarathonSettings(settings);
    setShowSettings(false);
  };

  const handleEndMarathon = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !session) {
    return null;
  }

  if (showSettings) {
    return (
      <div className="fixed inset-0 bg-gray-50">
        <MarathonSettings
          onStart={handleMarathonSettingsComplete}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50">
      <Marathon 
        settings={marathonSettings}
        onBack={handleBack}
        onEndMarathon={handleEndMarathon}
      />
    </div>
  );
};

export default MarathonPage;
