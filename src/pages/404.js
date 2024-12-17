import React from "react";

const Page404 = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        {/* Video Animation */}
        <video
          autoPlay
          loop
          muted
          className="w-40 h-40 mb-6"
        >
          <source
            src={require("../assets/animations/Animation - 1732503668026.mp4")} // Path ke file animasi video
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Text Section */}
        <h1 className="text-4xl font-semibold text-gray-800 mb-2">404</h1>
        <p className="text-lg text-gray-600 mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>

        {/* Back to Home Button */}
        <a
          href="/"
          className="w-full bg-purple-600 text-white text-center py-2 rounded-lg shadow hover:bg-purple-700 transition duration-300"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default Page404;
