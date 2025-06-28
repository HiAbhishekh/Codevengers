import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import UserProfile from '../components/UserProfile';

const MyProjectsPage = ({ isDarkMode, setIsDarkMode }) => {
  const { currentUser, getActiveProjects, updateProjectProgress, deleteActiveProject, getProjectStats } = useAuth();
  const [activeProjects, setActiveProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingNotes, setEditingNotes] = useState(null);
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const [active, projectStats] = await Promise.all([
        getActiveProjects(),
        getProjectStats()
      ]);
      setActiveProjects(active);
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

  const handleStepToggle = async (projectId, stepIndex, isCompleted) => {
    try {
      const project = activeProjects.find(p => p.id === projectId);
      const completedSteps = [...(project.progress?.completedSteps || [])];
      
      if (isCompleted) {
        if (!completedSteps.includes(stepIndex)) {
          completedSteps.push(stepIndex);
        }
      } else {
        const index = completedSteps.indexOf(stepIndex);
        if (index > -1) {
          completedSteps.splice(index, 1);
        }
      }

      const currentStep = completedSteps.length > 0 ? Math.max(...completedSteps) + 1 : 0;
      
      await updateProjectProgress(projectId, completedSteps, currentStep);
      await loadProjects();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleNotesUpdate = async (projectId) => {
    try {
      const project = activeProjects.find(p => p.id === projectId);
      await updateProjectProgress(
        projectId, 
        project.progress?.completedSteps || [], 
        project.progress?.currentStep || 0, 
        notes
      );
      await loadProjects();
      setEditingNotes(null);
      setNotes('');
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const handleDeleteActiveProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this active project?')) {
      try {
        await deleteActiveProject(projectId);
        await loadProjects();
      } catch (error) {
        console.error('Error deleting active project:', error);
      }
    }
  };

  const getFilteredActiveProjects = () => {
    switch (filter) {
      case 'active':
        return activeProjects.filter(p => p.status === 'active');
      case 'completed':
        return activeProjects.filter(p => p.status === 'completed');
      case 'paused':
        return activeProjects.filter(p => p.status === 'paused');
      default:
        return activeProjects;
    }
  };

  const getProgressPercentage = (project) => {
    if (!project.progress || !project.steps) return 0;
    return Math.round((project.progress.completedSteps.length / project.steps.length) * 100);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: '🚀',
      completed: '✅',
      paused: '⏸️'
    };
    return icons[status] || '📝';
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Please Sign In</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>You need to be logged in to view your projects.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-emerald-900 to-teal-900' 
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
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
            onClick={() => navigate('/saved-projects')}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
              isDarkMode 
                ? 'bg-gray-800/50 hover:bg-gray-700/50 text-white' 
                : 'bg-white/50 hover:bg-white/70 text-gray-700'
            } backdrop-blur-lg`}
          >
            📚 Saved Projects
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
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 opacity-90 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 backdrop-blur-sm rounded-3xl"></div>
            <div className="relative text-white p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
                  <span className="text-3xl">🚀</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Learning Dashboard</h1>
                  <p className="text-emerald-100 text-xl">Master your projects with style</p>
                </div>
              </div>
              
              {/* Enhanced Stats with Animations */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Active', value: stats.totalActive, color: 'from-emerald-400 to-emerald-600', icon: '⚡' },
                    { label: 'Completed', value: stats.completed, color: 'from-green-400 to-green-600', icon: '✅' },
                    { label: 'In Progress', value: stats.inProgress, color: 'from-teal-400 to-teal-600', icon: '🔥' },
                    { label: 'Success Rate', value: `${stats.completionRate}%`, color: 'from-cyan-400 to-cyan-600', icon: '🎯' }
                  ].map((stat, index) => (
                    <div key={stat.label} className={`transform transition-all duration-700 delay-${index * 150} hover:scale-110`}>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}>
                            <span className="text-lg">{stat.icon}</span>
                          </div>
                          <div>
                            <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                              {stat.value}
                            </div>
                            <div className="text-white/80 text-sm font-medium">{stat.label}</div>
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
                <div className="w-16 h-16 border-4 border-emerald-200 rounded-full animate-spin"></div>
                <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Loading your learning journey...
              </p>
            </div>
          ) : (
            <>
              {/* Enhanced Filter Buttons */}
              <div className="flex gap-3 mb-8">
                {[
                  { key: 'all', label: 'All Projects', icon: '📁', count: activeProjects.length },
                  { key: 'active', label: 'Active', icon: '⚡', count: activeProjects.filter(p => p.status === 'active').length },
                  { key: 'completed', label: 'Completed', icon: '✅', count: activeProjects.filter(p => p.status === 'completed').length },
                  { key: 'paused', label: 'Paused', icon: '⏸️', count: activeProjects.filter(p => p.status === 'paused').length }
                ].map(({ key, label, icon, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`group relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      filter === key
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                        : `${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'} hover:shadow-md`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{icon}</span>
                      <span>{label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        filter === key ? 'bg-white/20' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {count}
                      </span>
                    </div>
                    {filter === key && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 opacity-20 animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Projects Grid - Enhanced Design */}
              {getFilteredActiveProjects().length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center">
                    <span className="text-4xl">🎯</span>
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    No Active Projects Yet
                  </h3>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Start working on some projects to see them here!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {getFilteredActiveProjects().map((project, index) => (
                    <div 
                      key={project.id} 
                      className={`group relative p-6 rounded-2xl border transition-all duration-500 hover:scale-[1.01] hover:shadow-xl transform ${
                        isDarkMode ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800' : 'bg-white/80 border-gray-200/50 hover:bg-white'
                      } backdrop-blur-sm`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(project.status)}`}>
                          <span>{getStatusIcon(project.status)}</span>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </div>

                      {/* Project Header - Make clickable */}
                      <div className="space-y-4">
                        <div 
                          className="pr-20 cursor-pointer"
                          onClick={() => handleProjectClick(project)}
                        >
                          <h3 className={`text-xl font-bold mb-2 group-hover:text-emerald-600 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {project.title}
                          </h3>
                          <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {project.description}
                          </p>
                        </div>

                        {/* Progress Section */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Progress: {getProgressPercentage(project)}%
                            </span>
                            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {project.progress?.completedSteps?.length || 0} / {project.steps?.length || 0} steps
                            </span>
                          </div>
                          <div className={`w-full bg-gray-200 rounded-full h-3 ${isDarkMode ? 'bg-gray-700' : ''} overflow-hidden`}>
                            <div 
                              className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                              style={{width: `${getProgressPercentage(project)}%`}}
                            ></div>
                          </div>
                        </div>

                        {/* Steps Checklist - Collapsible */}
                        <div className="space-y-3">
                          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Implementation Steps:</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {project.steps?.slice(0, 5).map((step, stepIndex) => (
                              <label key={stepIndex} className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-black/5 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={project.progress?.completedSteps?.includes(stepIndex) || false}
                                  onChange={(e) => handleStepToggle(project.id, stepIndex, e.target.checked)}
                                  className="mt-1 text-emerald-600 rounded focus:ring-emerald-500 w-4 h-4"
                                />
                                <span className={`text-sm flex-1 ${
                                  project.progress?.completedSteps?.includes(stepIndex) 
                                    ? `line-through ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}` 
                                    : `${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`
                                }`}>
                                  {step}
                                </span>
                              </label>
                            ))}
                            {project.steps?.length > 5 && (
                              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} pl-7`}>
                                +{project.steps.length - 5} more steps...
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Notes Section */}
                        <div className="border-t pt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📝 Notes:</h4>
                            <button
                              onClick={() => {
                                setEditingNotes(project.id);
                                setNotes(project.userNotes || '');
                              }}
                              className={`text-sm px-3 py-1 rounded-lg font-medium transition-all hover:scale-105 ${isDarkMode ? 'text-emerald-400 hover:bg-emerald-900/20' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            >
                              {editingNotes === project.id ? 'Cancel' : 'Edit'}
                            </button>
                          </div>
                          
                          {editingNotes === project.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className={`w-full p-4 border rounded-xl resize-none transition-all focus:ring-2 focus:ring-emerald-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                }`}
                                rows={3}
                                placeholder="Add your learning notes, insights, or progress updates..."
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleNotesUpdate(project.id)}
                                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                  💾 Save Notes
                                </button>
                                <button
                                  onClick={() => setEditingNotes(null)}
                                  className={`px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 ${
                                    isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className={`p-4 rounded-xl min-h-[60px] ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {project.userNotes || 'No notes yet. Click edit to add your learning insights!'}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => handleDeleteActiveProject(project.id)}
                            className={`px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                          >
                            🗑️ Delete Project
                          </button>
                        </div>
                      </div>

                      {/* Hover Effect Gradient */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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

export default MyProjectsPage; 