import React from 'react';
import { motion } from 'framer-motion';
import "./GradientText.css";

interface GradientTextProps {
    children: React.ReactNode;
    className?: string;
    colors: string[];
    animationSpeed?: number;
    showBorder?: boolean;
}

const GradientText: React.FC<GradientTextProps> = ({
    children,
    className = "",
    colors,
    animationSpeed = 3,
    showBorder = false,
}) => {
    const gradientStyle = {
        backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
        animationDuration: `${animationSpeed}s`,
    };

    return (
        <motion.span
            className={`bg-clip-text text-transparent inline-block ${className}`}
            animate={{
                backgroundPosition: ['0% center', '100% center', '0% center'],
            }}
            transition={{
                duration: animationSpeed,
                ease: 'linear',
                repeat: Infinity,
            }}
            style={{
                backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
                backgroundSize: '200%',
            }}
        >
            {showBorder && <span className="gradient-overlay" style={gradientStyle}></span>}
            <span className="text-content" style={gradientStyle}>{children}</span>
        </motion.span>
    );
};

export default GradientText;
