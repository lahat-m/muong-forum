import React from 'react';

const Button = ({ children, type = 'button', onClick, className = '', ...props }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-400 active:bg-blue-700 transition ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
