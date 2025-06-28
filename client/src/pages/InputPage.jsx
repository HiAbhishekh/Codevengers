import React, { useState, useEffect, useRef } from "react";
import Toast from "../components/Toast";
import DarkModeToggle from "../components/DarkModeToggle";
import KeyboardShortcuts from "../components/KeyboardShortcuts";
import LoginModal from "../components/LoginModal";
import UserProfile from "../components/UserProfile";
import { useAuth } from "../contexts/AuthContext";

const skillLevels = ["Beginner", "Intermediate", "Advanced"];
const domains = ["Coding", "Hardware", "Research", "Design"];

// Simple icon components
const SparkleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const BuildIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ConfettiIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l.5 1.5L14 4l-1.5.5L12 6l-.5-1.5L10 4l1.5-.5L12 2zM8 7l.5 1.5L10 9l-1.5.5L8 11l-.5-1.5L6 9l1.5-.5L8 7zM16 7l.5 1.5L18 9l-1.5.5L16 11l-.5-1.5L14 9l1.5-.5L16 7zM6 16l.5 1.5L8 18l-1.5.5L6 20l-.5-1.5L4 18l1.5-.5L6 16zM18 16l.5 1.5L20 18l-1.5.5L18 20l-.5-1.5L16 18l1.5-.5L18 16z"/>
  </svg>
);

