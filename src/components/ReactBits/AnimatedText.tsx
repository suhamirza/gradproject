import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  staggerChildren?: number;
  duration?: number;
  type?: 'word' | 'letter';
  delay?: number;
}

const AnimatedText = ({ 
  text, 
  className = '', 
  staggerChildren = 0.03,
  duration = 0.5,
  type = 'letter',
  delay = 0
}: AnimatedTextProps) => {
  
  // Split text into letters or words
  const items = type === 'letter'
  ? Array.from(text)
  : text.split(' ').flatMap((word, i, arr) =>
      i < arr.length - 1
        ? [word, '\u00A0']
        : [word]
    );

  // Animation variants for container and items
  const containerVariants = {
    hidden: {},
    visible: (i = 1) => ({
      transition: {
        staggerChildren,
        delayChildren: delay
      }
    })
  };

  const childVariants = {
    hidden: {
      y: 20,
      opacity: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration
      }
    }
  };

  return (
    <motion.div
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {items.map((item, index) => (
        <motion.span
          key={index}
          variants={childVariants}
          className="inline-block"
          style={{ 
            whiteSpace: type === 'letter' ? 'pre' : 'normal',
            display: 'inline-block'
          }}
        >
          {item}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default AnimatedText; 