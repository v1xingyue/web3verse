import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import NotePanel from "./note-panel";

const basePos = `plasmo-fixed plasmo-bottom-16	plasmo-right-12`;

const App = () => {
  const [display, updateDisplay] = useState(false);
  const queryClient = new QueryClient();

  const toggleDisplay = () => {
    updateDisplay(!display);
  };

  return display ? (
    <QueryClientProvider client={queryClient}>
      <div
        className={`plasmo-card plasmo-bg-base-200 plasmo-shadow-xl plasmo-w-1/2 ${basePos}`}
      >
        <div className="plasmo-card-body">
          <div className="plasmo-card-actions plasmo-justify-end">
            <button
              className="plasmo-btn plasmo-btn-square plasmo-btn-sm"
              onClick={toggleDisplay}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="plasmo-h-6 plasmo-w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <NotePanel />
        </div>
      </div>
    </QueryClientProvider>
  ) : (
    <div className={`plasmo-float-end ${basePos}`}>
      <button onClick={toggleDisplay} className="plasmo-btn plasmo-mt-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className="humbleicons hi-document animation"
        >
          <g
            xmlns="http://www.w3.org/2000/svg"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <path d="M5 20V4a1 1 0 011-1h6.172a2 2 0 011.414.586l4.828 4.828A2 2 0 0119 9.828V20a1 1 0 01-1 1H6a1 1 0 01-1-1z" />
            <path d="M12 3v6a1 1 0 001 1h6" />
          </g>
        </svg>
      </button>
    </div>
  );
};

export default App;
