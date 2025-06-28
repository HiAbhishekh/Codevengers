import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import DarkModeToggle from '../components/DarkModeToggle';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import LoginModal from '../components/LoginModal';
import UserProfile from '../components/UserProfile';
import { useAuth } from '../contexts/AuthContext';

const mockProjectIdeas = [
  {
    id: 1,
    title: "Recursive Tree Visualizer",
    description: "Build an interactive web application that visualizes how recursion works by drawing fractal trees. Users can adjust parameters like branch angle, depth, and length to see real-time changes.",
    tools: ["HTML5 Canvas", "JavaScript", "CSS3", "Git"],
    timeEstimate: "2-3 hours",
    difficulty: "Beginner",
    domain: "Coding",
    steps: [
      "Set up HTML canvas and basic styling",
      "Implement recursive function to draw branches",
      "Add user controls for parameters (sliders)",
      "Implement animation and smooth transitions",
      "Add export functionality for generated trees"
    ],
    starterCode: `// Recursive tree drawing function
function drawTree(ctx, x, y, length, angle, depth) {
  if (depth === 0) return;
  
  const x2 = x + length * Math.cos(angle);
  const y2 = y + length * Math.sin(angle);
  
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  
  drawTree(ctx, x2, y2, length * 0.7, angle - 0.3, depth - 1);
  drawTree(ctx, x2, y2, length * 0.7, angle + 0.3, depth - 1);
}`,
    motivationalTip: "🌳 Start simple! Even complex fractals begin with basic recursive thinking. Each branch teaches you more about how recursion works."
  },
  {
    id: 2,
    title: "Maze Generator & Solver",
    description: "Create a maze generation algorithm using recursive backtracking, then implement both depth-first and breadth-first search algorithms to solve the generated mazes.",
    tools: ["Python", "Pygame", "Matplotlib", "NumPy"],
    timeEstimate: "4-5 hours",
    difficulty: "Intermediate",
    domain: "Coding",
    steps: [
      "Create grid structure and cell representation",
      "Implement recursive backtracking for maze generation",
      "Add visualization using Pygame or Matplotlib",
      "Implement DFS solver with animation",
      "Add BFS solver and compare performance"
    ],
    starterCode: `class MazeGenerator:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.grid = [[Cell() for _ in range(width)] for _ in range(height)]
    
    def generate_maze(self, x=0, y=0):
        self.grid[y][x].visited = True
        neighbors = self.get_unvisited_neighbors(x, y)
        
        while neighbors:
            next_cell = random.choice(neighbors)
            self.remove_wall(x, y, next_cell[0], next_cell[1])
            self.generate_maze(next_cell[0], next_cell[1])
            neighbors = self.get_unvisited_neighbors(x, y)`,
    motivationalTip: "🔍 Recursion is like following breadcrumbs! Each step remembers where it came from, making backtracking natural."
  },
  {
    id: 3,
    title: "Factorial Calculator with Steps",
    description: "Build a web app that not only calculates factorials recursively but also shows the complete step-by-step breakdown, helping users understand the recursive process visually.",
    tools: ["React", "TypeScript", "Framer Motion", "Tailwind CSS"],
    timeEstimate: "1-2 hours",
    difficulty: "Beginner",
    domain: "Coding",
    steps: [
      "Set up React component with input validation",
      "Implement recursive factorial function with step tracking",
      "Create animated step-by-step visualization",
      "Add comparison with iterative approach",
      "Implement performance metrics display"
    ],
    starterCode: `function factorial(n, steps = []) {
  // Base case
  if (n <= 1) {
    steps.push(\`factorial(0) = 1 (base case)\`);
    return { result: 1, steps };
  }
  
  // Recursive case
  steps.push(\`factorial(\${n}) = \${n} × factorial(\${n-1})\`);
  const subResult = factorial(n - 1, steps);
  const result = n * subResult.result;
  
  steps.push(\`factorial(\${n}) = \${n} × \${subResult.result} = \${result}\`);
  return { result, steps };
}`,
    motivationalTip: "📚 Understanding factorial recursion is like reading a book backwards - you need to get to the end (base case) before you can work your way back!"
  }
];

