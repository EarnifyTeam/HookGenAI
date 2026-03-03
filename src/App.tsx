/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Upload, 
  Video, 
  Hash, 
  Type as TypeIcon, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Play,
  RefreshCw,
  Copy,
  Users,
  LifeBuoy,
  Settings,
  X,
  Save,
  Key,
  ChevronRight,
  Info,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface AnalysisResult {
  titles: string[];
  hashtags: string[];
}

// --- Constants ---
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = {
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  'video/webm': ['.webm']
};

export default function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<Record<number, AnalysisResult>>({});
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  
  // Settings & API Key State
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [userApiKey, setUserApiKey] = useState(localStorage.getItem('video_tag_ai_key') || '');
  const [isConfigured, setIsConfigured] = useState(!!(localStorage.getItem('video_tag_ai_key') || process.env.GEMINI_API_KEY));

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFiles = [...files, ...acceptedFiles].slice(0, 10);
      
      // Check sizes
      const oversized = newFiles.find(f => f.size > MAX_FILE_SIZE);
      if (oversized) {
        setError("One or more files are too large. Max 50MB per video.");
        return;
      }

      setFiles(newFiles);
      const urls = newFiles.map(f => URL.createObjectURL(f));
      setVideoUrls(urls);
      setError(null);
    }
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_TYPES,
    multiple: true,
    maxFiles: 10,
    disabled: !isConfigured
  } as any);

  const analyzeVideos = async () => {
    if (files.length === 0) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const apiKey = userApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key is missing. Please check settings.");

      const ai = new GoogleGenAI({ apiKey });
      const newResults: Record<number, AnalysisResult> = { ...results };

      for (let i = 0; i < files.length; i++) {
        // Skip if already analyzed
        if (newResults[i]) continue;

        const file = files[i];
        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{
            parts: [
              { inlineData: { mimeType: file.type, data: base64Data } },
              { text: "Analyze this video and provide 4-5 catchy, high-engagement 'hook' captions/titles that would grab attention on social media. Also provide exactly five relevant hashtags. Return the result in JSON format." }
            ]
          }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                titles: { type: Type.ARRAY, items: { type: Type.STRING } },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["titles", "hashtags"]
            }
          }
        });

        newResults[i] = JSON.parse(response.text || '{}');
        setResults({ ...newResults }); // Update incrementally
      }
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "Failed to analyze videos. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    videoUrls.forEach(url => URL.revokeObjectURL(url));
    setFiles([]);
    setVideoUrls([]);
    setResults({});
    setError(null);
    setActiveVideoIndex(0);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('video_tag_ai_key', userApiKey);
    setIsConfigured(!!(userApiKey || process.env.GEMINI_API_KEY));
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans flex flex-col">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">HookGen AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-gray-50 rounded-full transition-all"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <a 
              href="https://whatsapp.com/channel/0029Vb7wKKo3mFY41pw96m3x"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Users className="w-4 h-4" />
              Join Community
            </a>
          </div>
        </div>
      </nav>

      <div className="flex-1 p-4 md:p-8 flex flex-col">
        <div className="max-w-4xl mx-auto w-full">
          <header className="mb-12 text-center">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-black/5 rounded-full mb-4 shadow-sm"
            >
              <Video className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">AI Bulk Video Analyzer</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            >
              HookGen AI
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 max-w-lg mx-auto"
            >
              Upload up to 10 videos and let AI craft the perfect hook captions and hashtags for maximum reach.
            </motion.p>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Upload & Preview */}
            <section className="space-y-6">
              <AnimatePresence mode="wait">
                {files.length === 0 ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    {...getRootProps()}
                    className={`
                      aspect-[9/16] max-h-[600px] w-full border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 transition-all
                      ${!isConfigured ? 'border-amber-200 bg-amber-50/20 cursor-not-allowed' : isDragActive ? 'border-emerald-500 bg-emerald-50/50 cursor-pointer' : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'}
                    `}
                  >
                    <input {...getInputProps()} />
                    {!isConfigured ? (
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                          <Key className="w-8 h-8 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">API Key Required</h3>
                        <p className="text-sm text-gray-400 max-w-[200px] mb-6">
                          Please save your Gemini API key in settings to enable video uploading.
                        </p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
                          className="px-6 py-3 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20 flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Configure Key
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                          <Upload className={`w-8 h-8 ${isDragActive ? 'text-emerald-500' : 'text-gray-400'}`} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Drop up to 10 videos here</h3>
                        <p className="text-sm text-gray-400 text-center">
                          MP4, MOV, or WebM (Max 50MB per file)
                        </p>
                      </>
                    )}
                  </motion.div>
                ) : (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                      >
                        {/* Main Preview */}
                        <div className="relative aspect-[9/16] max-h-[500px] w-full bg-black rounded-3xl overflow-hidden shadow-2xl group">
                          <video 
                            key={videoUrls[activeVideoIndex]}
                            src={videoUrls[activeVideoIndex]} 
                            className="w-full h-full object-cover"
                            controls
                          />
                          <button 
                            onClick={reset}
                            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors z-10"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {files.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveVideoIndex(idx)}
                              className={`
                                flex-shrink-0 w-16 h-24 rounded-xl border-2 transition-all overflow-hidden
                                ${activeVideoIndex === idx ? 'border-emerald-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}
                              `}
                            >
                              <video src={videoUrls[idx]} className="w-full h-full object-cover" />
                            </button>
                          ))}
                          {files.length < 10 && (
                            <button 
                              {...getRootProps()}
                              className="flex-shrink-0 w-16 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <input {...getInputProps()} />
                              <Upload className="w-5 h-5 text-gray-400" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {files.length > 0 && Object.keys(results).length < files.length && !isAnalyzing && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={analyzeVideos}
                      className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Analyze {files.length} Videos
                    </motion.button>
                  )}
                </section>

                {/* Right Column: Results */}
                <section className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-black/5 min-h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Hash className="w-5 h-5 text-emerald-600" />
                        Analysis Results {files.length > 1 && `(${activeVideoIndex + 1}/${files.length})`}
                      </h2>
                      {isAnalyzing && !results[activeVideoIndex] && (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </div>
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      {isAnalyzing && !results[activeVideoIndex] ? (
                        <motion.div 
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
                        >
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <p className="text-gray-500 font-medium">Gemini is watching video #{activeVideoIndex + 1}...</p>
                          <p className="text-xs text-gray-400">This usually takes 10-20 seconds</p>
                        </motion.div>
                      ) : results[activeVideoIndex] ? (
                        <motion.div 
                          key={`result-${activeVideoIndex}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-8"
                        >
                          {/* Titles Result */}
                          <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                              <TypeIcon className="w-3 h-3" />
                              Hook Captions (Choose one)
                            </label>
                            <div className="space-y-3">
                              {results[activeVideoIndex].titles.map((title, index) => (
                                <motion.div 
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="group relative p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all"
                                >
                                  <div className="pr-10 font-medium text-sm md:text-base leading-relaxed">
                                    {title}
                                  </div>
                                  <button 
                                    onClick={() => copyToClipboard(title, `title-${activeVideoIndex}-${index}`)}
                                    className="absolute top-3 right-3 p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                                    title="Copy caption"
                                  >
                                    {copyStatus === `title-${activeVideoIndex}-${index}` ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                  </button>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Hashtags Result */}
                          <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              Related Hashtags
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {results[activeVideoIndex].hashtags.map((tag, i) => (
                                <motion.span
                                  key={tag}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100"
                                >
                                  #{tag.replace(/^#/, '')}
                                </motion.span>
                              ))}
                            </div>
                            <button 
                              onClick={() => copyToClipboard(results[activeVideoIndex].hashtags.map(t => `#${t.replace(/^#/, '')}`).join(' '), `hashtags-${activeVideoIndex}`)}
                              className="w-full mt-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                              {copyStatus === `hashtags-${activeVideoIndex}` ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              {copyStatus === `hashtags-${activeVideoIndex}` ? 'Copied All' : 'Copy All Hashtags'}
                            </button>
                          </div>
                        </motion.div>
                      ) : error ? (
                        <motion.div 
                          key="error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
                        >
                          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                          </div>
                          <p className="text-red-600 font-medium">{error}</p>
                          <button 
                            onClick={analyzeVideos}
                            className="text-sm font-bold text-gray-900 underline underline-offset-4"
                          >
                            Try Again
                          </button>
                        </motion.div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 text-gray-400">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                            <Video className="w-8 h-8 opacity-20" />
                          </div>
                          <p className="max-w-[200px]">Upload videos to see AI-generated hook captions and hashtags.</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Tips Card */}
                  <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-lg overflow-hidden relative">
                    <div className="relative z-10">
                      <h4 className="font-bold mb-2">Pro Tip</h4>
                      <p className="text-sm text-emerald-100 leading-relaxed">
                        Short, high-energy videos (5-15s) perform best with AI analysis. Make sure the lighting is good for better visual recognition!
                      </p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-800 rounded-full blur-2xl opacity-50"></div>
                  </div>
                </section>
              </main>
        </div>
      </div>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mb-6 shadow-lg border-4 border-white">
                  <span className="text-4xl font-bold text-white">S</span>
                </div>

                {/* Name & Title */}
                <h3 className="text-2xl font-bold tracking-tight text-[#1A1A1A] mb-1">Suraj Kumar</h3>
                <p className="text-sm font-medium text-emerald-600 mb-8">Professional Web Developer</p>

                {/* Bio Box */}
                <div className="bg-gray-50 rounded-3xl p-6 text-left mb-8 border border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    I am Suraj Kumar, a web developer who created and developed <span className="font-bold text-gray-900">SoraDown.In</span> — a modern, user-friendly website built with creativity, simplicity, and performance in mind.
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    I build fast, responsive, and professional websites for individuals, startups, and businesses. Whether you need a personal portfolio, business site, or custom web project — I can bring your ideas to life.
                  </p>
                </div>

                {/* WhatsApp Button */}
                <a 
                  href="https://wa.me/923098640287"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#20ba5a] transition-all shadow-lg shadow-green-500/20"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  Contact on WhatsApp
                </a>

                {/* Close Button */}
                <button 
                  onClick={() => setShowAbout(false)}
                  className="mt-6 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Us Modal */}
      <AnimatePresence>
        {showContact && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContact(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-[#1A1A1A] mb-4">Contact Us</h3>
                <div className="space-y-4 w-full">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email Support</p>
                    <p className="text-sm font-medium text-gray-900">surajustad2026@gmail.com</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">WhatsApp</p>
                    <p className="text-sm font-medium text-gray-900">+92 309 8640287</p>
                  </div>
                </div>
                <a 
                  href="https://wa.me/923098640287"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-8 py-4 bg-[#25D366] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#20ba5a] transition-all shadow-lg shadow-green-500/20"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  Chat on WhatsApp
                </a>
                <button 
                  onClick={() => setShowContact(false)}
                  className="mt-6 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Disclaimer Modal */}
      <AnimatePresence>
        {showDisclaimer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDisclaimer(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Disclaimer</h3>
                </div>
                <div className="space-y-4 text-sm text-gray-600 leading-relaxed overflow-y-auto max-h-[60vh] pr-2">
                  <p>
                    The information provided by <span className="font-bold">HookGen AI</span> is for general informational purposes only. All information on the site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability or completeness of any information on the site.
                  </p>
                  <p>
                    <span className="font-bold text-gray-900">AI-Generated Content:</span> The hook captions and hashtags are generated using artificial intelligence (Google Gemini). While we strive for high quality, the AI may occasionally produce content that is inaccurate, inappropriate, or not suitable for your specific needs.
                  </p>
                  <p>
                    <span className="font-bold text-gray-900">User Responsibility:</span> You are solely responsible for the content you publish on social media platforms. We recommend reviewing all AI-generated suggestions before use.
                  </p>
                  <p>
                    Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.
                  </p>
                </div>
                <button 
                  onClick={() => setShowDisclaimer(false)}
                  className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacy(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Privacy Policy</h3>
                </div>
                <div className="space-y-4 text-sm text-gray-600 leading-relaxed overflow-y-auto max-h-[60vh] pr-2">
                  <p>
                    At <span className="font-bold">HookGen AI</span>, we prioritize your privacy. This policy outlines how we handle your data.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900">1. Video Data</h4>
                    <p>We do not store your uploaded videos on our servers. Videos are processed temporarily to generate analysis and are then discarded.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900">2. API Keys</h4>
                    <p>If you provide your own Gemini API key, it is stored locally in your browser's <span className="italic">localStorage</span>. It is never sent to our servers or shared with third parties.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900">3. Third-Party Services</h4>
                    <p>We use Google Gemini API to analyze video content. By using this app, you agree to Google's privacy terms regarding API usage.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900">4. Cookies</h4>
                    <p>We use minimal local storage to remember your settings and API configuration for a better user experience.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPrivacy(false)}
                  className="w-full mt-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                      <Settings className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">Settings</h3>
                  </div>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={saveSettings} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Key className="w-3 h-3" />
                      Gemini API Key
                    </label>
                    <div className="relative">
                      <input 
                        type="password"
                        placeholder="Enter your API key"
                        value={userApiKey}
                        onChange={(e) => setUserApiKey(e.target.value)}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                      />
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Your API key is stored locally in your browser's storage and is never sent to our servers.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowSettings(false)}
                      className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-black/5 px-4 md:px-8 py-8 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            © 2024 HookGen AI. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowAbout(true)}
              className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => setShowContact(true)}
              className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
            >
              Contact Us
            </button>
            <button 
              onClick={() => setShowDisclaimer(true)}
              className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
            >
              Disclaimer
            </button>
            <button 
              onClick={() => setShowPrivacy(true)}
              className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setShowContact(true)}
              className="px-4 py-2 border border-gray-200 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <LifeBuoy className="w-4 h-4" />
              Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
