import React, { useState, useEffect, useRef } from 'react';
import { SEO } from '@packages/components';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Activity } from 'lucide-react';
import { Button, Footer, CalculatorLayout, CalculatorHeader } from '@packages/styling';
import { usePersistedState, resetPersistedState } from '@packages/persistence';

// Web Audio API logic
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.brownNoiseNode = null;
    this.gainNode = null;
    this.isPlaying = false;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256; 
    
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = 0.5;
    
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  playClick() {
    if (!this.ctx) this.init();
    const osc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);
    
    clickGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  createBrownNoise() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate for gain
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    // Add a lowpass filter for lo-fi feel
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    noise.connect(filter);
    filter.connect(this.gainNode);
    
    return noise;
  }

  toggleNoise(on) {
    if (!this.ctx) this.init();
    
    if (on && !this.isPlaying) {
      if(this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.brownNoiseNode = this.createBrownNoise();
      this.brownNoiseNode.start();
      this.isPlaying = true;
    } else if (!on && this.isPlaying) {
      if (this.brownNoiseNode) {
        this.brownNoiseNode.stop();
        this.brownNoiseNode.disconnect();
        this.brownNoiseNode = null;
      }
      this.isPlaying = false;
    }
  }
  
  getAudioData() {
    if (!this.analyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }
}

const PomodoroFocusVisualizer = () => {
  const FOCUS_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const [timeLeft, setTimeLeft] = usePersistedState('PomodoroFocusVisualizer', 'timeLeft', FOCUS_TIME);
  const [isActive, setIsActive] = usePersistedState('PomodoroFocusVisualizer', 'isActive', false);
  const [mode, setMode] = usePersistedState('PomodoroFocusVisualizer', 'mode', 'focus'); // focus, break
  const [soundEnabled, setSoundEnabled] = usePersistedState('PomodoroFocusVisualizer', 'soundEnabled', false);
  
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const animationRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize engine
  useEffect(() => {
    engineRef.current = new AudioEngine();
    return () => {
      if (engineRef.current) {
        engineRef.current.toggleNoise(false);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Play a terminal click on complete
      if (engineRef.current) engineRef.current.playClick();
      
      setIsActive(false);
      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(BREAK_TIME);
      } else {
        setMode('focus');
        setTimeLeft(FOCUS_TIME);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  // Audio interaction logic
  useEffect(() => {
    if (soundEnabled && isActive) {
      engineRef.current.toggleNoise(true);
    } else {
      engineRef.current.toggleNoise(false);
    }
  }, [soundEnabled, isActive]);

  // Visual rippling effect & Canvas drawing
  useEffect(() => {
    const updateRipple = () => {
      if (!engineRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const data = engineRef.current.getAudioData();
      
      let avg = 0;
      
      if (data.length > 0) {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += Math.abs(data[i] - 128);
        }
        avg = sum / data.length;
      }
      
      // Update DOM rippling
      if (containerRef.current) {
        if (engineRef.current.isPlaying) {
          const baseShadowX = 8;
          const baseShadowY = 8;
          const dynamicShadowX = baseShadowX + (avg * 0.3);
          const dynamicShadowY = baseShadowY + (avg * 0.3);
          const borderWidth = 4 + (avg * 0.05);
          
          containerRef.current.style.boxShadow = `${dynamicShadowX}px ${dynamicShadowY}px 0px 0px rgba(0,0,0,1)`;
          containerRef.current.style.transform = `translate(-${avg * 0.1}px, -${avg * 0.1}px)`;
          containerRef.current.style.borderWidth = `${borderWidth}px`;
        } else {
          // Reset
          containerRef.current.style.boxShadow = `8px 8px 0px 0px rgba(0,0,0,1)`;
          containerRef.current.style.transform = `translate(0px, 0px)`;
          containerRef.current.style.borderWidth = `4px`;
        }
      }

      // Draw Waveform
      if (ctx && canvas && data.length > 0 && engineRef.current.isPlaying) {
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000000';
        ctx.beginPath();

        const sliceWidth = width * 1.0 / data.length;
        let x = 0;

        for (let i = 0; i < data.length; i++) {
          const v = data[i] / 128.0;
          const y = v * height / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      } else if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(updateRipple);
    };

    updateRipple();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const toggleTimer = () => {
    if (engineRef.current) engineRef.current.playClick();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    if (engineRef.current) engineRef.current.playClick();
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const toggleSound = () => {
    if (engineRef.current) engineRef.current.playClick();
    setSoundEnabled(!soundEnabled);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Neo-brutalist progress circle calculation
  const totalTime = mode === 'focus' ? FOCUS_TIME : BREAK_TIME;
  const progressPercentage = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-black p-4 sm:p-8 font-outfit relative overflow-hidden">
      <SEO 
        title="Pomodoro Focus & Waveform"
        description="A physical, retro stopwatch pomodoro timer with interactive lo-fi sound waves."
      />
      
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-[#FFDE59] border-4 border-black rounded-full mix-blend-multiply opacity-50 blur-sm pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#7EAAFF] border-4 border-black mix-blend-multiply opacity-50 blur-md pointer-events-none" />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader namespace="PomodoroFocusVisualizer"
            icon={Activity}
            title="Pomodoro Focus"
          
            onReset={() => { resetPersistedState('PomodoroFocusVisualizer'); window.location.reload(); }} />
        </div>

        <div className="lg:col-span-12 flex justify-center">
          <div 
            ref={containerRef}
            className="relative z-10 w-full max-w-md bg-white border-4 border-black p-8 rounded-none sm:rounded-2xl flex flex-col items-center transition-all duration-75"
            style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
          >
        <div className="w-full flex justify-between items-center mb-6">
          <div className="text-sm font-bold uppercase tracking-widest border-2 border-black px-4 py-1 bg-[#FFDE59] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-full">
            {mode === 'focus' ? 'Focus Mode' : 'Break Time'}
          </div>
          
          <button 
            onClick={toggleSound}
            className={`p-2 border-4 border-black rounded-full transition-all active:translate-x-1 active:translate-y-1 active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${soundEnabled ? 'bg-[#FF6B6B]' : 'bg-white'}`}
            title="Toggle Lo-fi Brown Noise"
          >
            {soundEnabled ? <Volume2 size={20} strokeWidth={3} /> : <VolumeX size={20} strokeWidth={3} />}
          </button>
        </div>

        {/* Stopwatch Display */}
        <div className="relative w-64 h-64 mb-8">
          <div 
            className="absolute inset-0 rounded-full border-8 border-black bg-[#f4f4f0] shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.2)] flex items-center justify-center z-10"
            style={{
              background: `conic-gradient(#FFDE59 ${progressPercentage}%, #f4f4f0 ${progressPercentage}%)`
            }}
          >
            {/* Inner mask to create a donut effect, leaving a rim of progress */}
            <div className="absolute inset-4 rounded-full bg-[#f4f4f0] border-4 border-black flex items-center justify-center flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
              <span className="text-5xl font-black tracking-tighter text-black font-mono mt-4">
                {formatTime(timeLeft)}
              </span>
              <div className="mt-2 text-xs font-bold uppercase text-gray-500 tracking-widest">
                {isActive ? 'Running' : 'Paused'}
              </div>
            </div>
          </div>
        </div>

        {/* Waveform Canvas */}
        <div className="w-full h-16 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8 overflow-hidden relative">
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={60} 
            className="w-full h-full"
          />
          {!soundEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 font-bold uppercase text-xs tracking-widest text-gray-400">
              Waveform Offline
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4 w-full">
          <Button 
            onClick={toggleTimer} 
            variant={isActive ? 'destructive' : 'primary'}
            className="flex-1 flex items-center justify-center gap-2 rounded-full py-4 text-lg"
          >
            {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            {isActive ? 'PAUSE' : 'START'}
          </Button>
          
          <Button 
            onClick={resetTimer} 
            variant="outline"
            className="w-16 h-auto flex items-center justify-center rounded-full"
            title="Reset Timer"
          >
            <RotateCcw size={24} strokeWidth={3} />
          </Button>
        </div>
        
        {/* Terminal Text output */}
        <div className="mt-8 w-full bg-black text-[#FFDE59] p-4 rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] font-mono text-xs uppercase tracking-wider relative overflow-hidden">
          {/* CRT scanline effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-2 border-b border-gray-700 pb-2">
            <Activity size={16} />
            <span>System Log</span>
          </div>
          <p>{`> STATUS : ${isActive ? 'ACTIVE' : 'IDLE'}`}</p>
          <p>{`> MODE   : ${mode}`}</p>
          <p>{`> AUDIO  : ${soundEnabled ? 'BROWN_NOISE' : 'MUTED'}`}</p>
          <p className="animate-pulse text-white mt-1">{`> _`}</p>
        </div>
      </div>
      </div>
      </CalculatorLayout>
    
      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Disclaimer:</strong> The Pomodoro technique leverages time-boxing to prevent cognitive fatigue. 
          <br className="md:hidden" />
          By committing to short, unbroken intervals of focus, you overcome the friction of starting and build deep momentum.
        </p>
      </Footer>
    </div>
  );
};

export default PomodoroFocusVisualizer;
