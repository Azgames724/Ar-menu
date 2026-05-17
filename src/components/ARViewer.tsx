
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

// Extend JSX namespace for model-viewer
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

interface ARViewerProps {
  src: string;
  poster: string;
  alt: string;
}

export default function ARViewer({ src, poster, alt }: ARViewerProps) {
  const viewerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded && !error) {
        setShowRetry(true);
      }
    }, 15000); // 15 seconds timeout

    return () => clearTimeout(timer);
  }, [isLoaded, error, src]);

  const handleRetry = () => {
    setShowRetry(false);
    setIsLoaded(false);
    setError(false);
    setProgress(0);
    // Toggling src slightly can force a reload if needed, but here we just reset state
  };

  useEffect(() => {
    const viewer = viewerRef.current;
    if (viewer) {
      const handleLoad = () => {
        setIsLoaded(true);
        setError(false);
      };
      const handleError = () => {
        setError(true);
        setIsLoaded(true); // Stop loading state on error
      };
      const handleProgress = (event: any) => {
        setProgress(Math.round(event.detail.totalProgress * 100));
      };
      
      // If already loaded
      if (viewer.loaded) {
        handleLoad();
      }
      
      viewer.addEventListener('load', handleLoad);
      viewer.addEventListener('error', handleError);
      viewer.addEventListener('progress', handleProgress);
      
      return () => {
        viewer.removeEventListener('load', handleLoad);
        viewer.removeEventListener('error', handleError);
        viewer.removeEventListener('progress', handleProgress);
      };
    }
  }, [src]);

  const getLoadingMessage = (p: number) => {
    if (p < 25) return "Igniting culinary concept...";
    if (p < 50) return "Sourcing digital ingredients...";
    if (p < 75) return "Plating sensory experience...";
    if (p < 95) return "Final garnish applied...";
    return "Bon Appétit...";
  };

  return (
    <div className="relative w-full h-[350px] md:h-[500px] rounded-3xl overflow-hidden bg-neutral-100/50 backdrop-blur-md border border-white/20 shadow-inner group">
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/10 z-10 backdrop-blur-sm">
          {/* Subtle glowing background pulse */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-64 h-64 bg-aura-gold rounded-full blur-[80px] pointer-events-none"
          />

          <div className="relative z-20 flex flex-col items-center">
            <div className="w-48 h-1 bg-aura-dark/5 rounded-full overflow-hidden mb-6">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-aura-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"
              />
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 border-2 border-aura-gold/20 rounded-full" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-transparent border-t-aura-gold rounded-full"
                />
              </div>

              <div className="text-center space-y-1">
                <motion.span 
                  key={getLoadingMessage(progress)}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="block text-[10px] uppercase tracking-[0.2em] text-aura-dark/60 font-bold"
                >
                  {getLoadingMessage(progress)}
                </motion.span>
                <span className="block text-[10px] uppercase tracking-widest opacity-30 font-medium font-mono">
                  {progress}% Complete
                </span>
              </div>

              {showRetry && (
                <motion.button 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleRetry}
                  className="mt-6 text-[10px] uppercase tracking-widest text-aura-gold border border-aura-gold/30 px-6 py-2.5 rounded-full hover:bg-aura-gold/10 transition-all font-bold backdrop-blur-md"
                >
                  Retry Connection
                </motion.button>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/50 z-20">
          <div className="text-center p-6">
            <p className="text-xs text-red-500 font-medium uppercase tracking-wider mb-2">Visual Unavailable</p>
            <p className="text-[10px] text-red-400 opacity-70">The kitchen is experiencing technical difficulties with this projection.</p>
          </div>
        </div>
      )}

      <model-viewer
        ref={viewerRef}
        src={src}
        poster={poster}
        alt={alt}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        rotation="0deg 0deg 0deg"
        auto-rotate-delay="0"
        shadow-intensity="1.5"
        exposure="1"
        shadow-softness="1"
        interpolation-decay="200"
        style={{ width: '100%', height: '100%', background: 'transparent', outline: 'none' }}
      >
        <button
          slot="ar-button"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-aura-dark text-white px-8 py-3 rounded-full font-medium shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 z-30 ring-4 ring-white/10"
        >
          <div className="w-2 h-2 bg-aura-gold rounded-full animate-pulse" />
          <span className="text-xs uppercase tracking-widest">Projection Mode</span>
        </button>

        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-aura-dark/5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-bold uppercase tracking-tighter opacity-40">3D Interactive</span>
        </div>
      </model-viewer>
    </div>
  );
}
