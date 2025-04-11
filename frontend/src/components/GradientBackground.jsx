import { useEffect, useRef } from 'react';

const GradientBackground = () => {
  const purpleRef = useRef(null);
  const blueRef = useRef(null);

  const updatePosition = (x, y) => {
    const offsetX = (x / window.innerWidth - 0.5) * 40;
    const offsetY = (y / window.innerHeight - 0.5) * 40;

    if (purpleRef.current)
      purpleRef.current.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;

    if (blueRef.current)
      blueRef.current.style.transform = `translate(calc(-50% + ${offsetX / 1.5}px), calc(-50% + ${offsetY / 1.5}px))`;
  };

  useEffect(() => {
    // Set initial position based on center of screen
    updatePosition(window.innerWidth / 2, window.innerHeight / 2);

    const handleMouseMove = (e) => {
      updatePosition(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0d0d0d] -z-10">
      {/* Purple Sphere with Floating Animation */}
      <div
        ref={purpleRef}
        className="absolute left-1/2 top-1/2 w-[450px] h-[450px] rounded-full pointer-events-none transition-all duration-100 ease-out"
        style={{
          background: 'radial-gradient(circle at center, #a855f7, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      {/* Blue Sphere with Floating Animation */}
      <div
        ref={blueRef}
        className="absolute left-[65%] top-[35%] w-[250px] h-[250px] rounded-full pointer-events-none transition-all duration-100 ease-out"
        style={{
          background: 'radial-gradient(circle at center, #de264e, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
    </div>
  );
};

export default GradientBackground;
