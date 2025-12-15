import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollAnimation Component
 * Wraps children and animates them when they scroll into view
 * 
 * Usage:
 * <ScrollAnimation animation="fade-up">
 *   <YourContent />
 * </ScrollAnimation>
 * 
 * Animation options: "fade-up", "fade-in", "slide-left", "slide-right", "zoom-in"
 */
export default function ScrollAnimation({ 
  children, 
  animation = "fade-up",
  delay = 0,
  duration = "700ms",
  threshold = 0.1 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Optionally unobserve after animation triggers
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [threshold]);

  const animationStyles = {
    'fade-up': {
      initial: 'opacity-0 translate-y-8',
      animate: 'opacity-100 translate-y-0'
    },
    'fade-in': {
      initial: 'opacity-0',
      animate: 'opacity-100'
    },
    'slide-left': {
      initial: 'opacity-0 translate-x-8',
      animate: 'opacity-100 translate-x-0'
    },
    'slide-right': {
      initial: 'opacity-0 -translate-x-8',
      animate: 'opacity-100 translate-x-0'
    },
    'zoom-in': {
      initial: 'opacity-0 scale-95',
      animate: 'opacity-100 scale-100'
    }
  };

  const selectedAnimation = animationStyles[animation] || animationStyles['fade-up'];

  return (
    <div
      ref={elementRef}
      className={`transition-all ${
        isVisible ? selectedAnimation.animate : selectedAnimation.initial
      }`}
      style={{
        transitionDuration: duration,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

/**
 * Stagger children animations with increasing delays
 */
export function ScrollAnimationGroup({ children, animation = "fade-up", staggerDelay = 100 }) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <ScrollAnimation animation={animation} delay={index * staggerDelay}>
          {child}
        </ScrollAnimation>
      ))}
    </>
  );
}