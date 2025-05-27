
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Minus, Square } from 'lucide-react';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ width: 280, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const calculatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      } else if (isResizing) {
        const newWidth = Math.max(250, resizeStart.width + (e.clientX - resizeStart.x));
        const newHeight = Math.max(350, resizeStart.height + (e.clientY - resizeStart.y));
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === calculatorRef.current || (e.target as HTMLElement).closest('.calculator-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const clearEntry = () => {
    setDisplay('0');
    setWaitingForNewValue(false);
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={calculatorRef}
      className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-xl select-none"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="calculator-header flex items-center justify-between p-3 bg-gray-50 border-b rounded-t-lg">
        <span className="font-medium text-gray-700">Calculator</span>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Display */}
      <div className="p-4">
        <div className="bg-gray-900 text-white text-right p-4 rounded text-2xl font-mono mb-4 min-h-[60px] flex items-center justify-end">
          {display}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" onClick={clear} className="bg-red-50 hover:bg-red-100">
            C
          </Button>
          <Button variant="outline" onClick={clearEntry} className="bg-yellow-50 hover:bg-yellow-100">
            CE
          </Button>
          <Button variant="outline" onClick={() => inputOperation('÷')} className="bg-blue-50 hover:bg-blue-100">
            ÷
          </Button>
          <Button variant="outline" onClick={() => inputOperation('×')} className="bg-blue-50 hover:bg-blue-100">
            ×
          </Button>

          <Button variant="outline" onClick={() => inputNumber('7')}>7</Button>
          <Button variant="outline" onClick={() => inputNumber('8')}>8</Button>
          <Button variant="outline" onClick={() => inputNumber('9')}>9</Button>
          <Button variant="outline" onClick={() => inputOperation('-')} className="bg-blue-50 hover:bg-blue-100">
            -
          </Button>

          <Button variant="outline" onClick={() => inputNumber('4')}>4</Button>
          <Button variant="outline" onClick={() => inputNumber('5')}>5</Button>
          <Button variant="outline" onClick={() => inputNumber('6')}>6</Button>
          <Button variant="outline" onClick={() => inputOperation('+')} className="bg-blue-50 hover:bg-blue-100">
            +
          </Button>

          <Button variant="outline" onClick={() => inputNumber('1')}>1</Button>
          <Button variant="outline" onClick={() => inputNumber('2')}>2</Button>
          <Button variant="outline" onClick={() => inputNumber('3')}>3</Button>
          <Button variant="outline" onClick={performCalculation} className="bg-green-50 hover:bg-green-100 row-span-2">
            =
          </Button>

          <Button variant="outline" onClick={() => inputNumber('0')} className="col-span-2">
            0
          </Button>
          <Button variant="outline" onClick={inputDecimal}>.</Button>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 bg-gray-300 cursor-se-resize"
        onMouseDown={handleResizeMouseDown}
        style={{
          borderRadius: '0 0 8px 0',
          background: 'linear-gradient(-45deg, transparent 30%, #9ca3af 30%, #9ca3af 70%, transparent 70%)'
        }}
      />
    </div>
  );
};

export default Calculator;
