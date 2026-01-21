"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeadphoneScroll() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Animation Timer State
  // 0: Initial (Image Entrance)
  // 1: Text 1 ("Strength...")
  // 2: Text 2 ("Precision...")
  // 3: Text 3 ("Join...")
  const [sequenceStep, setSequenceStep] = useState(0);

  // Load Image
  useEffect(() => {
    const img = new Image();
    img.src = "/ImgWithBgStroke.png";
    img.onload = () => {
      imageRef.current = img;
      setImagesLoaded(true);
    };
  }, []);

  // Time-Based Sequencer
  useEffect(() => {
    if (!imagesLoaded) return;

    // Sequence Timeline
    // 0s: Start
    // 0.5s: Text 1 In
    // 5.5s: Text 1 Out, Text 2 In
    // 10.5s: Text 2 Out, Text 3 In
    
    // Initial delay for smooth start
    const t0 = setTimeout(() => setSequenceStep(1), 500); 
    const t1 = setTimeout(() => setSequenceStep(2), 5500);
    const t2 = setTimeout(() => setSequenceStep(3), 10500);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [imagesLoaded]);

  // Canvas Animation Loop
  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let startTime = performance.now();
    
    // Animation Parameters
    const floatSpeed = 0.002;
    const floatAmplitude = 15; // px
    const entranceDuration = 2500; // 2.5s slow ease in
    
    let entranceProgress = 0;
    
    const render = (time: number) => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      }
      
      // Clear
      ctx.clearRect(0, 0, width, height);
      
      // Calculate Entrance (Ease Out Cubic)
      const elapsed = time - startTime;
      
      if (elapsed < entranceDuration) {
        const t = elapsed / entranceDuration;
        entranceProgress = 1 - Math.pow(1 - t, 3);
      } else {
        entranceProgress = 1;
      }

      const img = imageRef.current!;
      
      // Scale Logic: "Right and left portion out of screen, center scaled"
      // We scale so height fits well but width is large enough to be cropped? 
      // User said "ensure the canvas scales so that is left and right portain is out of screed and center is scaled"
      // This implies object-fit: cover or close to it, but maybe just zooming in a bit.
      const scale = Math.max(width / img.width, height / img.height) * 0.85; 
       
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Position
      // Start Off-screen RIGHT (width + extra) -> Center
      // Center X: (width - scaledWidth) / 2
      const endX = (width - scaledWidth) / 2;
      const startX = width + 100; // Start from Right
      
      let currentX = startX + (endX - startX) * entranceProgress;
      
      // Float
      const floatY = Math.sin(time * floatSpeed) * floatAmplitude;
      const currentY = (height - scaledHeight) / 2 + floatY;

      // Draw
      ctx.drawImage(img, currentX, currentY, scaledWidth, scaledHeight);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [imagesLoaded]);

  // Framer Motion Variants for Text
  // Framer Motion Variants for Text
  const textVariants: import("framer-motion").Variants = {
    initial: { opacity: 0, x: -20, filter: "blur(10px)" },
    animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 1, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, filter: "blur(10px)", transition: { duration: 0.8, ease: "easeIn" } }
  };

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden">
      
      {/* Background Glow Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-white/5 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Canvas Layer with Mask/Vignette */}
      {/* Mask fades the edges of the image container so it blends into the background */}
      <div 
        className="absolute inset-0 z-10"
        style={{
            maskImage: "radial-gradient(circle at center, black 40%, transparent 90%)",
            WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 90%)"
        }}
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
        />
      </div>

       {/* Loading Spinner */}
       {!imagesLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-50">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
          </div>
        )}

      {/* Shadow/Backdrop for Text (Left -> Center Fade) */}
      {/* A dark gradient on the left side to ensure text legibility and style */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-20 pointer-events-none bg-linear-to-r from-black/90 via-black/40 to-transparent w-full md:w-3/4 lg:w-1/2"
      />

      {/* Logo */}
      <div className="absolute top-8 left-8 z-50">
           <img src="/FitLogo.png" alt="Fitness Club Gym" className="h-12 w-auto object-contain brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
      </div>

      {/* Content Container - Left Aligned */}
      <div className="absolute inset-0 z-30 flex flex-col justify-center px-8 md:px-20 pointer-events-none">
        <AnimatePresence mode="wait">
          
          {/* Text 1: Strength */}
          {sequenceStep === 1 && (
            <motion.div
              key="step1"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={textVariants}
              className="max-w-2xl"
            >
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white/90 mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                Strength Through
              </h1>
              <p className="text-2xl md:text-4xl font-light text-white/60 tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                Every Break
              </p>
            </motion.div>
          )}

          {/* Text 2: Precision */}
          {sequenceStep === 2 && (
             <motion.div
             key="step2"
             initial="initial"
             animate="animate"
             exit="exit"
             variants={textVariants}
             className="max-w-2xl"
           >
             <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white/90 mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
               Precision Engineered
             </h2>
             <p className="text-xl md:text-3xl font-light text-white/60 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
               For the Perfect Form
             </p>
           </motion.div>
          )}

          {/* Text 3: Join */}
          {sequenceStep === 3 && (
             <motion.div
             key="step3"
             initial="initial"
             animate="animate"
             // No exit for the final step, it stays.
             variants={textVariants}
             className="max-w-2xl"
           >
             <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white/90 mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
               Join The <br />
  <span className="mt-4 inline-block">Fitness Club</span>
             </h2>
           </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Persistent Join Button - Centered */}
      {/* "Button animation should start from starting" -> Always visible, animating */}
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.5, duration: 1 }}
         className="absolute bottom-1/4 left-1/2 -translate-x-1/2 z-40"
      >
        <a 
          href="https://www.instagram.com/fitness_club1608/" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <button className="group relative overflow-hidden rounded-full bg-white px-10 py-5 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] cursor-pointer">
              <span className="relative z-10 text-xl font-bold tracking-tight text-black group-hover:text-black/80">
                  Join
              </span>
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -z-10 bg-linear-to-r from-transparent via-gray-200/50 to-transparent w-[200%] -translate-x-full animate-[shimmer_3s_infinite]" />
          </button>
        </a>
      </motion.div>

    </div>
  );
}
