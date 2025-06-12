"use client";

import { motion } from "motion/react";
import type { Variants } from "motion/react";

interface BadgeCheckProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
  stroke?: string;
}

const badgeVariants: Variants = {
  normal: {
    scale: 1,
  },
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
      delay: 0.2,
    },
  },
};

const checkVariants: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
    rotateY: 0,
  },
  animate: {
    pathLength: [1, 0.8, 1],
    opacity: [1, 0.8, 1],
    rotateY: [0, 180, 360],
    transition: {
      duration: 0.8,
      ease: "easeInOut",
      repeat: Infinity, // Loop indefinitely
      repeatType: "loop", // Starts from the beginning each time
      delay: 0.2, // A small delay before the first animation
    },
  },
};

const BadgeCheck = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#ffffff",
  ...props
}: BadgeCheckProps) => {
  return (
    <div
      style={{
        userSelect: "none",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 30 30"
        style={{ overflow: "visible" }}
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
          animate="animate"
          initial="normal"
        />
        <motion.path
          d="m9 12 2 2 4-4"
          variants={checkVariants}
          // animate="animate"
          initial="normal"
        />
      </svg>
    </div>
  );
};

export { BadgeCheck };
