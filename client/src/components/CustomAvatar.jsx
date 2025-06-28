import React from 'react';

const CustomAvatar = ({ user, size = 40, className = "" }) => {
  const getInitials = (name, email) => {
    console.log('CustomAvatar - name:', name, 'email:', email); // Debug log
    if (name && name.trim()) {
      const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
      console.log('Generated initials from name:', initials); // Debug log
      return initials;
    }
    if (email) {
      const initial = email.charAt(0).toUpperCase();
      console.log('Generated initial from email:', initial); // Debug log
      return initial;
    }
    console.log('Using default initial: U'); // Debug log
    return 'U';
  };

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink-Red
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink-Yellow
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Mint-Pink
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Soft Pink
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'  // Default Purple
  ];

  const getUserGradient = (email) => {
    if (!email) return gradients[0];
    const hash = email.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return gradients[Math.abs(hash) % gradients.length];
  };

  console.log('CustomAvatar - user object:', user); // Debug log
  const initials = getInitials(user?.displayName, user?.email);
  const gradient = getUserGradient(user?.email);
  console.log('Final initials:', initials); // Debug log

  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={initials}
        className={`rounded-full shadow-lg ${className}`}
        style={{ 
          width: size, 
          height: size,
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
        onError={(e) => {
          console.log('Image failed to load, showing initials instead');
          e.target.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold shadow-lg ${className}`}
      style={{
        width: size,
        height: size,
        background: gradient,
        fontSize: size * 0.4,
        lineHeight: 1,
        border: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      }}
    >
      {initials}
    </div>
  );
};

export default CustomAvatar; 