import React, { memo } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ErrorBoundary } from 'react-error-boundary';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Styled header container component
 * Contains the main layout structure for the header
 */
const HeaderContainer = styled.header`
  /* Layout */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  
  /* Styling */
  background-color: var(--bg-primary);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  /* Responsive design */
  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
`;

/**
 * Styled logo component
 * Represents the main site logo/title
 */
const Logo = styled(Link)`
  /* Typography */
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  
  /* Interactions */
  &:hover {
    color: var(--accent-color);
  }

  /* Accessibility */
  &:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }
`;

/**
 * Styled navigation container
 * Houses the main navigation links
 */
const Nav = styled.nav`
  /* Layout */
  display: flex;
  gap: 1.5rem;
  align-items: center;

  /* Responsive design */
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

/**
 * Styled navigation link component
 * Individual navigation items
 */
const NavLink = styled(Link)`
  /* Typography */
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  
  /* Interactions */
  &:hover {
    color: var(--accent-color);
  }

  /* Accessibility */
  &:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }
`;

/**
 * Error Fallback component for the ErrorBoundary
 * Displays error information when component fails
 * 
 * @param {Object} props - Component props
 * @param {Error} props.error - Error object containing error details
 * @returns {React.Component} Error message display
 */
const ErrorFallback = ({ error }) => (
  <div role="alert">
    <p>Something went wrong:</p>
    <pre>{error.message}</pre>
  </div>
);

ErrorFallback.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string.isRequired
  }).isRequired
};

/**
 * Header component
 * Main navigation header for the application
 * Includes logo, navigation links, and theme toggle
 * 
 * @component
 * @returns {React.Component} Header component with navigation and theme controls
 */
const Header = memo(() => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HeaderContainer role="banner">
        <Logo to="/" aria-label="Home" tabIndex={0}>
          Moonfolio
        </Logo>
        
        <Nav role="navigation" aria-label="Main navigation">
          <NavLink to="/dashboard" tabIndex={0}>
            Dashboard
          </NavLink>
          <NavLink to="/create-wallet" tabIndex={0}>
            Create Wallet
          </NavLink>
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </Nav>
      </HeaderContainer>
    </ErrorBoundary>
  );
});

// Component display name for debugging
Header.displayName = 'Header';

// PropType validation for theme-related props
Header.propTypes = {
  isDark: PropTypes.bool,
  toggleTheme: PropTypes.func
};

export default Header;