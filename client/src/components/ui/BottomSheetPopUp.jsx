import React, { useEffect, useState, useRef } from "react";

const BottomSheetPopUp = ({ isOpen, onClose, children }) => {
  const [sheetHeight, setSheetHeight] = useState(0); // Initially no height
  const sheetRef = useRef(null);
  const observerRef = useRef(null);

  // Function to update the height dynamically based on content size
  const updateSheetHeight = () => {
    if (sheetRef.current) {
      const contentHeight = sheetRef.current.scrollHeight;
      const maxHeight = window.innerHeight * 0.9; // 90% of viewport height
      setSheetHeight(Math.min(contentHeight, maxHeight));
    }
  };

  // Set height based on content and window size when the sheet opens or children change
  useEffect(() => {
    if (isOpen) {
      updateSheetHeight();
    }
  }, [isOpen, children]); // Recalculate height if children change

  // Observe DOM mutations (e.g., if content changes dynamically)
  useEffect(() => {
    if (sheetRef.current) {
      // Create a MutationObserver to observe content changes
      observerRef.current = new MutationObserver(() => {
        updateSheetHeight(); // Recalculate height on DOM mutations
      });

      observerRef.current.observe(sheetRef.current, {
        childList: true, // Listen for changes in child elements
        subtree: true, // Observe the entire subtree
        characterData: true, // Listen for text content changes
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect(); // Clean up observer when component unmounts
      }
    };
  }, [isOpen]); // Only observe when the sheet is open

  // Prevent background scrolling when the bottom sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center w-full md:px-[50px]">
          {/* Background overlay */}
          <div
            className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm"
            onClick={onClose} // Close when clicked outside
          />

          {/* Bottom Sheet Container */}
          <div
            ref={sheetRef}
            className="w-full max-w-screen bg-white rounded-t-[40px] shadow-lg z-50 transform transition-transform duration-300 ease-out"
            style={{
              height: `${sheetHeight}px`,
              maxHeight: "90vh", // Ensure sheet does not exceed 90% of the viewport height
              overflowY: "auto", // Allow scrolling if content overflows
            }}
          >
            {/* Drag Handle */}
            <div className="w-full h-8 cursor-grab flex justify-center items-center">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Content */}
            <div className="px-4 py-2 mb-5">{children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomSheetPopUp;
