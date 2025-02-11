import React from "react";

export default function RadioButtons(props) {

    const radioButtonStyle = "h-4 w-4 rounded-full border-gray-300 text-patras-buccaneer focus:ring-2 focus:ring-patras-buccaneer focus:ring-offset-0";
    const labelStyle = "block text-sm/6 font-medium text-gray-900";

    return (
        <div>
            <label className={labelStyle}>{props.label}</label>
            <div className="mt-0 sm:mt-4 flex flex-row pb-2 lg:gap-x-9 gap-x-3 justify-start items-center">
                {props.radioButtons.map((option) => (
                    <div key={option.id} className="flex items-center gap-x-1">
                        <input
                            id={option.id}
                            label={props.name}
                            type="radio"
                            className={radioButtonStyle}
                            checked={props.value === option.value}
                            onChange={() => props.onChange(option.value)}
                        />
                        <label
                            htmlFor={option.id}
                            className={`text-sm font-medium text-gray-800`}
                        >
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}
