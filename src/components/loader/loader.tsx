import icon from "@/assets/optiextract_logo.png"; // Make sure this path is correct

import React from "react";

const Loader: React.FC = () => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh', // Take full viewport height
                backgroundColor: '#f8fafc', // A light background color, adjust to your theme
                color: '#7c3aed', // Your brand color for the spinner/text
                fontSize: '1.2em',
                flexDirection: 'column',
                gap: '15px', // Increased gap for better spacing
            }}
        >
            {/* Use a standard <img> tag for your PNG logo */}
            <img
                src={icon}
                alt="OptiExtract Logo"
                style={{
                    width: '60px', // Adjust size as needed
                    height: '60px', // Adjust size as needed
                    animation: 'spin 1.5s linear infinite', // Apply spin animation to the image
                }}
            />

            {/* Display the brand name */}
            <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}> {/* Adjusted font size */}
                Opti<span style={{ color: '#7c3aed' }}>Extract</span>
            </div>

            {/* Loading text */}
            <div style={{ fontSize: '1em', color: '#666' }}>
                Loading session...
            </div>

            {/* The CSS for the spin animation */}
            <style>
                {`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                `}
            </style> {/* <-- This was the missing closing tag */}
        </div>
    );
};

export default Loader;