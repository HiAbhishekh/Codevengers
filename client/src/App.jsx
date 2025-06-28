import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import InputPage from "./pages/InputPage";
import ResultsPage from "./pages/ResultsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ProjectLearningPage from "./pages/ProjectLearningPage";
import SavedProjectsPage from "./pages/SavedProjectsPage";
import MyProjectsPage from "./pages/MyProjectsPage";

function AppRoutes({ isDarkMode, setIsDarkMode }) {
  const [searchQuery, setSearchQuery] = useState(null);
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <InputPage
            onGenerate={(formData) => {
              setSearchQuery(formData);
              navigate('/results');
            }}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        }
      />
      <Route
        path="/results"
        element={
          <ResultsPage
            searchQuery={searchQuery}
            onBack={() => navigate('/')}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        }
      />
      <Route
        path="/project/:id"
        element={<ProjectDetailPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
      />
      <Route
        path="/project-learning"
        element={<ProjectLearningPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
      />
      <Route
        path="/saved-projects"
        element={<SavedProjectsPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
      />
      <Route
        path="/my-projects"
        element={<MyProjectsPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
      />
    </Routes>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  return (
    <AuthProvider>
      <Router>
        <AppRoutes isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </Router>
    </AuthProvider>
  );
}

export default App;
