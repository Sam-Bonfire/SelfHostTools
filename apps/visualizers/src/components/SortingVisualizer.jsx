import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SEO } from '@packages/components';
import { Button, Card, Select, Footer, CalculatorLayout, CalculatorHeader } from '@packages/styling';
import { Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { usePersistedState, resetPersistedState } from '@packages/components';

const ARRAY_SIZE = 40;
const MIN_VALUE = 10;
const MAX_VALUE = 100;

const COL_COMPARE = 'bg-red-500';
const COL_DEFAULT = 'bg-neutral-800';
const COL_PIVOT = 'bg-yellow-400';
const COL_SORTED = 'bg-green-500';

function getBubbleSortAnimations(array) {
  const animations = [];
  const arr = [...array];
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      animations.push({ type: 'compare', indices: [j, j + 1] });
      if (arr[j] > arr[j + 1]) {
        animations.push({ type: 'swap', indices: [j, j + 1] });
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
      animations.push({ type: 'clear', indices: [j, j + 1] });
    }
    animations.push({ type: 'sorted', index: n - i - 1 });
  }
  return animations;
}

function getQuickSortAnimations(array) {
  const animations = [];
  const arr = [...array];
  
  function partition(low, high) {
    let pivot = arr[high];
    animations.push({ type: 'pivot', index: high });
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      animations.push({ type: 'compare', indices: [j, high] });
      if (arr[j] < pivot) {
        i++;
        animations.push({ type: 'swap', indices: [i, j] });
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
      animations.push({ type: 'clear', indices: [j, high] });
    }
    animations.push({ type: 'swap', indices: [i + 1, high] });
    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    animations.push({ type: 'clear', indices: [high] });
    animations.push({ type: 'sorted', index: i + 1 });
    return i + 1;
  }
  
  function quickSortHelper(low, high) {
    if (low < high) {
      let pi = partition(low, high);
      quickSortHelper(low, pi - 1);
      quickSortHelper(pi + 1, high);
    } else if (low === high) {
      animations.push({ type: 'sorted', index: low });
    }
  }
  
  quickSortHelper(0, arr.length - 1);
  return animations;
}

function getMergeSortAnimations(array) {
  const animations = [];
  const arr = [...array];
  
  function merge(l, m, r) {
    let n1 = m - l + 1;
    let n2 = r - m;
    let L = new Array(n1);
    let R = new Array(n2);
    
    for (let i = 0; i < n1; i++) L[i] = arr[l + i];
    for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    
    let i = 0, j = 0, k = l;
    
    while (i < n1 && j < n2) {
      animations.push({ type: 'compare', indices: [l + i, m + 1 + j] });
      if (L[i] <= R[j]) {
        animations.push({ type: 'overwrite', index: k, value: L[i] });
        arr[k] = L[i];
        i++;
      } else {
        animations.push({ type: 'overwrite', index: k, value: R[j] });
        arr[k] = R[j];
        j++;
      }
      animations.push({ type: 'clear', indices: [l + i, m + 1 + j] });
      k++;
    }
    
    while (i < n1) {
      animations.push({ type: 'compare', indices: [l + i, l + i] });
      animations.push({ type: 'overwrite', index: k, value: L[i] });
      animations.push({ type: 'clear', indices: [l + i, l + i] });
      arr[k] = L[i];
      i++;
      k++;
    }
    while (j < n2) {
      animations.push({ type: 'compare', indices: [m + 1 + j, m + 1 + j] });
      animations.push({ type: 'overwrite', index: k, value: R[j] });
      animations.push({ type: 'clear', indices: [m + 1 + j, m + 1 + j] });
      arr[k] = R[j];
      j++;
      k++;
    }
  }
  
  function mergeSortHelper(l, r) {
    if (l >= r) return;
    let m = l + Math.floor((r - l) / 2);
    mergeSortHelper(l, m);
    mergeSortHelper(m + 1, r);
    merge(l, m, r);
    if (l === 0 && r === arr.length - 1) {
      for (let i = 0; i < arr.length; i++) {
        animations.push({ type: 'sorted', index: i });
      }
    }
  }
  
  mergeSortHelper(0, arr.length - 1);
  return animations;
}

