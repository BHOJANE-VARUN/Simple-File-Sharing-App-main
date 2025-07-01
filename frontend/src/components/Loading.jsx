import React from "react";

function Loading() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default Loading;
