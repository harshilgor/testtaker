import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

interface ConfettiAnimationProps {
  trigger: boolean;
  onComplete?: () => void;
}

const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({ trigger, onComplete }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (trigger) {
      setShowConfetti(true);
      
      // Hide confetti after animation duration
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, 3000); // 3 seconds of confetti

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!showConfetti) return null;

  return (
    <Confetti
      width={windowDimensions.width}
      height={windowDimensions.height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.3}
      initialVelocityY={20}
      colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']}
    />
  );
};

export default ConfettiAnimation;