const algorithms = {
  bubble: { name: 'Bubble Sort', fn: getBubbleSortAnimations },
  quick: { name: 'Quick Sort', fn: getQuickSortAnimations },
  merge: { name: 'Merge Sort', fn: getMergeSortAnimations },
};

const SortingVisualizer = () => {
  const [array, setArray] = usePersistedState('SortingVisualizer', 'array', []);
  const [colors, setColors] = usePersistedState('SortingVisualizer', 'colors', []);
  const [algorithm, setAlgorithm] = usePersistedState('SortingVisualizer', 'algorithm', 'bubble');
  const [isPlaying, setIsPlaying] = usePersistedState('SortingVisualizer', 'isPlaying', false);
  const [speed, setSpeed] = usePersistedState('SortingVisualizer', 'speed', 50); // 1 to 100
  const [isMuted, setIsMuted] = usePersistedState('SortingVisualizer', 'isMuted', false);
  
  const [animations, setAnimations] = usePersistedState('SortingVisualizer', 'animations', []);
  const [currentStep, setCurrentStep] = usePersistedState('SortingVisualizer', 'currentStep', 0);
  
  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);
  const animationsRef = useRef(animations);
  const isMutedRef = useRef(isMuted);

  useEffect(() => { animationsRef.current = animations; }, [animations]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playNote = useCallback((val) => {
    if (isMutedRef.current || !audioCtxRef.current) return;
    const freq = 200 + (val / MAX_VALUE) * 800; // Map value to 200-1000Hz
    
    const osc = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();
    
    osc.type = 'square';
    osc.frequency.value = freq;
    
    gainNode.gain.setValueAtTime(0.05, audioCtxRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);
    
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 0.1);
  }, []);

  const generateArray = useCallback(() => {
    const newArr = Array.from({ length: ARRAY_SIZE }, () => 
      Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
    );
    setArray(newArr);
    setColors(Array(ARRAY_SIZE).fill(COL_DEFAULT));
    setIsPlaying(false);
    setCurrentStep(0);
    setAnimations([]);
  }, []);

  useEffect(() => {
    generateArray();
  }, [generateArray]);

  useEffect(() => {
    if (array.length > 0 && animations.length === 0 && currentStep === 0) {
      const newAnims = algorithms[algorithm].fn(array);
      setAnimations(newAnims);
    }
  }, [algorithm, array, animations.length, currentStep]);

  const applyStep = useCallback((stepIndex, fw = true) => {
    const anims = animationsRef.current;
    if (stepIndex >= anims.length || stepIndex < 0) return;
    const anim = anims[stepIndex];
    
    setArray(prev => {
      const newArr = [...prev];
      if (anim.type === 'swap') {
        const [i, j] = anim.indices;
        let temp = newArr[i];
        newArr[i] = newArr[j];
        newArr[j] = temp;
        if (fw) playNote(newArr[j]);
      } else if (anim.type === 'overwrite') {
        newArr[anim.index] = anim.value;
        if (fw) playNote(anim.value);
      }
      return newArr;
    });

    setColors(prev => {
      const newColors = [...prev];
      if (anim.type === 'compare') {
        anim.indices.forEach(idx => {
          if (idx < newColors.length) newColors[idx] = COL_COMPARE;
        });
      } else if (anim.type === 'clear') {
        anim.indices.forEach(idx => {
          if (idx < newColors.length && newColors[idx] !== COL_SORTED) {
            newColors[idx] = COL_DEFAULT;
          }
        });
      } else if (anim.type === 'pivot') {
        if (anim.index < newColors.length) newColors[anim.index] = COL_PIVOT;
      } else if (anim.type === 'sorted') {
        if (anim.index < newColors.length) newColors[anim.index] = COL_SORTED;
      }
      return newColors;
    });
  }, [playNote]);

  const stepForward = useCallback(() => {
    setCurrentStep(prev => {
      if (prev < animationsRef.current.length) {
        applyStep(prev, true);
        return prev + 1;
      }
      return prev;
    });
  }, [applyStep]);

  useEffect(() => {
    if (isPlaying) {
      const delay = 210 - speed * 2; // speed=1 -> 208ms, speed=100 -> 10ms
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < animationsRef.current.length) {
            applyStep(prev, true);
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, delay);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, applyStep]);

  const handlePlayPause = () => {
    initAudio();
    if (currentStep >= animations.length && !isPlaying) {
      // Re-generate and play
      generateArray();
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    generateArray();
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans p-4 md:p-8">
      <SEO 
        title="Sorting Visualizer | Neo-Brutalist Algorithms" 
        description="Visualize sorting algorithms with retro-synthesized sounds and neo-brutalist design."
      />
      
      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            icon={Play}
            title="Sorting Visualizer"
          
            onReset={() => { resetPersistedState('SortingVisualizer'); window.location.reload(); }} />
        </div>

        <div className="lg:col-span-12 space-y-8">
        {/* Controls */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div>
              <Select 
                label="Algorithm"
                value={algorithm} 
                onChange={(e) => {
                  setAlgorithm(e.target.value);
                  generateArray();
                }}
                disabled={isPlaying}
              >
                {Object.entries(algorithms).map(([key, { name }]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </Select>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold uppercase">Speed</label>
                <span className="text-xs font-bold">{speed}%</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-black h-2 bg-gray-200 border-2 border-black rounded-none appearance-none cursor-pointer"
              />
            </div>
            
            <div className="flex gap-2 h-full items-end">
              <Button 
                onClick={handlePlayPause} 
                className="flex-1 flex items-center justify-center gap-2"
                variant={isPlaying ? "destructive" : "primary"}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                {isPlaying ? "PAUSE" : "PLAY"}
              </Button>
              <Button 
                onClick={() => { initAudio(); stepForward(); }} 
                disabled={isPlaying || currentStep >= animations.length}
                variant="outline"
                className="px-4 border-4 border-black font-bold hover:bg-gray-100"
                title="Step Forward"
              >
                <SkipForward size={20} />
              </Button>
            </div>
            
            <div className="flex gap-2 h-full items-end">
              <Button onClick={handleReset} variant="outline" className="flex-1 flex items-center justify-center gap-2 border-4 border-black font-bold">
                <RotateCcw size={20} />
                RESET
              </Button>
              <Button 
                onClick={() => {
                  initAudio();
                  setIsMuted(!isMuted);
                }} 
                variant="outline"
                className="px-4 border-4 border-black font-bold"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>
            </div>
          </div>
        </Card>

        {/* Visualizer Area */}
        <Card className="p-6 md:p-8 bg-gray-50 flex flex-col justify-end min-h-[500px]">
          <div className="flex items-end justify-center h-80 gap-1 w-full overflow-hidden border-b-4 border-black pb-1">
            {array.map((val, idx) => (
              <div 
                key={idx}
                className={`flex-1 transition-all duration-75 border-2 border-black ${colors[idx]}`}
                style={{ 
                  height: `${(val / MAX_VALUE) * 100}%`,
                  opacity: colors[idx] === COL_SORTED ? 0.9 : 1
                }}
              ></div>
            ))}
          </div>
          
          <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between text-sm font-bold gap-4">
            <div className="bg-black text-white px-4 py-2 uppercase tracking-widest inline-block border-2 border-black">
              STEP: {currentStep} / {animations.length || 0}
            </div>
            <div className="flex flex-wrap gap-4 uppercase">
              <span className="flex items-center gap-2">
                <div className={`w-5 h-5 ${COL_COMPARE} border-2 border-black`}></div> 
                Compare
              </span>
              <span className="flex items-center gap-2">
                <div className={`w-5 h-5 ${COL_PIVOT} border-2 border-black`}></div> 
                Pivot/Swap
              </span>
              <span className="flex items-center gap-2">
                <div className={`w-5 h-5 ${COL_SORTED} border-2 border-black`}></div> 
                Sorted
              </span>
            </div>
          </div>
        </Card>
        </div>
      </CalculatorLayout>
    
      <Footer>
        <p className="text-gray-600 font-medium">
          <strong>Disclaimer:</strong> This is a visualization of computational efficiency. 
          <br className="md:hidden" />
          The audible difference between Bubble Sort and Quick Sort demonstrates why algorithm choice matters—inefficiency compounds exponentially at scale.
        </p>
      </Footer>
    </div>
  );
};

export default SortingVisualizer;
