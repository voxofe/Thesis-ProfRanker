import React from "react";

export default function Stepper({
  steps,
  currentStep,
  maxStepReached,
  onStepClick,
  canAccessStep,
}) {
  return (
    <div className="w-full my-5">
      <div className="relative">
        {/* Background connector line */}
        <div
          className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300"
          style={{ left: "2.5rem", right: "2.5rem" }}
        ></div>

        {/* Progress connector line */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-patras-buccaneer transition-all duration-300"
          style={{
            left: "2.5rem",
            width: `calc((${Math.max(0, currentStep - 1)} / ${
              steps.length - 1
            }) * (100% - 5rem))`,
          }}
        ></div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            const isVisited = stepNumber <= maxStepReached;
            const isAccessible = canAccessStep
              ? canAccessStep(stepNumber)
              : isVisited;

            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step Circle */}
                <button
                  onClick={() =>
                    isAccessible && onStepClick && onStepClick(stepNumber)
                  }
                  disabled={!isAccessible}
                  className={`
                    group relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-semibold bg-white transition-all duration-200
                    ${
                      isCompleted
                        ? "border-patras-buccaneer text-patras-buccaneer hover:bg-patras-buccaneer hover:text-white cursor-pointer"
                        : isActive
                        ? "border-patras-buccaneer text-patras-buccaneer hover:bg-patras-albescentWhite cursor-pointer"
                        : isAccessible
                        ? "border-patras-buccaneer text-patras-buccaneer hover:bg-patras-albescentWhite cursor-pointer"
                        : "border-gray-300 text-gray-500 cursor-not-allowed"
                    }
                    ${isAccessible ? "hover:scale-105" : ""}
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5 text-patras-buccaneer group-hover:text-white transition-colors duration-200"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </button>

                {/* Step Title */}
                <p
                  className={`
                    mt-2 text-xs font-medium text-center max-w-20
                    ${
                      isActive
                        ? "text-patras-buccaneer"
                        : isCompleted
                        ? "text-gray-700"
                        : isAccessible
                        ? "text-patras-buccaneer"
                        : "text-gray-500"
                    }
                  `}
                >
                  {step.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
