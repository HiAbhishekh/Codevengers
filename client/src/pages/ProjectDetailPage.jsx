import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';
import Toast from '../components/Toast';
import LoginModal from '../components/LoginModal';
import UserProfile from '../components/UserProfile';
import { useAuth } from '../contexts/AuthContext';

export default function ProjectDetailPage({ isDarkMode, setIsDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const project = location.state?.project;
  const [toast, setToast] = useState(null);
  const [prerequisites, setPrerequisites] = useState(null);
  const [isLoadingPrerequisites, setIsLoadingPrerequisites] = useState(false);

  const [checkedItems, setCheckedItems] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (project) {
      loadPrerequisites();
    }
  }, [project]);

  const loadPrerequisites = async () => {
    setIsLoadingPrerequisites(true);
    try {
      const response = await fetch('http://localhost:5050/api/generate-prerequisites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectTitle: project.title,
          projectDescription: project.description,
          tools: project.tools,
          domain: project.domain,
          skillLevel: project.difficulty
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prerequisites');
      }

      setPrerequisites(data.prerequisites);
      setToast({ message: "✨ Prerequisites generated successfully!", type: "success" });
    } catch (error) {
      console.error('Error loading prerequisites:', error);
      setToast({ message: "Failed to load prerequisites", type: "error" });
    } finally {
      setIsLoadingPrerequisites(false);
    }
  };

  const handleCheckItem = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    const newCheckedItems = new Set(checkedItems);
    
    if (newCheckedItems.has(key)) {
      newCheckedItems.delete(key);
    } else {
      newCheckedItems.add(key);
    }
    
    setCheckedItems(newCheckedItems);
  };



  const getTotalItems = () => {
    if (!prerequisites) return 0;
    return prerequisites.prerequisites.reduce((total, category) => total + category.items.length, 0);
  };

  const getCheckedCount = () => {
    return checkedItems.size;
  };

  const isAllChecked = () => {
    return getCheckedCount() === getTotalItems() && getTotalItems() > 0;
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-600">No project data found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    try {
      const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
      const isAlreadySaved = savedProjects.some(p => p.title === project.title);
      if (isAlreadySaved) {
        setToast({ message: 'Project already saved!', type: 'info' });
        return;
      }
      savedProjects.push({ ...project, savedAt: new Date().toISOString() });
      localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
      setToast({ message: 'Project saved successfully!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save project', type: 'error' });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ message: 'Link copied to clipboard!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to copy link', type: 'error' });
    }
  };

  const handleStartProject = () => {
    navigate('/project-learning', { 
      state: { 
        project, 
        prerequisites,
        isUnlocked: true 
      } 
    });
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900'
        : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'
    }`}>
      {/* Header with authentication */}
      <div className="fixed top-4 left-4 right-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <DarkModeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
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
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      
      {/* Main Content - Add top padding to account for fixed header */}
      <div className="container mx-auto px-4 pt-20 pb-8 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className={`mb-6 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            isDarkMode
              ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              : 'bg-white/50 text-gray-700 hover:bg-white/70'
          } backdrop-blur-lg`}
        >
          ← Back to Results
        </button>
        
        <div className={`rounded-2xl shadow-xl p-8 ${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-lg`}>
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{project.title}</h1>
          <p className={`mb-4 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{project.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tools.map((tool, idx) => (
              <span key={idx} className={`px-2 py-1 text-xs rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{tool}</span>
            ))}
          </div>
          
          <div className="mb-6 flex flex-wrap gap-4 text-sm">
            <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{project.timeEstimate}</span>
            </span>
            <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-medium">{project.domain}</span>
            </span>
            <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Level {project.difficulty}</span>
            </span>
          </div>

          {/* Prerequisites Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  📚 Prerequisites Check
                </h2>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  Required before you start
                </div>
              </div>
              {prerequisites && (
                <div className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  getCheckedCount() === getTotalItems() && getTotalItems() > 0
                    ? (isDarkMode ? 'bg-green-900/50 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-200')
                    : (isDarkMode ? 'bg-blue-900/50 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200')
                }`}>
                  {getCheckedCount()}/{getTotalItems()} completed
                </div>
              )}
            </div>

            {isLoadingPrerequisites ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Generating prerequisites...</p>
              </div>
            ) : prerequisites ? (
              <div className="space-y-6">
                {prerequisites.prerequisites.map((category, categoryIndex) => (
                  <div key={categoryIndex} className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className={`font-semibold mb-3 text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {category.category}
                    </h3>
                    <div className="space-y-3">
                      {category.items.map((item, itemIndex) => {
                        const key = `${categoryIndex}-${itemIndex}`;
                        const isChecked = checkedItems.has(key);
                        return (
                          <div key={itemIndex} className={`flex items-start space-x-3 p-3 rounded-lg transition-all ${
                            isChecked 
                              ? (isDarkMode ? 'bg-green-900/30 border border-green-700/30' : 'bg-green-50 border border-green-200')
                              : (isDarkMode ? 'bg-gray-600/30' : 'bg-white')
                          }`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckItem(categoryIndex, itemIndex)}
                              className="mt-1 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {item.title}
                                </h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.importance === 'Essential' 
                                    ? (isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800')
                                    : item.importance === 'Important'
                                    ? (isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800')
                                    : (isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800')
                                }`}>
                                  {item.importance}
                                </span>
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {item.estimatedTime}
                                </span>
                              </div>
                              <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {item.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {item.resources.map((resource, idx) => (
                                  <a
                                    key={idx}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-lg transition-all hover:scale-105 ${
                                      resource.type === 'YouTube'
                                        ? (isDarkMode ? 'bg-red-900/50 text-red-300 hover:bg-red-800/50' : 'bg-red-100 text-red-800 hover:bg-red-200')
                                        : resource.type === 'Website'
                                        ? (isDarkMode ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/50' : 'bg-blue-100 text-blue-800 hover:bg-blue-200')
                                        : resource.type === 'Documentation'
                                        ? (isDarkMode ? 'bg-green-900/50 text-green-300 hover:bg-green-800/50' : 'bg-green-100 text-green-800 hover:bg-green-200')
                                        : resource.type === 'Course'
                                        ? (isDarkMode ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50' : 'bg-purple-100 text-purple-800 hover:bg-purple-200')
                                        : (isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                                    }`}
                                  >
                                    {/* Resource Type Icons */}
                                    {resource.type === 'YouTube' && (
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                      </svg>
                                    )}
                                    {resource.type === 'Website' && (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                      </svg>
                                    )}
                                    {resource.type === 'Documentation' && (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    )}
                                    {resource.type === 'Course' && (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                      </svg>
                                    )}
                                    {resource.type === 'Book' && (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                      </svg>
                                    )}
                                    <span className="font-medium">{resource.title}</span>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                ))}
                              </div>
                              {/* Resource Details */}
                              <div className="mt-2 space-y-1">
                                {item.resources.map((resource, idx) => (
                                  <div key={idx} className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <span className="font-medium">{resource.duration}</span> • {resource.description}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Proceed to Build Button */}
                <div className="text-center pt-6">
                  {isAllChecked() ? (
                    <button
                      onClick={handleStartProject}
                      className="px-10 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mx-auto"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Proceed to Build
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  ) : (
                    <div className={`px-8 py-4 rounded-xl font-medium border-2 border-dashed ${
                      isDarkMode ? 'bg-gray-800/50 text-gray-400 border-gray-600' : 'bg-gray-50 text-gray-500 border-gray-300'
                    } flex items-center justify-center gap-3`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Complete all prerequisites to proceed
                    </div>
                  )}
                </div>

                {/* Learning Path */}
                {prerequisites.learningPath && (
                  <div className={`mt-6 p-4 rounded-lg ${
                    isDarkMode ? 'bg-purple-900/30 border border-purple-800/30' : 'bg-purple-50 border border-purple-200'
                  }`}>
                    <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      🗺️ Recommended Learning Path
                    </h4>
                    <ol className="space-y-2">
                      {prerequisites.learningPath.map((step, idx) => (
                        <li key={idx} className={`flex items-start text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3 flex-shrink-0 ${
                            isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {idx + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ) : (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Failed to load prerequisites
              </div>
            )}
          </div>

          {/* Motivational Tip */}
          <div className={`p-6 rounded-xl mb-8 ${isDarkMode ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-800/30' : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'}`}>
            <h2 className={`font-semibold mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Pro Tip
            </h2>
            <p className={`text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{project.motivationalTip}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={handleSave} 
              className="flex-1 py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Save Project
            </button>
            <button 
              onClick={handleShare} 
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 