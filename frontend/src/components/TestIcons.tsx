import React from 'react';
import { XCircle, CheckCircle } from 'lucide-react';

const TestIcons: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Icon Test</h2>
      <div className="flex space-x-4">
        <XCircle size={24} className="text-red-500" />
        <CheckCircle size={24} className="text-green-500" />
      </div>
    </div>
  );
};

export default TestIcons;
