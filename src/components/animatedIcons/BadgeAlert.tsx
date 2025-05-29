"use client";

import { motion } from "motion/react"; // Removed useAnimation
import type { Variants } from "motion/react";

interface BadgeAlertProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
  stroke?: string;
}

const badgeVariants: Variants = {
  // 'normal' is still useful if you ever want to reset it manually
  normal: {
    scale: 1,
  },
  animate: {
    scale: [1, 1.1, 1], // Scales up and down
    transition: {
      duration: 1.5, // Make the overall duration longer for a smoother continuous loop
      ease: "easeInOut",
      repeat: Infinity, // Loop indefinitely
      repeatType: "loop", // Starts from the beginning each time
      delay: 0.2, // A small delay before the first animation
    },
  },
};

const alertVariants: Variants = {
  // 'normal' is still useful if you ever want to reset it manually
  normal: {
    pathLength: 1,
    opacity: 1,
    y: 0,
  },
  animate: {
    pathLength: [1, 0.8, 1], // Animates path drawing
    opacity: [1, 0.6, 1], // Fades out and in slightly
    y: [0, -2, 0], // Moves up and down
    transition: {
      duration: 1.5, // Match duration with badge for synchronization
      ease: "easeInOut",
      repeat: Infinity, // Loop indefinitely
      repeatType: "loop", // Starts from the beginning each time
      delay: 0.2, // A small delay before the first animation
    },
  },
};

const BadgeAlert = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#ffffff",
  ...props
}: BadgeAlertProps) => {
  // Removed useAnimation as it's no longer needed for continuous animation

  return (
    <div
      style={{
        // Removed hover styles/events as animation is continuous
        userSelect: "none",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      // Removed onMouseEnter and onMouseLeave
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <motion.path
          d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
          variants={badgeVariants}
          animate="animate" // Directly set to the 'animate' variant
          initial="normal" // Still good to define an initial state
        />
        <motion.g
          variants={alertVariants}
          animate="animate" // Directly set to the 'animate' variant
          initial="normal" // Still good to define an initial state
        >
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </motion.g>
      </svg>
    </div>
  );
};

export { BadgeAlert };