import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, collection, addDoc, query, orderBy, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { user: result.user, error: null };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { user: null, error: error.message };
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (error) {
      console.error('Email sign-in error:', error);
      return { user: null, error: error.message };
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (error) {
      console.error('Email sign-up error:', error);
      return { user: null, error: error.message };
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      console.error('Sign-out error:', error);
      return { error: error.message };
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Save a project to user's collection (just bookmark it)
  const saveProject = async (projectData, searchQuery) => {
    if (!currentUser) {
      throw new Error('Must be logged in to save projects');
    }

    try {
      console.log('Attempting to save project for user:', currentUser.uid);
      console.log('Project data:', projectData);
      console.log('Search query:', searchQuery);

      // Ensure we have all required fields
      const projectToSave = {
        title: projectData.title || 'Untitled Project',
        description: projectData.description || 'No description provided',
        tools: projectData.tools || [],
        timeEstimate: projectData.timeEstimate || 'Unknown',
        difficulty: projectData.difficulty || 'Beginner',
        domain: projectData.domain || searchQuery?.domain || 'General',
        steps: projectData.steps || [],
        starterCode: projectData.starterCode || '',
        motivationalTip: projectData.motivationalTip || '',
        searchQuery: {
          concept: searchQuery?.concept || 'Unknown',
          skillLevel: searchQuery?.skillLevel || searchQuery?.level || 'Beginner',
          domain: searchQuery?.domain || 'General'
        },
        savedAt: new Date().toISOString(),
        userId: currentUser.uid,
        isFavorite: false
      };

      console.log('Processed project to save:', projectToSave);

      // Create the collection path
      const userDocRef = doc(db, 'users', currentUser.uid);
      const savedProjectsCollectionRef = collection(userDocRef, 'savedProjects');
      
      const docRef = await addDoc(savedProjectsCollectionRef, projectToSave);
      console.log('✅ Project saved successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error saving project:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  };

  // Start a project (move from saved to active with progress tracking)
  const startProject = async (projectData, searchQuery) => {
    if (!currentUser) {
      throw new Error('Must be logged in to start projects');
    }

    try {
      const projectToStart = {
        ...projectData,
        searchQuery: {
          concept: searchQuery.concept,
          skillLevel: searchQuery.skillLevel,
          domain: searchQuery.domain
        },
        progress: {
          completedSteps: [],
          currentStep: 0,
          startedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        },
        startedAt: new Date().toISOString(),
        userNotes: "",
        userId: currentUser.uid,
        status: 'active' // active, completed, paused
      };

      const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'activeProjects'), projectToStart);
      console.log('Project started with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error starting project:', error);
      throw error;
    }
  };

  // Get all saved projects (bookmarks only)
  const getSavedProjects = async () => {
    if (!currentUser) return [];

    try {
      const projectsRef = collection(db, 'users', currentUser.uid, 'savedProjects');
      const q = query(projectsRef, orderBy('savedAt', 'desc'));
      
      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ Loaded saved projects:', projects.length);
      return projects;
    } catch (error) {
      console.error('❌ Error loading saved projects:', error);
      return [];
    }
  };

  // Get all active/started projects with progress
  const getActiveProjects = async () => {
    if (!currentUser) return [];

    try {
      const projectsRef = collection(db, 'users', currentUser.uid, 'activeProjects');
      const q = query(projectsRef, orderBy('startedAt', 'desc'));
      
      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ Loaded active projects:', projects.length);
      return projects;
    } catch (error) {
      console.error('❌ Error loading active projects:', error);
      return [];
    }
  };

  // Update project progress (only for active projects)
  const updateProjectProgress = async (projectId, completedSteps, currentStep, userNotes = null) => {
    if (!currentUser) {
      throw new Error('Must be logged in to update progress');
    }

    try {
      const projectRef = doc(db, 'users', currentUser.uid, 'activeProjects', projectId);
      const updateData = {
        'progress.completedSteps': completedSteps,
        'progress.currentStep': currentStep,
        'progress.lastUpdated': new Date().toISOString()
      };

      if (userNotes !== null) {
        updateData.userNotes = userNotes;
      }

      // Check if project is completed
      const project = await getDoc(projectRef);
      if (project.exists() && project.data().steps) {
        const totalSteps = project.data().steps.length;
        if (completedSteps.length === totalSteps) {
          updateData.status = 'completed';
          updateData.completedAt = new Date().toISOString();
        } else {
          updateData.status = 'active';
        }
      }

      await updateDoc(projectRef, updateData);
      console.log('Project progress updated');
    } catch (error) {
      console.error('Error updating project progress:', error);
      throw error;
    }
  };

  // Toggle project favorite (for saved projects)
  const toggleProjectFavorite = async (projectId, isFavorite) => {
    if (!currentUser) {
      throw new Error('Must be logged in to favorite projects');
    }

    try {
      const projectRef = doc(db, 'users', currentUser.uid, 'savedProjects', projectId);
      await updateDoc(projectRef, { isFavorite });
      console.log('Project favorite status updated');
    } catch (error) {
      console.error('Error updating favorite status:', error);
      throw error;
    }
  };

  // Delete a saved project
  const deleteProject = async (projectId) => {
    if (!currentUser) {
      throw new Error('Must be logged in to delete projects');
    }

    try {
      const projectRef = doc(db, 'users', currentUser.uid, 'savedProjects', projectId);
      await deleteDoc(projectRef);
      console.log('Saved project deleted');
    } catch (error) {
      console.error('Error deleting saved project:', error);
      throw error;
    }
  };

  // Delete an active project
  const deleteActiveProject = async (projectId) => {
    if (!currentUser) {
      throw new Error('Must be logged in to delete projects');
    }

    try {
      const projectRef = doc(db, 'users', currentUser.uid, 'activeProjects', projectId);
      await deleteDoc(projectRef);
      console.log('Active project deleted');
    } catch (error) {
      console.error('Error deleting active project:', error);
      throw error;
    }
  };

  // Get project statistics
  const getProjectStats = async () => {
    if (!currentUser) return null;

    try {
      const savedProjects = await getSavedProjects();
      const activeProjects = await getActiveProjects();
      
      const totalSaved = savedProjects.length;
      const totalActive = activeProjects.length;
      const completedProjects = activeProjects.filter(p => p.status === 'completed').length;
      const inProgressProjects = activeProjects.filter(p => p.status === 'active').length;
      const pausedProjects = activeProjects.filter(p => p.status === 'paused').length;

      return {
        totalSaved,
        totalActive,
        completed: completedProjects,
        inProgress: inProgressProjects,
        paused: pausedProjects,
        completionRate: totalActive > 0 ? (completedProjects / totalActive * 100).toFixed(1) : 0
      };
    } catch (error) {
      console.error('Error getting project stats:', error);
      return null;
    }
  };

  // Move saved project to active (start working on it)
  const moveToActive = async (savedProjectId) => {
    if (!currentUser) {
      throw new Error('Must be logged in to start projects');
    }

    try {
      // Get the saved project
      const savedProjectRef = doc(db, 'users', currentUser.uid, 'savedProjects', savedProjectId);
      const savedProjectSnap = await getDoc(savedProjectRef);
      
      if (!savedProjectSnap.exists()) {
        throw new Error('Saved project not found');
      }

      const savedProjectData = savedProjectSnap.data();
      
      // Create active project
      const activeProjectData = {
        ...savedProjectData,
        progress: {
          completedSteps: [],
          currentStep: 0,
          startedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        },
        startedAt: new Date().toISOString(),
        userNotes: "",
        status: 'active'
      };

      // Add to active projects
      const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'activeProjects'), activeProjectData);
      
      // Optionally remove from saved projects
      // await deleteDoc(savedProjectRef);
      
      console.log('Project moved to active with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error moving project to active:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    loading,
    saveProject,
    startProject,
    getSavedProjects,
    getActiveProjects,
    updateProjectProgress,
    toggleProjectFavorite,
    deleteProject,
    deleteActiveProject,
    getProjectStats,
    moveToActive
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 