export default function InputPage({ onGenerate, isDarkMode, setIsDarkMode }) {
  const { currentUser } = useAuth();
  const [concept, setConcept] = useState("");
  const [level, setLevel] = useState(skillLevels[0]);
  const [domain, setDomain] = useState(domains[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [toast, setToast] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [typingEffect, setTypingEffect] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const conceptInputRef = useRef(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + D for dark mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        setIsDarkMode(!isDarkMode);
        setToast({ message: `${isDarkMode ? 'Light' : 'Dark'} mode activated!`, type: 'info' });
      }
      
      // Enter to submit when ready
      if (e.key === 'Enter' && concept.trim() && !validationError && !isGenerating) {
        e.preventDefault();
        handleGenerate();
      }
      
      // Focus input with Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        conceptInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDarkMode, concept, validationError, isGenerating]);

  // Typing effect for placeholder
  useEffect(() => {
    const placeholders = [
      "Recursion",
      "Machine Learning", 
      "Photosynthesis",
      "React Hooks",
      "Neural Networks",
      "Quantum Physics"
    ];
    
    let currentIndex = 0;
    let currentText = "";
    let isDeleting = false;
    
    const typeEffect = () => {
      const fullText = placeholders[currentIndex];
      
      if (isDeleting) {
        currentText = fullText.substring(0, currentText.length - 1);
      } else {
        currentText = fullText.substring(0, currentText.length + 1);
      }
      
      setTypingEffect(currentText);
      
      let typeSpeed = isDeleting ? 50 : 100;
      
      if (!isDeleting && currentText === fullText) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && currentText === '') {
        isDeleting = false;
        currentIndex = (currentIndex + 1) % placeholders.length;
        typeSpeed = 500;
      }
      
      setTimeout(typeEffect, typeSpeed);
    };
    
    if (!isFocused && !concept) {
      typeEffect();
    }
  }, [isFocused, concept]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const validateConcept = (value) => {
    if (value.length > 0 && value.length < 3) {
      setValidationError("Please enter at least 3 characters");
      return false;
    } else if (value.length > 50) {
      setValidationError("Concept name is too long (max 50 characters)");
      return false;
    } else {
      setValidationError("");
      return true;
    }
  };

  const handleConceptChange = (e) => {
    const value = e.target.value;
    setConcept(value);
    validateConcept(value);
  };

  const createConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleGenerate = async () => {
    // Check if user is signed in
    if (!currentUser) {
      setShowLoginModal(true);
      setToast({ message: "Please sign in to generate project ideas", type: "info" });
      return;
    }

    if (!validateConcept(concept)) {
      setToast({ message: "Please fix the validation errors", type: "error" });
      return;
    }

    setIsGenerating(true);
    setToast({ message: "🤖 AI is generating amazing project ideas...", type: "info" });
    
    try {
      const response = await fetch('http://localhost:5050/api/generate-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concept: concept.trim(),
          skillLevel: level,
          domain: domain,
          numIdeas: 10
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate projects');
      }

      setIsGenerating(false);
      setToast({ message: "✨ Project ideas generated successfully!", type: "success" });
      createConfetti();
      
      // Navigate to results page with the generated data
      setTimeout(() => {
        onGenerate({ 
          concept, 
          level, 
          domain, 
          projects: data.projects,
          generatedAt: data.generatedAt 
        });
      }, 1000);

    } catch (error) {
      console.error('Error generating projects:', error);
      setIsGenerating(false);
      
      // Try fallback to mock endpoint
      setToast({ message: "🔄 Trying alternative method...", type: "info" });
      
      try {
        const fallbackResponse = await fetch('http://localhost:5050/api/generate-projects/mock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            concept: concept.trim(),
            skillLevel: level,
            domain: domain,
            numIdeas: 10
          })
        });

        const fallbackData = await fallbackResponse.json();

        if (fallbackResponse.ok) {
          setToast({ message: "🎯 Project ideas generated (demo mode)!", type: "success" });
          createConfetti();
          
          setTimeout(() => {
            onGenerate({ 
              concept, 
              level, 
              domain, 
              projects: fallbackData.projects,
              generatedAt: fallbackData.generatedAt,
              isDemoMode: true 
            });
          }, 1000);
        } else {
          throw new Error('Backend server not available');
        }
             } catch (fallbackError) {
         console.error('Fallback error:', fallbackError);
         setToast({ 
           message: "❌ Unable to connect to server. Please make sure the backend is running.", 
           type: "error" 
         });
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    setToast({ message: `${!isDarkMode ? 'Dark' : 'Light'} mode activated!`, type: 'info' });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-all duration-500 p-4 overflow-hidden relative ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'
    }`}>
      
      {/* Header with authentication */}
      <div className="fixed top-4 left-4 right-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />
          <KeyboardShortcuts />
        </div>
        
        <div className="flex items-center gap-4">
          {currentUser ? (
            <UserProfile isDarkMode={isDarkMode} />
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70'
              } backdrop-blur-lg`}
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        isDarkMode={isDarkMode} 
      />
      
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            >
              <ConfettiIcon />
            </div>
          ))}
        </div>
      )}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob ${
          isDarkMode ? 'bg-purple-600' : 'bg-purple-300'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 ${
          isDarkMode ? 'bg-pink-600' : 'bg-yellow-300'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 ${
          isDarkMode ? 'bg-blue-600' : 'bg-pink-300'
        }`}></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full opacity-20 animate-float ${
              isDarkMode ? 'bg-purple-300' : 'bg-purple-400'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div 
          className={`backdrop-blur-lg rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:scale-[1.02] relative overflow-hidden ${
            isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
          }`}
          onMouseMove={handleMouseMove}
        >
          {/* Gradient follow cursor effect */}
          <div 
            className="absolute w-40 h-40 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl pointer-events-none transition-all duration-200"
            style={{
              left: `${mousePosition.x - 80}px`,
              top: `${mousePosition.y - 80}px`
            }}
          />

          <div className="text-center mb-8 relative">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 animate-bounce text-white">
              <BuildIcon />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              BuildPro
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Transform your learning into hands-on projects with AI-powered suggestions
            </p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                validationError 
                  ? 'text-red-500' 
                  : isDarkMode 
                  ? 'text-gray-200' 
                  : 'text-gray-700'
              }`}>
                What did you learn today?
              </label>
              <div className="relative">
                <input
                  ref={conceptInputRef}
                  type="text"
                  className={`w-full px-4 py-3 pr-10 border-2 rounded-xl transition-all duration-300 ${
                    validationError 
                      ? 'border-red-400 focus:border-red-500 focus:shadow-lg focus:shadow-red-100' 
                      : isFocused 
                      ? 'border-purple-400 shadow-lg shadow-purple-100' 
                      : isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-200 bg-white'
                  } focus:outline-none ${isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'}`}
                  placeholder={!isFocused && !concept ? `e.g., ${typingEffect}|` : "e.g., Recursion, Neural Networks..."}
                  value={concept}
                  onChange={handleConceptChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
                <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  concept ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                }`}>
                  {validationError ? (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <div className={isDarkMode ? 'text-purple-300' : 'text-purple-500'}>
                      <SparkleIcon />
                    </div>
                  )}
                </div>
              </div>
              {validationError && (
                <p className="text-red-500 text-xs mt-1 animate-pulse">{validationError}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Skill Level
                </label>
                <div className="relative group">
                  <select
                    className={`w-full px-3 py-3 border-2 rounded-xl appearance-none cursor-pointer hover:border-purple-300 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-100 transition-all duration-300 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-200 bg-white'
                    }`}
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                  >
                    {skillLevels.map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none group-hover:rotate-180 transition-transform duration-300">
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Domain
                </label>
                <div className="relative group">
                  <select
                    className={`w-full px-3 py-3 border-2 rounded-xl appearance-none cursor-pointer hover:border-purple-300 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-100 transition-all duration-300 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-200 bg-white'
                    }`}
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                  >
                    {domains.map(dom => (
                      <option key={dom} value={dom}>{dom}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none group-hover:rotate-180 transition-transform duration-300">
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!concept.trim() || isGenerating || validationError}
              className={`mt-6 w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                !concept.trim() || validationError
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : isGenerating
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400 cursor-wait animate-pulse-glow'
                  : currentUser
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="loading-dots">Generating Ideas</span>
                </div>
              ) : !currentUser ? (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Sign In to Generate Ideas</span>
                </div>
              ) : !currentUser ? (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Sign In to Generate Ideas</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Generate Project Ideas</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {!currentUser && (
              <div className={`mb-3 p-3 rounded-lg ${isDarkMode ? 'bg-orange-900/30 border border-orange-800/30' : 'bg-orange-50 border border-orange-200'}`}>
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-800'}`}>
                    Sign in required to generate AI-powered project ideas
                  </p>
                </div>
              </div>
            )}
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {currentUser ? 'Powered by AI • Get 3 personalized project ideas instantly' : 'Create an account or sign in with Google to get started'}
            </p>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Press <kbd className={`px-1 py-0.5 rounded text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Ctrl + /</kbd> for shortcuts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 