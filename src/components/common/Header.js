import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--bg-primary);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  
  &:hover {
    color: var(--accent-color);
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    color: var(--accent-color);
  }
`;

const Header = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <HeaderContainer>
      <Logo to="/">Moonfolio</Logo>
      <Nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/create-wallet">Create Wallet</NavLink>
        <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
      </Nav>
    </HeaderContainer>
  );
};

export default Header; 