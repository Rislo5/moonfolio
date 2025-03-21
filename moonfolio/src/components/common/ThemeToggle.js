import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

/**
 * Styled button container for the theme toggle switch
 * Uses CSS variables for dynamic theming
 */
const ToggleContainer = styled.button`
  /* Base styling */
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 30px;
  cursor: pointer;
  
  /* Layout */
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  padding: 0.5rem;
  position: relative;
  
  /* Dimensions */
  width: 4rem;
  height: 2rem;
  font-size: 0.5rem;
  overflow: hidden;

  /* Accessibility focus styles */
  &:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }
`;

/**
 * Container for the sun and moon icons
 */
const Icons = styled.div`
  /* Layout */
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

/**
 * Individual icon styling
 */
const Icon = styled.span`
  font-size: 1rem;
`;

/**
 * Animated toggle button that slides between light/dark positions
 */
const ToggleButton = styled.span`
  /* Base styling */
  background: var(--accent-color);
  border-radius: 50%;
  
  /* Positioning */
  position: absolute;
  top: 2px;
  left: ${props => (props.isDark ? '2px' : 'calc(100% - 1.8rem)')};
  
  /* Dimensions */
  height: 1.8rem;
  width: 1.8rem;
  
  /* Animation */
  transition: left 0.2s ease, background-color 0.4s ease;
`;

/**
 * ThemeToggle Component
 * 
 * A toggle switch component that alternates between light and dark themes
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isDark - Current theme state (true for dark, false for light)
 * @param {Function} props.toggleTheme - Function to toggle between themes
 */
const ThemeToggle = React.memo(({ isDark, toggleTheme }) => {
  /**
   * Handles keyboard events for accessibility
   * @param {KeyboardEvent} event - The keyboard event
   */
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTheme();
    }
  };

  return (
    <ToggleContainer 
      onClick={toggleTheme}
      onKeyDown={handleKeyPress}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      role="switch"
      aria-checked={isDark}
      tabIndex={0}
    >
      <Icons>
        <Icon aria-hidden="true">🌙</Icon>
        <Icon aria-hidden="true">☀️</Icon>
      </Icons>
      <ToggleButton isDark={isDark} />
    </ToggleContainer>
  );
});

// PropTypes for type checking
ThemeToggle.propTypes = {
  isDark: PropTypes.bool.isRequired,
  toggleTheme: PropTypes.func.isRequired
};

// Display name for debugging purposes
ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;