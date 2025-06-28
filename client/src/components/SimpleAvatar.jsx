import React from 'react';

const SimpleAvatar = ({ user, size = 40 }) => {
  // Debug: log the user object
  console.log('SimpleAvatar - Full user object:', JSON.stringify(user, null, 2));
  
  // Get initials
  const getInitials = () => {
    const name = user?.displayName || '';
    const email = user?.email || '';
    
    console.log('SimpleAvatar - displayName:', name);
    console.log('SimpleAvatar - email:', email);
    
    if (name && name.trim()) {
      const initials = name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
      console.log('SimpleAvatar - Generated initials from name:', initials);
      return initials;
    }
    
    if (email) {
      const initial = email.charAt(0).toUpperCase();
      console.log('SimpleAvatar - Generated initial from email:', initial);
      return initial;
    }
    
    console.log('SimpleAvatar - Using fallback: ?');
    return '?';
  };

  const initials = getInitials();
  
  // If user has photo, use it
  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={initials}
        style={{ 
          width: size, 
          height: size,
          borderRadius: '50%',
          objectFit: 'cover'
        }}
      />
    );
  }

  // Otherwise show initials with gradient
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: size * 0.4,
        border: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
    >
      {initials}
    </div>
  );
};

export default SimpleAvatar; 