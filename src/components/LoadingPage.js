import React from "react";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/animations/Animation - 1732507904237.json"; // Path ke file JSON animasi

const LoadingPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center">
        <Lottie animationData={loadingAnimation} loop={true} className="w-40 h-40" />
        <p className="mt-4 text-blue-500 text-lg font-semibold">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingPage;