const ProjectCard = ({ project, onClick, onSave, onShare, onViewDetails, isDarkMode }) => {
  const difficultyColors = {
    Beginner: isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
    Intermediate: isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
    Advanced: isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
  };

  return (
    <div
      className={`rounded-2xl shadow-xl transition-all duration-500 transform hover:scale-[1.02] cursor-pointer ${
        isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
      } backdrop-blur-lg overflow-hidden`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{project.title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[project.difficulty]}`}>{project.difficulty}</span>
        </div>
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{project.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{project.timeEstimate}</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{project.domain}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {project.tools.map((tool, index) => (
            <span
              key={index}
              className={`px-2 py-1 text-xs rounded-lg ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tool}
            </span>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave(project);
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-sm ${
              isDarkMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
            } flex items-center justify-center gap-2`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save Project
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(project);
            }}
            className={`py-2.5 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-sm ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 shadow-gray-700/25' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-gray-200/50'
            } flex items-center justify-center gap-2`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(project);
            }}
            className={`py-2.5 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-sm ${
              isDarkMode 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
            } flex items-center justify-center gap-2`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ResultsPage({ searchQuery, onBack, isDarkMode, setIsDarkMode }) {
  const { currentUser, saveProject } = useAuth();
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      if (searchQuery?.projects && searchQuery.projects.length > 0) {
        const mappedProjects = searchQuery.projects.map((project, index) => ({
          id: index + 1,
          title: project.title,
          description: project.description,
          tools: Array.isArray(project.tools) ? project.tools : [project.tools],
          timeEstimate: project.timeEstimate,
          difficulty: getDifficultyText(project.difficulty),
          domain: searchQuery.domain,
          steps: project.steps || [],
          starterCode: project.starterCode || "// No starter code provided",
          motivationalTip: project.motivationalTip || "Keep learning and building!"
        }));
        setProjects(mappedProjects);
      } else {
        setProjects(mockProjectIdeas);
      }
      setIsLoading(false);
    }, 500);
  }, [searchQuery]);

  const getDifficultyText = (difficulty) => {
    if (typeof difficulty === 'string') return difficulty;
    if (difficulty <= 2) return 'Beginner';
    if (difficulty <= 4) return 'Intermediate';
    return 'Advanced';
  };

  const handleCardClick = (project) => {
    navigate(`/project/${project.id}`, { state: { project } });
  };

  const handleShare = async (project) => {
    try {
      const shareData = {
        title: project.title,
        text: `Check out this amazing project: ${project.title} - ${project.description}`,
        url: window.location.origin + `/project/${project.id}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
        setToast({ message: 'Project shared successfully!', type: 'success' });
      } else {
        // Fallback to copying link to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
        setToast({ message: 'Project details copied to clipboard!', type: 'success' });
      }
    } catch (error) {
      console.error('Failed to share:', error);
      setToast({ message: 'Failed to share project', type: 'error' });
    }
  };

  const handleViewDetails = (project) => {
    navigate(`/project/${project.id}`, { state: { project } });
  };

  const handleSaveProject = async (project) => {
    if (!currentUser) {
      setShowLoginModal(true);
      setToast({ message: 'Please sign in to save projects', type: 'info' });
      return;
    }

    console.log('🔄 Starting to save project:', project.title);
    
    // Show loading toast
    const loadingToast = { message: `Saving "${project.title}"...`, type: 'info' };
    setToast(loadingToast);

    try {
      const searchData = {
        concept: searchQuery?.concept || 'Unknown',
        skillLevel: searchQuery?.level || searchQuery?.skillLevel || 'Beginner', 
        domain: searchQuery?.domain || project?.domain || 'General'
      };

      console.log('📝 Search data for saving:', searchData);
      console.log('👤 Current user:', currentUser?.uid);

      const projectId = await saveProject(project, searchData);
      
      console.log('✅ Project saved successfully with ID:', projectId);
      setToast({ message: `"${project.title}" saved successfully! ✨`, type: 'success' });
      
    } catch (error) {
      console.error('❌ Failed to save project:', error);
      
      // Show specific error message based on error type
      let errorMessage = 'Failed to save project';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your account settings.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setToast({ 
        message: `❌ ${errorMessage}`, 
        type: 'error' 
      });
    }
  };

  const handleGenerateMore = async () => {
    if (!searchQuery) {
      onBack();
      return;
    }

    setIsLoading(true);
    setToast({ message: 'Generating more amazing project ideas...', type: 'info' });

    try {
      // Generate more projects using the same search criteria
      const response = await fetch('http://localhost:5050/api/generate-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: searchQuery.concept,
          skillLevel: searchQuery.level || searchQuery.skillLevel,
          domain: searchQuery.domain
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate more projects');
      }

      if (data.success && data.projects) {
        const newProjects = data.projects.map((project, index) => ({
          id: projects.length + index + 1,
          title: project.title,
          description: project.description,
          tools: Array.isArray(project.tools) ? project.tools : [project.tools],
          timeEstimate: project.timeEstimate,
          difficulty: getDifficultyText(project.difficulty),
          domain: searchQuery.domain,
          steps: project.steps || [],
          starterCode: project.starterCode || "// No starter code provided",
          motivationalTip: project.motivationalTip || "Keep learning and building!"
        }));

        // Add new projects to existing ones
        setProjects([...projects, ...newProjects]);
        setToast({ message: `✨ Generated ${newProjects.length} more project ideas!`, type: 'success' });
      } else {
        throw new Error('No projects generated');
      }
    } catch (error) {
      console.error('Error generating more projects:', error);
      setToast({ message: 'Failed to generate more projects. Showing demo projects instead.', type: 'warning' });
      
      // Add some demo projects as fallback
      const demoProjects = mockProjectIdeas.map((project, index) => ({
        ...project,
        id: projects.length + index + 1
      }));
      setProjects([...projects, ...demoProjects]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    setToast({ message: `${!isDarkMode ? 'Dark' : 'Light'} mode activated!`, type: 'info' });
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900' 
          : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Generating amazing project ideas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Main Content - Add top padding to account for fixed header */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm mb-6 transition-colors ${
              isDarkMode 
                ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50' 
                : 'bg-white/50 text-gray-700 hover:bg-white/70'
            } backdrop-blur-lg`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Generator
          </button>
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Project Ideas</h1>
          {searchQuery && (
            <div className="mb-4">
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Based on your search: <span className="font-semibold text-purple-500">"{searchQuery.concept}"</span>
                {' • '} 
                <span className="font-semibold">{searchQuery.level}</span>
                {' • '} 
                <span className="font-semibold">{searchQuery.domain}</span>
              </p>
              {searchQuery.isDemoMode ? (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                }`}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Demo Mode - Add OpenAI API key for AI-generated projects
                </div>
              ) : searchQuery.generatedAt ? (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                }`}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  AI-Generated Projects ✨
                </div>
              ) : null}
            </div>
          )}
        </div>
        <div className="grid gap-6 max-w-4xl mx-auto">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleCardClick(project)}
              onSave={handleSaveProject}
              onShare={handleShare}
              onViewDetails={handleViewDetails}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
        <div className="text-center mt-12">
          <button
            onClick={handleGenerateMore}
            className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg flex items-center justify-center gap-3 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate More Ideas
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 