import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Maximize2, Minimize2, Plus, Minus, RotateCcw } from 'lucide-react';

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
  const [scale, setScale] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

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
  };

  const enterFullscreen = () => {
    const viewer = viewerRef.current;
    if (viewer) {
      if (viewer.requestFullscreen) {
        viewer.requestFullscreen();
      } else if (viewer.webkitRequestFullscreen) {
        viewer.webkitRequestFullscreen();
      }
    }
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
    <div 
      id="3d-viewer-container"
      className={`relative w-full rounded-3xl overflow-hidden backdrop-blur-md border border-neutral-200/50 shadow-inner group transition-all duration-500 bg-neutral-50/80 ${isExpanded ? 'fixed inset-0 z-[100] rounded-none h-full w-full bg-neutral-900 text-white' : 'h-[350px] md:h-[500px]'}`}
    >
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 z-10 backdrop-blur-sm">
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
                  Reload 3D Model
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
        id="aura-3d-model"
        ref={viewerRef}
        src={src}
        provide-id
        poster={poster}
        alt={alt}
        camera-controls
        auto-rotate
        auto-rotate-delay="100"
        shadow-intensity="1.5"
        exposure="1.0"
        shadow-softness="0.5"
        scale={`${scale} ${scale} ${scale}`}
        loading="eager"
        interaction-prompt="auto"
        interpolation-decay="200"
        style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'transparent', 
          outline: 'none',
          '--poster-color': 'transparent',
          '--background-color': 'transparent',
          position: 'relative',
          zIndex: 10
        }}
      ></model-viewer>

      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
        <button 
          onClick={toggleExpand}
          className={`px-3 py-1.5 rounded-full border border-neutral-200/40 transition-all backdrop-blur-sm flex items-center gap-2 ${isExpanded ? 'bg-aura-gold text-neutral-900 border-aura-gold' : 'bg-white/80 hover:bg-white text-aura-dark/70'}`}
        >
          {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {isExpanded ? 'Exit Full Screen' : 'View Full Screen'}
          </span>
        </button>
        
        <button 
          id="fullscreen-toggle"
          onClick={enterFullscreen}
          className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-200/40 hover:bg-white transition-colors text-aura-dark/70"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">Native Fullscreen</span>
        </button>
      </div>

      {/* Scale Control UI */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-40 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 sm:scale-100">
        <div className="flex flex-col items-center bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl">
          <button 
            onClick={() => setScale(prev => Math.min(3, prev + 0.2))}
            aria-label="Zoom In"
            className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-90"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
          
          <div className="relative h-40 w-12 flex items-center justify-center my-2">
            <div className="absolute inset-y-0 w-1 bg-white/10 rounded-full" />
            <input 
              type="range" 
              min="0.2" 
              max="3" 
              step="0.05" 
              value={scale} 
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="absolute w-40 h-12 bg-transparent appearance-none cursor-pointer rotate-270 accent-aura-gold z-10 touch-none"
              style={{
                WebkitAppearance: 'none',
              }}
            />
          </div>

          <button 
            onClick={() => setScale(prev => Math.max(0.2, prev - 0.2))}
            aria-label="Zoom Out"
            className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-90"
          >
            <Minus size={20} strokeWidth={3} />
          </button>

          <div className="mt-4 flex flex-col items-center border-t border-white/5 pt-4 w-full">
            <span className="text-[12px] font-black text-white">{Math.round(scale * 100)}%</span>
            <button 
              onClick={() => setScale(1)}
              className="flex flex-col items-center gap-1 text-[8px] font-bold text-aura-gold uppercase tracking-[0.2em] mt-2 opacity-60 hover:opacity-100 transition-all"
            >
              <RotateCcw size={10} />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full px-6 flex flex-col items-center gap-2 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md text-white px-8 py-3 rounded-full font-bold shadow-xl border border-white/10 uppercase text-[10px] tracking-[0.15em]">
          Interactive 3D Dish Showcase
        </div>
        <span className="text-[9px] text-aura-dark/40 uppercase tracking-[0.2em] font-medium font-sans">
          Drag to rotate • Pinch to zoom
        </span>
      </div>
    </div>
  );
}
