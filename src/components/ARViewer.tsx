
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Maximize2, Minimize2, Camera, X, Plus, Minus, RotateCcw, Smartphone } from 'lucide-react';

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
  const [magicMirrorActive, setMagicMirrorActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [orbit, setOrbit] = useState("0deg 75deg 105%");
  const [hasMotionPermission, setHasMotionPermission] = useState(false);
  const initialAlphaRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startMagicMirror = async () => {
    try {
      setCameraError(null);
      console.log("Requesting camera access...");
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser.");
      }

      // Request motion permission for iOS
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const state = await (DeviceOrientationEvent as any).requestPermission();
          setHasMotionPermission(state === 'granted');
        } catch (e) {
          console.warn("Motion permission denied:", e);
        }
      } else {
        setHasMotionPermission(true);
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false 
        });
      } catch (firstErr) {
        console.warn("Environment camera failed, falling back to any camera:", firstErr);
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false 
        });
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
          setMagicMirrorActive(true);
          console.log("Lite AR active");
        } catch (playErr) {
          console.error("Video play failed:", playErr);
          setCameraError("Video failed to play. Tap to retry.");
          setMagicMirrorActive(true);
        }
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      const errorMessage = err.message || "";
      const errorName = err.name || "";

      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || errorMessage.toLowerCase().includes('permission denied')) {
        setCameraError("Camera access was denied. Please allow camera access in your browser settings or try opening this app in a new tab.");
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setCameraError("Camera not found. Lite AR requires a camera to function.");
      } else if (errorName === 'SecurityError') {
        setCameraError("Security restriction: Camera access is blocked. Please open in a new tab to bridge the security gap.");
      } else {
        setCameraError(errorMessage || "Could not access camera for Lite AR mode.");
      }
      setMagicMirrorActive(true); // Keep active to show the error overlay
    }
  };

  const toggleMagicMirror = () => {
    if (magicMirrorActive) {
      stopCamera();
      setMagicMirrorActive(false);
      initialAlphaRef.current = null;
    } else {
      startMagicMirror();
    }
  };

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
    if (!magicMirrorActive || !hasMotionPermission) {
      initialAlphaRef.current = null;
      return;
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null || e.alpha === null) return;
      
      if (initialAlphaRef.current === null) {
        initialAlphaRef.current = e.alpha;
      }

      // Calculate relative rotation (sideways movement)
      let diffAlpha = e.alpha - initialAlphaRef.current;
      // Handle 360 degree wrap around
      if (diffAlpha > 180) diffAlpha -= 360;
      if (diffAlpha < -180) diffAlpha += 360;

      // Theta (Azimuth): Combining pure rotation (alpha) and slight tilt (gamma)
      // This makes the object feel anchored as you rotate the phone around it
      const theta = diffAlpha - (e.gamma * 0.4); 
      
      // Phi (Polar): Tilt up/down
      // When holding device upright (beta ~90), we want phi ~90deg (side view)
      // When holding device flat (beta ~0), we want phi ~0deg (top view)
      const phi = e.beta; 
      
      // Limit phi to avoid flipping
      const safePhi = Math.max(10, Math.min(170, phi));
      
      setOrbit(`${theta}deg ${safePhi}deg 105%`);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [magicMirrorActive, hasMotionPermission]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

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
    <div className={`relative w-full rounded-3xl overflow-hidden backdrop-blur-md border border-white/20 shadow-inner group transition-all duration-500 ${magicMirrorActive ? 'bg-black' : 'bg-neutral-100/50'} ${isExpanded ? 'fixed inset-0 z-[100] rounded-none h-full w-full' : 'h-[350px] md:h-[500px]'}`}>
      {/* Magic Mirror Video Background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 z-0 ${magicMirrorActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {magicMirrorActive && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-12 h-12 border-4 border-aura-gold/20 border-t-aura-gold rounded-full animate-spin opacity-20" />
        </div>
      )}

      {cameraError && magicMirrorActive && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-red-600/95 text-white p-5 rounded-2xl text-[10px] uppercase tracking-widest font-bold backdrop-blur-xl shadow-2xl flex flex-col gap-4 border border-white/20">
          <div className="flex items-start justify-between gap-4">
            <span className="flex-1 leading-relaxed">{cameraError}</span>
            <button onClick={() => setMagicMirrorActive(false)} className="opacity-60 hover:opacity-100 transition-opacity p-1">
              <X size={16} />
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            <button 
              onClick={startMagicMirror}
              className="bg-white text-red-600 py-3 rounded-xl hover:bg-white/90 transition-all active:scale-[0.98] font-black text-[10px] shadow-lg"
            >
              Retry Camera Connection
            </button>
            
            {window.self !== window.top && (
              <button 
                onClick={() => window.open(window.location.href, '_blank')}
                className="bg-black/20 text-white border border-white/20 py-3 rounded-xl hover:bg-black/30 transition-all font-black text-[10px]"
              >
                Open in New Tab (Recommended)
              </button>
            )}
          </div>
        </div>
      )}
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
        id="aura-ar-viewer"
        ref={viewerRef}
        src={src}
        provide-id
        poster={poster}
        alt={alt}
        camera-controls
        auto-rotate={!magicMirrorActive}
        auto-rotate-delay="0"
        shadow-intensity="1.5"
        exposure="0.8"
        shadow-softness="0.8"
        scale={`${scale} ${scale} ${scale}`}
        camera-orbit={magicMirrorActive ? orbit : undefined}
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
          className={`px-3 py-1.5 rounded-full border border-aura-dark/5 transition-all backdrop-blur-sm flex items-center gap-2 ${isExpanded ? 'bg-aura-gold text-white' : 'bg-white/80 hover:bg-white text-aura-dark/60'}`}
        >
          {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {isExpanded ? 'Exit Full Screen' : 'View Full Screen'}
          </span>
        </button>

        <button 
          onClick={toggleMagicMirror}
          className={`px-3 py-1.5 rounded-full border border-aura-dark/5 transition-all flex items-center gap-2 backdrop-blur-sm ${magicMirrorActive ? 'bg-aura-gold text-white border-aura-gold' : 'bg-white/80 hover:bg-white text-aura-dark/60'}`}
        >
          {magicMirrorActive ? <Camera size={12} /> : <Smartphone size={12} />}
          <div className={`w-1.5 h-1.5 rounded-full ${magicMirrorActive ? 'bg-white animate-pulse' : 'bg-aura-dark/20'}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {magicMirrorActive ? 'Exit Lite AR' : 'Lite AR (Camera)'}
          </span>
        </button>
        
        <button 
          id="fullscreen-toggle"
          onClick={enterFullscreen}
          className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-aura-dark/5 hover:bg-white transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-aura-dark/60">Native Fullscreen</span>
        </button>
      </div>

      {/* Scale Control UI */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-40 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 sm:scale-100">
        <div className="flex flex-col items-center bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl">
          <button 
            onClick={() => setScale(prev => Math.min(3, prev + 0.2))}
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
            className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-90"
          >
            <Minus size={20} strokeWidth={3} />
          </button>

          <div className="mt-4 flex flex-col items-center border-t border-white/5 pt-4 w-full">
            <span className="text-[12px] font-black text-white">{Math.round(scale * 100)}%</span>
            <button 
              onClick={() => {
                setScale(1);
                initialAlphaRef.current = null;
              }}
              className="flex flex-col items-center gap-1 text-[8px] font-bold text-aura-gold uppercase tracking-[0.2em] mt-2 opacity-60 hover:opacity-100 transition-all"
            >
              <RotateCcw size={10} />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full px-6 flex flex-col items-center gap-3">
        {magicMirrorActive ? (
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={toggleMagicMirror}
              className="bg-white/90 backdrop-blur-md text-aura-dark px-10 py-3 rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all border border-aura-dark/10 uppercase text-xs tracking-widest"
            >
              Close Lite AR
            </button>
            <span className="text-[9px] text-white/50 uppercase tracking-[0.2em] font-medium drop-shadow-md">
              In-App Camera Overlay active
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <button 
              onClick={toggleMagicMirror}
              className="bg-aura-gold text-white px-10 py-4 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-0.5 border border-white/20"
            >
              <span className="text-[10px] uppercase tracking-widest opacity-80 leading-none">Compatible AR</span>
              <span className="text-xs uppercase tracking-[0.2em]">View on your desk</span>
            </button>
            <span className="text-[10px] text-aura-dark/40 uppercase tracking-widest font-medium">Safe for all phones • No Install</span>
          </div>
        )}
      </div>
    </div>
  );
}
