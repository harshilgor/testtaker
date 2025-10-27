import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap } from 'lucide-react';

interface PointChangeIndicatorProps {
  points: number;
  previousPoints?: number;
  className?: string;
}

const PointChangeIndicator: React.FC<PointChangeIndicatorProps> = ({ 
  points, 
  previousPoints, 
  className = '' 
}) => {
  const [showChange, setShowChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState(0);

  useEffect(() => {
    if (previousPoints !== undefined && points !== previousPoints) {
      const change = points - previousPoints;
      setChangeAmount(change);
      setShowChange(true);
      
      // Hide the indicator after 3 seconds
      const timer = setTimeout(() => {
        setShowChange(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [points, previousPoints]);

  if (!showChange || changeAmount === 0) {
    return (
      <span className={`text-gray-900 font-semibold ${className}`}>
        {points.toLocaleString()}
      </span>
    );
  }

  const isPositive = changeAmount > 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';
  const icon = isPositive ? TrendingUp : Zap;

  return (
    <div className="flex items-center gap-2">
      <span className={`text-gray-900 font-semibold ${className}`}>
        {points.toLocaleString()}
      </span>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${bgColor} animate-pulse`}>
        {React.createElement(icon, { 
          className: `h-3 w-3 ${changeColor}` 
        })}
        <span className={`text-xs font-medium ${changeColor}`}>
          {isPositive ? '+' : ''}{changeAmount}
        </span>
      </div>
    </div>
  );
};

export default PointChangeIndicator;

