import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import UserProfile from '../components/UserProfile';

const SavedProjectsPage = ({ isDarkMode, setIsDarkMode }) => {
  const { currentUser, getSavedProjects, toggleProjectFavorite, deleteProject, getProjectStats, moveToActive } = useAuth();
  const [savedProjects, setSavedProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const [saved, projectStats] = await Promise.all([
        getSavedProjects(),
        getProjectStats()
      ]);
      setSavedProjects(saved);
      setStats(projectStats);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (project) => {
    // Navigate to project detail page with the project data
    navigate(`/project/${project.id}`, { 
      state: { project } 
    });
  };

  const handleStartProject = async (project) => {
    try {
      const activeProjectId = await moveToActive(project.id);
      await loadProjects();
      
      // Navigate to the learning page with the newly created active project
      navigate('/project-learning', { 
        state: { 
          project: { ...project, id: activeProjectId },
          isFromSaved: true
        } 
      });
    } catch (error) {
      console.error('Error starting project:', error);
    }
  };

  const handleToggleFavorite = async (projectId, currentStatus) => {
    try {
      await toggleProjectFavorite(projectId, !currentStatus);
      await loadProjects();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this saved project?')) {
      try {
        await deleteProject(projectId);
        await loadProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleClearTestData = async () => {
    if (window.confirm('⚠️ This will delete ALL saved projects containing "test" in the title. Are you sure?')) {
      try {
        // Filter out any projects with "test" in the title (case insensitive)
        const testProjects = savedProjects.filter(project => 
          project.title.toLowerCase().includes('test')
        );
        
        for (const project of testProjects) {
          await deleteProject(project.id);
        }
        
        await loadProjects();
        console.log(`✅ Cleared ${testProjects.length} test projects`);
      } catch (error) {
        console.error('Error clearing test data:', error);
      }
    }
  };

  const getFilteredSavedProjects = () => {
    switch (filter) {
      case 'favorites':
        return savedProjects.filter(p => p.isFavorite);
      default:
        return savedProjects;
    }
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Please Sign In</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>You need to be logged in to view saved projects.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Header */}
      <div className="fixed top-4 left-4 right-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <DarkModeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          <KeyboardShortcuts isDarkMode={isDarkMode} />
          <button
            onClick={() => navigate('/')}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
              isDarkMode 
                ? 'bg-gray-800/50 hover:bg-gray-700/50 text-white' 
                : 'bg-white/50 hover:bg-white/70 text-gray-700'
            } backdrop-blur-lg`}
          >
            🏠 Home
          </button>
          <button
            onClick={() => navigate('/my-projects')}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
              isDarkMode 
                ? 'bg-gray-800/50 hover:bg-gray-700/50 text-white' 
                : 'bg-white/50 hover:bg-white/70 text-gray-700'
            } backdrop-blur-lg`}
          >
            🚀 My Projects
          </button>
        </div>
        <div className="flex items-center gap-4">
          {currentUser ? (
            <UserProfile isDarkMode={isDarkMode} />
          ) : (
            <button className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
              isDarkMode 
                ? 'bg-gray-800/50 hover:bg-gray-700/50 text-white' 
                : 'bg-white/50 hover:bg-white/70 text-gray-700'
            } backdrop-blur-lg`}>
              Sign In
            </button>
          )}
        </div>
      </div>

      <div className="pt-20 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section with Amazing Design */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-90 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 backdrop-blur-sm rounded-3xl"></div>
            <div className="relative text-white p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce">
                  <span className="text-3xl">📚</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Saved Projects</h1>
                  <p className="text-purple-100 text-xl">Your curated collection of amazing ideas</p>
                </div>
              </div>
              
              {/* Animated Stats */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Saved', value: stats.totalSaved, color: 'from-purple-400 to-purple-600', icon: '📖' },
                    { label: 'Favorites', value: savedProjects.filter(p => p.isFavorite).length, color: 'from-pink-400 to-pink-600', icon: '❤️' },
                    { label: 'Started', value: stats.totalActive, color: 'from-blue-400 to-blue-600', icon: '🚀' },
                    { label: 'Completed', value: stats.completed, color: 'from-green-400 to-green-600', icon: '✅' }
                  ].map((stat, index) => (
                    <div key={stat.label} className={`transform transition-all duration-700 delay-${index * 100} hover:scale-110`}>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{stat.icon}</span>
                          <div>
                            <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                              {stat.value}
                            </div>
                            <div className="text-white/80 text-sm">{stat.label}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin"></div>
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Loading your amazing projects...
              </p>
            </div>
          ) : (
            <>
              {/* Enhanced Filter Buttons */}
              <div className="flex gap-3 mb-8 flex-wrap">
                {[
                  { key: 'all', label: 'All Projects', icon: '📁', count: savedProjects.length },
                  { key: 'favorites', label: 'Favorites', icon: '❤️', count: savedProjects.filter(p => p.isFavorite).length }
                ].map(({ key, label, icon, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`group relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      filter === key
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : `${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'} hover:shadow-md`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{icon}</span>
                      <span>{label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        filter === key ? 'bg-white/20' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {count}
                      </span>
                    </div>
                    {filter === key && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-20 animate-pulse"></div>
                    )}
                  </button>
                ))}
                
                {/* Debug: Clear Test Data - Only in development */}
                {import.meta.env.DEV && savedProjects.some(p => p.title.toLowerCase().includes('test')) && (
                  <button
                    onClick={handleClearTestData}
                    className={`px-4 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isDarkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-600 hover:bg-red-200'
                    } hover:shadow-md`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🗑️</span>
                      <span>Clear Test Data</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Projects Grid - Enhanced Design */}
              {getFilteredSavedProjects().length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                    <span className="text-4xl">🎯</span>
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {filter === 'favorites' ? 'No Favorites Yet' : 'No Projects Saved'}
                  </h3>
                  <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {filter === 'favorites' 
                      ? 'Start marking projects as favorites to see them here!' 
                      : 'Generate and save some amazing project ideas to get started!'}
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    🎯 Generate New Projects
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {getFilteredSavedProjects().map((project, index) => (
                    <div 
                      key={project.id} 
                      className={`group relative p-6 rounded-2xl border transition-all duration-500 hover:scale-[1.02] hover:shadow-xl transform ${
                        isDarkMode ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800' : 'bg-white/80 border-gray-200/50 hover:bg-white'
                      } backdrop-blur-sm`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Favorite Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(project.id, project.isFavorite);
                          }}
                          className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center ${
                            project.isFavorite 
                              ? 'bg-red-500 text-white scale-110 animate-pulse' 
                              : 'bg-gray-200 text-gray-400 hover:bg-red-100 hover:text-red-500'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                      </div>

                      {/* Project Content - Make clickable */}
                      <div 
                        className="space-y-4 cursor-pointer"
                        onClick={() => handleProjectClick(project)}
                      >
                        <div>
                          <h3 className={`text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {project.title}
                          </h3>
                          <p className={`text-sm line-clamp-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {project.description}
                          </p>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                            ⏱️ {project.timeEstimate}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                            🎯 {project.difficulty}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>
                            🏷️ {project.domain}
                          </span>
                        </div>

                        {/* Steps Preview */}
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          📋 {project.steps?.length || 0} implementation steps
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartProject(project);
                          }}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          🚀 Start Project
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className={`px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Hover Effect Gradient */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedProjectsPage; 