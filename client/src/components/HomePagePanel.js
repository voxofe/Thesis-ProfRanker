import React from "react";

export default function HomePagePanel({
  title,
  description,
  buttonText,
  buttonAction,
  buttonDisabled = false,
  colorClass = "bg-patras-albescentWhite/20 border border-patras-albescentWhite",
  children,
  infoPopup,
  showInfoMark = false,
  infoMarkColor = "text-patras-buccaneer",
  infoPopupColor = "border-patras-buccaneer text-patras-buccaneer",
}) {
  return (
    <div className={`${colorClass} rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col justify-between`}>
      <h3 className="text-lg font-semibold text-patras-buccaneer mb-3 flex items-center">
        {title}
        {showInfoMark && infoPopup && (
          <span className="relative group ml-2">
            <svg
              className={`w-4 h-4 ${infoMarkColor} cursor-pointer`}
              fill="currentColor"
              viewBox="0 0 20 20"
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
            <span className={`absolute left-6 top-1 z-10 hidden group-hover:flex flex-col bg-white border ${infoPopupColor} text-xs px-2 py-1 rounded-lg shadow-lg whitespace-nowrap min-w-max`}>
              {infoPopup}
            </span>
          </span>
        )}
      </h3>
      <p className="text-patras-buccaneer mb-4 flex items-center">{description}</p>
      {children}
      <div>
        <button
          onClick={buttonAction}
          disabled={buttonDisabled}
          className={
            buttonDisabled
              ? "bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed opacity-80"
              : "bg-patras-buccaneer text-white px-4 py-2 rounded-md hover:bg-patras-sanguineBrown transition-colors"
          }
          style={{ width: "auto", minWidth: "unset" }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}