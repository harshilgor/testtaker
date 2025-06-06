import React from 'react';
import { MarathonSettings } from '../../types/marathon';

interface FontSizeSelectionProps {
  settings: MarathonSettings;
  onSettingsChange: (settings: MarathonSettings) => void;
}

// This component is now deprecated and should not be used
// Keeping for compatibility but it renders nothing
const FontSizeSelection: React.FC<FontSizeSelectionProps> = () => {
  return null;
};

export default FontSizeSelection;
