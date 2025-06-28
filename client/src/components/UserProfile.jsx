import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SimpleAvatar from './SimpleAvatar';

export default function UserProfile({ isDarkMode }) {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleTestFirestore = async () => {
    try {
      // Import the test function dynamically to avoid issues in production
      const { testFirestoreAccess } = await import('../utils/firebaseTest');
      await testFirestoreAccess();
    } catch (error) {
      console.error('Error running Firestore test:', error);
    }
    
    setIsOpen(false);
  };

  const handleNavigateToSaved = () => {
    setIsOpen(false);
    navigate('/saved-projects');
  };

  const handleNavigateToLearning = () => {
    setIsOpen(false);
    navigate('/my-projects');
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isDarkMode 
            ? 'bg-gray-800/50 hover:bg-gray-700/50 text-white' 
            : 'bg-white/50 hover:bg-white/70 text-gray-700'
        } backdrop-blur-lg`}
      >
        <SimpleAvatar user={currentUser} size={32} />
        <span className="hidden sm:block text-sm font-medium">
          {currentUser.displayName || currentUser.email?.split('@')[0]}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl py-3 z-50 ${
          isDarkMode ? 'bg-gray-800/95 border border-gray-700/50' : 'bg-white/95 border border-gray-200/50'
        } backdrop-blur-xl`}>
          
          {/* User Info */}
          <div className="px-5 py-4 border-b border-gray-300/20">
            <div className="flex items-center gap-3">
              <SimpleAvatar user={currentUser} size={48} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentUser.displayName || 'User'}
                </p>
                <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentUser.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/profile');
              }}
              className={`w-full px-5 py-3 text-left text-sm transition-all rounded-lg mx-2 ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              } flex items-center gap-3 font-medium`}
            >
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p>Profile Settings</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Manage your account</p>
              </div>
            </button>
            
            <button
              onClick={handleNavigateToSaved}
              className={`w-full px-5 py-3 text-left text-sm transition-all rounded-lg mx-2 ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              } flex items-center gap-3 font-medium`}
            >
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <div>
                <p>Saved Projects</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>View your bookmarks</p>
              </div>
            </button>

            <button
              onClick={handleNavigateToLearning}
              className={`w-full px-5 py-3 text-left text-sm transition-all rounded-lg mx-2 ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              } flex items-center gap-3 font-medium`}
            >
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p>Learning Dashboard</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Track your progress</p>
              </div>
            </button>

            {/* Debug Button - Only in development */}
            {import.meta.env.DEV && (
              <button
                onClick={handleTestFirestore}
                className={`w-full px-5 py-3 text-left text-sm transition-all rounded-lg mx-2 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                } flex items-center gap-3 font-medium`}
              >
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p>Test Firestore</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Debug database access</p>
                </div>
              </button>
            )}

            <div className="border-t border-gray-300/20 my-3 mx-2"></div>
            
            <button
              onClick={handleLogout}
              className={`w-full px-5 py-3 text-left text-sm transition-all rounded-lg mx-2 ${
                isDarkMode 
                  ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
                  : 'text-red-600 hover:bg-red-50 hover:text-red-700'
              } flex items-center gap-3 font-medium`}
            >
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <p>Sign Out</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>See you later!</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 