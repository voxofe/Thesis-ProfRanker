// Custom Tooltip Component
import { useState } from "react";

const Tooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });

    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a delay before showing the tooltip
    const newTimeoutId = setTimeout(() => {
      setShouldRender(true);
      // Small delay to ensure the element is rendered before fading in
      setTimeout(() => setIsVisible(true), 10);
    }, 300); // 0.3 second delay

    setTimeoutId(newTimeoutId);
  };

  const handleMouseLeave = () => {
    // Clear the timeout if mouse leaves before tooltip appears
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
    // Hide the element after the animation completes
    setTimeout(() => setShouldRender(false), 200);
  };

  return (
    <>
      <div
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {shouldRender && (
        <div
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: position.x,
            top: position.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div
            className={`px-3 py-2 text-sm text-gray-800 bg-gray-100 bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg w-64 max-w-xs border border-gray-200 transition-opacity duration-200 ease-out ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative">
              {content}
              {/* Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-100"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tooltip;
