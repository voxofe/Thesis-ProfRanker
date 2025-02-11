import React from "react";

export default function InputField(props){

    const style = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-patras-buccaneer placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-patras-buccaneer focus:ring-patras-buccaneer focus:ring-offset-0 sm:text-sm/6";
    const disabledStyle = "opacity-50 cursor-not-allowed pointer-events-none"; 
    
    return(
        <div className={`${props.disabled ? disabledStyle : props.style } mb-4`}>
            <label htmlFor={props.id} className={`block text-sm/6 font-medium text-gray-900 ${props.style}`}>
                {props.label}
            </label>
            <div className="mt-2">
                {props.isDropdown ? 
                    <select
                        id={props.id}
                        name={props.name}
                        value={props.value}
                        onChange={(e) => props.onChange(e.target.value)}
                        className={style}  
                        
                    >
                        <option value="">Επιλέξτε...</option>
                        {props.optns.map((optn, index) => (
                            <option key={index} value={optn.value}>
                                {optn.label}
                            </option>
                        ))}
                    </select>
                    :
                    <input
                        id={props.id}
                        name={props.name}
                        type={props.type}
                        autoComplete={props.autoComplete}
                        min={props.min}
                        max={props.max}
                        value={props.value}
                        onChange={(e) => props.onChange(e.target.value)}
                        className={style}
                    />
                }

            </div>
        </div>
    );
}