"use client";

import React, { useState, useEffect } from "react";
import { FaArrowAltCircleUp } from "react-icons/fa";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40 animate-fade-in-up"
          aria-label="Scroll to top"
        >
          <div className="relative">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-primary opacity-20 blur-lg rounded-full"></div>
            {/* Button */}
            <div className="relative bg-transparent backdrop-blur-md border-2 border-primary/30 hover:border-primary/60 text-primary w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer">
              <FaArrowAltCircleUp size={20} />
            </div>
          </div>
        </button>
      )}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ScrollToTop;
