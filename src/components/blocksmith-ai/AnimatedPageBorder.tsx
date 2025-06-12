
'use client';

import type { FunctionComponent } from 'react';

const AnimatedPageBorder: FunctionComponent = () => {
  return (
    <>
      <div className="animated-page-border top-border" />
      <div className="animated-page-border bottom-border" />
      <style jsx global>{`
        .animated-page-border {
          position: fixed;
          left: 0;
          width: 100%;
          height: 3px; /* Thickness of the border */
          z-index: 50; /* Ensure it's above most content but below modals/toasts */
          background-image: linear-gradient(
            to right,
            hsl(var(--primary)),      /* Electric Blue */
            hsl(var(--accent)),       /* Bright Yellow */
            hsl(var(--tertiary)),     /* Vibrant Purple */
            hsl(var(--primary))       /* Electric Blue - to make the loop seamless */
          );
          background-size: 200% auto; /* Gradient is twice as wide as the container */
          animation: scroll-gradient-animation 6s linear infinite;
        }
        .animated-page-border.top-border {
          top: 0;
        }
        .animated-page-border.bottom-border {
          bottom: 0;
        }
        @keyframes scroll-gradient-animation {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: -100% 50%; /* Scrolls left by one full pattern width */
          }
        }
      `}</style>
    </>
  );
};

export default AnimatedPageBorder;
