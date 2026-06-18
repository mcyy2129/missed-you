// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const tools = [
  { id: 'pomodoro', icon: '🍅', name: '番茄钟', color: 'from-red-500/20 to-orange-500/20' },
  { id: 'calculator', icon: '🧮', name: '计算器', color: 'from-blue-500/20 to-cyan-500/20' },
  { id: 'notepad', icon: '📝', name: '便签', color: 'from-yellow-500/20 to-amber-500/20' },
  { id: 'timer', icon: '⏱️', name: '计时器', color: 'from-teal-500/20 to-emerald-500/20' },
  { id: 'random', icon: '🎲', name: '随机数', color: 'from-purple-500/20 to-pink-500/20' },
  { id: 'color', icon: '🎨', name: '取色器', color: 'from-indigo-500/20 to-violet-500/20' },
];

function Pomodoro() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 0) {
          setIsBreak(b => !b);
          setRunning(false);
          return isBreak ? 25 * 60 : 5 * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, isBreak]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">{isBreak ? '☕ 休息时间' : '🎯 专注时间'}</p>
      <p className="text-3xl font-black text-white neon-text tabular-nums">{mins}:{secs}</p>
      <div className="flex gap-2">
        <button onClick={() => setRunning(!running)} className="px-3 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition-colors">{running ? '暂停' : '开始'}</button>
        <button onClick={() => { setRunning(false); setSeconds(isBreak ? 5 * 60 : 25 * 60); }} className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/5 text-slate-400 hover:bg-white/10 transition-colors">重置</button>
      </div>
    </div>
  );
}

function Calculator() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const click = (val: string) => {
    if (val === 'C') { setDisplay('0'); setEquation(''); return; }
    if (display === 'Error') { setDisplay(val === '.' ? '0.' : val); setEquation(''); return; }
    if (val === '=') {
      try {
        const eq = equation + display;
        const safe = eq.replace(/[^-()\d/*+.]/g, '');
        setDisplay(String(parseFloat(Number(new Function('return ' + safe)()).toFixed(6))));
        setEquation('');
      } catch { setDisplay('Error'); }
    } else if (['+', '-', '*', '/'].includes(val)) {
      setEquation(equation + display + val);
      setDisplay('0');
    } else {
      if (val === '.' && display.includes('.')) return;
      setDisplay(display === '0' && val !== '.' ? val : display + val);
    }
  };

  const btns = ['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='];

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-[#0a1a1a]/60 rounded-xl p-2 text-right">
        <span className="text-[10px] text-teal-400/60">{equation}</span>
        <p className="text-lg font-black text-white truncate">{display}</p>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {btns.map(b => (
          <button key={b} onClick={() => click(b)}
            className={`h-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all active:scale-95
              ${b === '=' ? 'col-span-2 bg-teal-500/30 text-teal-300' : ['C','(',')','/','*','-','+'].includes(b) ? 'bg-white/5 text-teal-400/70' : 'bg-white/5 text-white/80 hover:bg-white/10'}`}>{b}</button>
        ))}
      </div>
    </div>
  );
}

function Notepad() {
  const [text, setText] = useState('');

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">快速便签</p>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="写下你的想法..."
        className="w-full h-24 bg-[#0a1a1a]/60 rounded-xl p-3 text-xs text-white/80 placeholder-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-teal-500/30 border border-white/5" />
      <p className="text-[9px] text-slate-500 text-right">{text.length} 字</p>
    </div>
  );
}

function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-3xl font-black text-white neon-text tabular-nums">{h}:{m}:{s}</p>
      <div className="flex gap-2">
        <button onClick={() => setRunning(!running)} className="px-3 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-400">{running ? '暂停' : '开始'}</button>
        <button onClick={() => { setRunning(false); setSeconds(0); }} className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/5 text-slate-400">重置</button>
      </div>
    </div>
  );
}

function RandomNumber() {
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [result, setResult] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2 w-full">
        <input type="number" value={min} onChange={e => setMin(e.target.value)} className="flex-1 h-7 bg-[#0a1a1a]/60 rounded-lg px-2 text-xs text-white text-center border border-white/5 focus:outline-none focus:ring-1 focus:ring-teal-500/30" />
        <span className="text-slate-500 text-xs self-center">~</span>
        <input type="number" value={max} onChange={e => setMax(e.target.value)} className="flex-1 h-7 bg-[#0a1a1a]/60 rounded-lg px-2 text-xs text-white text-center border border-white/5 focus:outline-none focus:ring-1 focus:ring-teal-500/30" />
      </div>
      {result !== null && <p className="text-3xl font-black text-white neon-text">{result}</p>}
      <button onClick={() => setResult(Math.floor(Math.random() * (parseInt(max) - parseInt(min) + 1)) + parseInt(min))}
        className="px-4 py-1.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition-colors">🎲 随机一下</button>
    </div>
  );
}

function ColorPicker() {
  const [color, setColor] = useState('#5eead4');

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-xl border-2 border-white/10 shadow-lg" style={{ background: color }} />
      <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-8 rounded-lg cursor-pointer bg-transparent" />
      <p className="text-xs font-mono text-teal-400">{color}</p>
      <button onClick={() => navigator.clipboard.writeText(color)} className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/5 text-slate-400 hover:text-teal-400 transition-colors">复制色值</button>
    </div>
  );
}

export default function QuickTools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const renderTool = () => {
    switch (activeTool) {
      case 'pomodoro': return <Pomodoro />;
      case 'calculator': return <Calculator />;
      case 'notepad': return <Notepad />;
      case 'timer': return <Timer />;
      case 'random': return <RandomNumber />;
      case 'color': return <ColorPicker />;
      default: return null;
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-3">
        {tools.map(tool => (
          <motion.button key={tool.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
            className={`glass-card px-3 py-2 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${activeTool === tool.id ? 'border-teal-500/30 text-teal-400' : 'text-slate-400 hover:text-white'}`}>
            <span>{tool.icon}</span>
            <span>{tool.name}</span>
          </motion.button>
        ))}
      </div>

      {activeTool && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          className="glass-card p-4 overflow-hidden">
          {renderTool()}
        </motion.div>
      )}
    </div>
  );
}
