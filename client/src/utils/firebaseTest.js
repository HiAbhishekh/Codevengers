import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

// Test function to check Firestore permissions
export const testFirestorePermissions = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    console.log('❌ No user logged in');
    return { success: false, error: 'No user logged in' };
  }

  console.log('🧪 Testing Firestore permissions for user:', user.uid);

  try {
    // Test 1: Create user document
    console.log('📝 Test 1: Creating user document...');
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { 
      email: user.email,
      displayName: user.displayName,
      lastActive: new Date().toISOString()
    }, { merge: true });
    console.log('✅ User document created/updated successfully');

    // Test 2: Read user document
    console.log('📖 Test 2: Reading user document...');
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      console.log('✅ User document read successfully:', userDoc.data());
    } else {
      console.log('⚠️ User document does not exist');
    }

    // Test 3: Create savedProjects collection
    console.log('💾 Test 3: Creating saved project...');
    const savedProjectsRef = collection(db, 'users', user.uid, 'savedProjects');
    const testProject = {
      title: 'Test Project',
      description: 'This is a test project to verify permissions',
      userId: user.uid,
      savedAt: new Date().toISOString(),
      tools: ['JavaScript'],
      timeEstimate: '1 hour',
      difficulty: 'Beginner',
      domain: 'Testing',
      steps: ['Step 1: Test'],
      searchQuery: {
        concept: 'Testing',
        skillLevel: 'Beginner',
        domain: 'Testing'
      }
    };

    const docRef = await addDoc(savedProjectsRef, testProject);
    console.log('✅ Test project saved with ID:', docRef.id);

    return { 
      success: true, 
      message: 'All Firestore tests passed!',
      testProjectId: docRef.id 
    };

  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
};

// Test function specifically for project saving
export const testProjectSaving = async (projectData, searchQuery) => {
  const user = auth.currentUser;
  
  if (!user) {
    return { success: false, error: 'No user logged in' };
  }

  console.log('🧪 Testing project saving with actual data...');
  console.log('Project:', projectData);
  console.log('Search query:', searchQuery);

  try {
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
      userId: user.uid,
      isFavorite: false
    };

    console.log('Processed project to save:', projectToSave);

    // Test if we can create the document
    const savedProjectsRef = collection(db, 'users', user.uid, 'savedProjects');
    const docRef = await addDoc(savedProjectsRef, projectToSave);
    
    console.log('✅ Project saved successfully with ID:', docRef.id);
    return { success: true, projectId: docRef.id };

  } catch (error) {
    console.error('❌ Project saving test failed:', error);
    return { success: false, error: error.message, code: error.code };
  }
}; 