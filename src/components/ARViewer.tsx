import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Maximize2, Minimize2, Plus, Minus, RotateCcw, Sparkles } from 'lucide-react';

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
  const [baseScale, setBaseScale] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [arSupported, setArSupported] = useState(false);
  const [currentPoster, setCurrentPoster] = useState(poster);
  const progressRef = useRef(0);

  useEffect(() => {
    const imageFallbacks: Record<string, string> = {
      '/qhom/borrito.jpg': 'https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?auto=format&fit=crop&w=800&q=80',
      '/qhom/special borrito.jpg': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      '/qhom/pasta.jpg': 'https://images.unsplash.com/photo-1574484284002-982dac98677c?auto=format&fit=crop&w=800&q=80'
    };

    const imgObj = new Image();
    imgObj.src = poster;
    imgObj.onload = () => {
      setCurrentPoster(poster);
    };
    imgObj.onerror = () => {
      if (poster in imageFallbacks) {
        setCurrentPoster(imageFallbacks[poster]);
      }
    };
  }, [poster]);

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
    // Reset to neutral scale while the new model loads so old dimensions
    // never leak into the next dish's sizing. This must run (and clear
    // progressRef) BEFORE the stall-detection effect below reads it, so
    // it's declared first — effects run in declaration order on the same
    // src change, ensuring the stall tracker always starts from a clean
    // baseline for the newly requested model instead of the previous
    // dish's leftover progress value.
    setBaseScale(1);
    setScale(1);
    progressRef.current = 0;
  }, [src]);

  // Adjust camera framing automatically once the scale has been calculated and applied
  useEffect(() => {
    const viewer = viewerRef.current;
    if (viewer && isLoaded) {
      const timer = setTimeout(() => {
        if (typeof viewer.updateFraming === 'function') {
          viewer.updateFraming();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [baseScale, isLoaded]);

  useEffect(() => {
    // Dish models can be as large as ~100MB. A 15s "stuck" timeout was
    // tuned for small demo assets and would fire false-positive retries on
    // slower connections mid-download of a large file. Only flag it as
    // stuck if progress hasn't advanced in a while, and give it much more
    // runway overall.
    let lastProgress = progressRef.current;
    let stalledFor = 0;
    const STALL_CHECK_MS = 2000;
    const MAX_STALL_MS = 45000; // no progress for 45s straight = actually stuck

    const interval = setInterval(() => {
      if (isLoaded || error) return;
      const current = progressRef.current;
      if (current > lastProgress) {
        lastProgress = current;
        stalledFor = 0;
      } else {
        stalledFor += STALL_CHECK_MS;
        if (stalledFor >= MAX_STALL_MS) {
          setShowRetry(true);
        }
      }
    }, STALL_CHECK_MS);

    return () => clearInterval(interval);
  }, [isLoaded, error, src]);

  const handleRetry = () => {
    setShowRetry(false);
    setIsLoaded(false);
    setError(false);
    setProgress(0);
    progressRef.current = 0;
    // Force model-viewer to actually re-request the asset rather than
    // just resetting our own UI state around a load that may never
    // progress further — clearing then restoring `src` retriggers the
    // fetch/parse pipeline for the same model.
    const viewer = viewerRef.current;
    if (viewer) {
      const currentSrc = viewer.src || src;
      viewer.src = '';
      requestAnimationFrame(() => {
        viewer.src = currentSrc;
      });
    }
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
    const requestedSrc = src;
    if (viewer) {
      const handleLoad = () => {
        // Guard against a stale 'load' firing (or the eager viewer.loaded
        // check below running) for a previous src right as it's swapped —
        // only trust dimensions/state that belong to the currently
        // requested dish.
        if (viewer.src !== requestedSrc) return;

        setIsLoaded(true);
        setError(false);

        // "Smart" auto-fit: real GLB assets come in wildly inconsistent
        // real-world scales (some modeled in cm, some in meters, some just
        // exported at an arbitrary size). Rather than trusting the raw
        // model scale, measure the loaded model's actual bounding box and
        // normalize it to a realistic plated-dish footprint (~22cm across,
        // like a dinner plate) so every dish appears table-sized both in
        // the in-app 3D preview and when placed on a real table in AR.
        try {
          if (typeof viewer.getDimensions === 'function') {
            const dims = viewer.getDimensions();
            const footprint = Math.max(dims.x, dims.z) || Math.max(dims.x, dims.y, dims.z);
            const TARGET_FOOTPRINT_METERS = 0.22;
            if (footprint && footprint > 0.001) {
              const factor = TARGET_FOOTPRINT_METERS / footprint;
              // Clamp so a broken/degenerate bounding box can't produce an
              // absurdly tiny or huge model.
              setBaseScale(Math.min(4, Math.max(0.02, factor)));
            } else {
              setBaseScale(1);
            }
          }
        } catch {
          // If the viewer doesn't support getDimensions yet, fall back to
          // the model's native scale rather than failing.
          setBaseScale(1);
        }

        if (viewer.canActivateAR) {
          setArSupported(true);
        } else {
          setArSupported(false);
        }
      };
      const handleError = () => {
        setError(true);
        setIsLoaded(true); // Stop loading state on error
      };
      const handleProgress = (event: any) => {
        const pct = Math.round(event.detail.totalProgress * 100);
        setProgress(pct);
        progressRef.current = pct;
      };
      
      if (viewer.loaded) {
        handleLoad();
      }
      
      viewer.addEventListener('load', handleLoad);
      viewer.addEventListener('error', handleError);
      viewer.addEventListener('progress', handleProgress);
      
      const arTimer = setTimeout(() => {
        if (viewer.canActivateAR) {
          setArSupported(true);
        }
      }, 1000);
      
      return () => {
        viewer.removeEventListener('load', handleLoad);
        viewer.removeEventListener('error', handleError);
        viewer.removeEventListener('progress', handleProgress);
        clearTimeout(arTimer);
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
      className={`relative w-full rounded-3xl overflow-hidden backdrop-blur-md border border-[#3A2E24] shadow-inner group transition-all duration-500 bg-[#181310] ${isExpanded ? 'fixed inset-0 z-[100] rounded-none h-full w-full bg-neutral-900 text-white' : 'h-[350px] md:h-[500px]'}`}
    >
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#181310]/70 z-10 backdrop-blur-sm">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-64 h-64 bg-aura-gold rounded-full blur-[80px] pointer-events-none"
          />

          <div className="relative z-20 flex flex-col items-center">
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-6">
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
                  className="block text-[10px] uppercase tracking-[0.2em] text-[#C9B8A3] font-bold"
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/95 text-white z-20 p-6 text-center">
          <div className="relative z-10 space-y-4 max-w-sm">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center mx-auto text-orange-400 animate-pulse">
              <Sparkles size={20} />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase text-amber-500 tracking-wider">Local Asset Required</h4>
              <p className="text-[10px] text-neutral-300 leading-relaxed font-semibold">
                Please upload your custom 3D model GLB file <code className="bg-black/50 px-1 py-0.5 rounded text-orange-400 font-mono text-[9px]">{src}</code> into the <code className="bg-black/50 px-1 py-0.5 rounded text-neutral-300 font-mono text-[9px]">/public/qhom/</code> folder using the file explorer on the left!
              </p>
            </div>
            
            <button
              onClick={() => {
                setError(false);
                setIsLoaded(false);
                const isBurrito = src.toLowerCase().includes('burrito');
                const isPasta = src.toLowerCase().includes('scanned') || src.toLowerCase().includes('pasta') || src.toLowerCase().includes('spaghetti');
                const viewer = viewerRef.current;
                if (viewer) {
                  if (isBurrito) {
                    if (src.includes('burnt_egg')) {
                      viewer.src = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BarramundiFish/glTF-Binary/BarramundiFish.glb';
                    } else {
                      viewer.src = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb';
                    }
                  } else if (isPasta) {
                    viewer.src = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb';
                  } else {
                    viewer.src = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb';
                  }
                }
              }}
              className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white text-[10px] uppercase font-black tracking-widest px-5 py-2.5 rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all w-full"
            >
              Demo with standard 3D asset
            </button>
          </div>
        </div>
      )}

      <model-viewer
        id="aura-3d-model"
        ref={viewerRef}
        src={src}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto"
        ar-placement="floor"
        quick-look-browsers="safari chrome"
        environment-image="neutral"
        provide-id
        poster={currentPoster}
        alt={alt}
        camera-controls
        auto-rotate
        auto-rotate-delay="100"
        shadow-intensity="2.0"
        exposure="1.2"
        shadow-softness="0.3"
        power-preference="high-performance"
        reveal="auto"
        scale={`${scale * baseScale} ${scale * baseScale} ${scale * baseScale}`}
        bounds="tight"
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
          className={`px-3 py-1.5 rounded-full border border-[#3A2E24] transition-all backdrop-blur-sm flex items-center gap-2 ${isExpanded ? 'bg-aura-gold text-neutral-900 border-aura-gold' : 'bg-[#231C17]/90 hover:bg-[#2A2119] text-[#C9B8A3]'}`}
        >
          {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {isExpanded ? 'Exit Full Screen' : 'View Full Screen'}
          </span>
        </button>
        
        <button 
          id="fullscreen-toggle"
          onClick={enterFullscreen}
          className="bg-[#231C17]/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#3A2E24] hover:bg-[#2A2119] transition-colors text-[#C9B8A3]"
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

      {/* Conditionally render custom "Launch AR Experience" button if browser/device supports AR */}
      {arSupported && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 flex justify-center w-full px-6 pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              if (viewerRef.current) {
                viewerRef.current.activateAR();
              }
            }}
            className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-black text-[11px] uppercase tracking-wider px-7 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 transition-all active:scale-95 animate-pulse cursor-pointer"
          >
            <Sparkles size={13} fill="currentColor" />
            <span>Launch AR Experience</span>
          </button>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full px-6 flex flex-col items-center gap-2 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md text-white px-8 py-3 rounded-full font-bold shadow-xl border border-white/10 uppercase text-[10px] tracking-[0.15em]">
          {arSupported ? 'Interactive 3D + AR Dish Showcase' : 'Interactive 3D Dish Showcase'}
        </div>
        <span className="text-[9px] text-neutral-400 capitalize bg-black/20 backdrop-blur-sm px-3 py-1 rounded-md font-semibold font-sans tracking-wide">
          {arSupported ? 'AR supported • Drag to rotate 3D' : 'Drag to rotate • Pinch to zoom'}
        </span>
      </div>
    </div>
  );
}
