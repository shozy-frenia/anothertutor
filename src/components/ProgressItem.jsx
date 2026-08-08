import React from 'react';

const ProgressItem = ({ percent }) => {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
      <div
        className="h-full bg-green-500 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
};

export default ProgressItem;
