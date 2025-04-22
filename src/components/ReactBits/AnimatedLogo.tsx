import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  src: string;
  alt: string;
  className?: string;
}

const AnimatedLogo = ({ src, alt, className = 'w-24' }: AnimatedLogoProps) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.05,
        rotate: [0, -1, 1, -1, 0],
        transition: { 
          duration: 0.5, 
          rotate: { repeat: 0, duration: 0.3 } 
        }
      }}
    >
      <motion.img 
        src={src} 
        alt={alt} 
        className="w-full" 
        drag
        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
        dragElastic={0.1}
      />
    </motion.div>
  );
};

export default AnimatedLogo; 