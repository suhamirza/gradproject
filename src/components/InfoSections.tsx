import { motion } from 'framer-motion';
import AnimatedSection from './ReactBits/AnimatedSection';
import AnimatedText from './ReactBits/AnimatedText';
import React from 'react';

interface InfoSectionsProps {
  id?: string;
  className?: string;
}

const InfoSections: React.FC<InfoSectionsProps> = ({ id, className }) => {
  return (
    <div id={id} className={className}>
      {/* Help section with left-rounded shape */}
      {React.createElement(
        AnimatedSection,
        {
          direction: "left" as const,
          className: "relative mb-16"
        },
        <motion.div 
          className="bg-[#360B4A] text-white p-12 rounded-l-full w-3/4 ml-auto"
          whileHover={{ 
            x: -10,
            boxShadow: "10px 10px 25px rgba(0, 0, 0, 0.2)",
            transition: { duration: 0.3 }
          }}
        >
          <motion.h2 
            className="text-2xl font-bold mb-4 ml-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <AnimatedText text="HOW CAN TASKIFY HELP YOU?" type="word" />
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="mb-2 ml-8">
            Taskify is a powerful cloud-based task management and collaboration platform
             built to streamline teamwork and boost productivity. Designed for modern teams,
            it offers real-time updates, seamless communication, and smart notifications to keep 
            everyone aligned and on track. With secure role-based access and high-performance 
            capabilities, Taskify ensures a smooth, reliable experience—whether you're 
            managing daily tasks or leading complex projects.
            </p>
        
          </motion.div>
        </motion.div>
      )}
      
      {/* Features section with right-rounded shape */}
      {React.createElement(
        AnimatedSection,
        {
          direction: "right" as const,
          className: "relative mb-16"
        },
        <motion.div 
          className="bg-[#360B4A] text-white p-12 rounded-r-full w-3/4 text-left"
          whileHover={{ 
            x: 10,
            boxShadow: "-10px 10px 25px rgba(0, 0, 0, 0.2)",
            transition: { duration: 0.3 }
          }}
        >
          <motion.h2 
            className="text-2xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <AnimatedText text="FEATURES OF TASKIFY" type="word" />
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="mb-2">
            <span class="font-bold">1. Real-Time Collaboration: </span>
            Instantly sync tasks with your team — every update is 
            visible in less than 5 seconds, keeping everyone aligned and productive.
            </p>
            <p>
            <span class="font-bold">2. Seamless Communication:</span>
            Chat in real-time without the delays. Stay connected and 
            work together smoothly, no matter where you are.
            </p>
            <p><span class="font-bold">3. Task Notifications That Matter: </span>
            Never miss a deadline or update. Get notified instantly with 95% success rate for timely alerts.
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default InfoSections; 