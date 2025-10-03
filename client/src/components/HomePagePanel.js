import React, { useRef, useState } from "react";
import Tooltip from "./Tooltip"; // adjust path as needed
import { Link } from "react-router-dom";

export default function HomePagePanel({
  title,
  description,
  buttonText,
  buttonAction,
  to,
  buttonDisabled = false,
  colorClass = "bg-patras-albescentWhite/20 border border-patras-albescentWhite",
  children,
  infoPopup,
  showInfoMark = false,
  infoMarkColor = "text-patras-buccaneer",
  infoPopupColor = "border-patras-buccaneer text-patras-buccaneer",
}) {
  const iconRef = useRef(null);
  const [openTip, setOpenTip] = useState(false);

  return (
    <div className={`${colorClass} rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col justify-between`}>
      <h3 className="text-lg font-semibold text-patras-buccaneer mb-3 flex items-center">
        {title}
        {showInfoMark && infoPopup && !buttonDisabled && (
          <>
            <button
              ref={iconRef}
              type="button"
              aria-label="Πληροφορίες"
              onMouseEnter={() => setOpenTip(true)}
              onMouseLeave={() => setOpenTip(false)}
              onFocus={() => setOpenTip(true)}
              onBlur={() => setOpenTip(false)}
              className="relative ml-2 inline-flex items-center justify-center"
            >
              <svg
                className={`w-4 h-4 ${infoMarkColor}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <circle cx="10" cy="10" r="10" />
                <text
                  x="10"
                  y="15"
                  textAnchor="middle"
                  fontSize="12"
                  fill="white"
                  fontFamily="Arial"
                >
                  i
                </text>
              </svg>
            </button>

            <Tooltip
              anchorRef={iconRef}
              open={openTip}
              className={`bg-white border ${infoPopupColor} text-xs px-2 py-1 rounded-lg shadow-lg whitespace-nowrap min-w-max`}
            >
              {infoPopup}
            </Tooltip>
          </>
        )}
      </h3>

      <p className="text-patras-buccaneer mb-4 flex items-center">{description}</p>
      {children}
      <div>
        {to && !buttonDisabled ? (
          <Link
            to={to}
            className="inline-flex items-center justify-center bg-patras-buccaneer text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors"
            style={{ width: "auto", minWidth: "unset" }}
          >
            {buttonText}
          </Link>
        ) : buttonDisabled ? (
          <button
            disabled
            className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed opacity-80"
            style={{ width: "auto", minWidth: "unset" }}
          >
            {buttonText}
          </button>
        ) : (
          <button
            onClick={buttonAction}
            className="bg-patras-buccaneer text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors"
            style={{ width: "auto", minWidth: "unset" }}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
