import React from 'react';
import styled from 'styled-components';

const ToggleContainer = styled.button`
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  font-size: 0.5rem;
  justify-content: space-between;
  margin: 0 auto;
  overflow: hidden;
  padding: 0.5rem;
  position: relative;
  width: 4rem;
  height: 2rem;
`;

const Icons = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const Icon = styled.span`
  font-size: 1rem;
`;

const ToggleButton = styled.span`
  background: var(--accent-color);
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: ${props => (props.isDark ? '2px' : 'calc(100% - 1.8rem)')};
  height: 1.8rem;
  width: 1.8rem;
  transform: translateX(0);
  transition: transform 0.2s, background-color 0.4s;
`;

const ThemeToggle = ({ isDark, toggleTheme }) => {
  return (
    <ToggleContainer onClick={toggleTheme}>
      <Icons>
        <Icon>🌙</Icon>
        <Icon>☀️</Icon>
      </Icons>
      <ToggleButton isDark={isDark} />
    </ToggleContainer>
  );
};

export default ThemeToggle; 