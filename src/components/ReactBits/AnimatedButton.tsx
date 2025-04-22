import { motion } from 'framer-motion';
import React from 'react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  color?: string;
  hoverColor?: string;
  type?: 'button' | 'submit' | 'reset';
}

const AnimatedButton = ({ 
  children, 
  className = '', 
  onClick, 
  color = "#4A1762", 
  hoverColor = "#6B2A8A",
  type = 'button' 
}: AnimatedButtonProps) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      style={{ backgroundColor: color }}
      className={`px-6 py-2 rounded-xl text-white ${className}`}
      whileHover={{ 
        backgroundColor: hoverColor,
        scale: 1.05,
        boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)"
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton; 