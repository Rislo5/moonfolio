import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  max-width: 600px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled(Link)`
  padding: 0.8rem 1.5rem;
  background-color: ${props => props.primary ? 'var(--accent-color)' : 'transparent'};
  color: ${props => props.primary ? 'white' : 'var(--text-primary)'};
  border: 2px solid var(--accent-color);
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const Home = () => {
  return (
    <HomeContainer>
      <Title>Welcome to MoonFolio</Title>
      <Subtitle>
        Monitora il tuo portafoglio di criptovalute in tempo reale, analizza le performance
        e gestisci le tue transazioni con la nostra interfaccia intuitiva.
      </Subtitle>
      <ButtonContainer>
        <Button to="/enter-wallet" primary>Enter ENS Wallet</Button>
        <Button to="/create-wallet">Create Manual Wallet</Button>
      </ButtonContainer>
    </HomeContainer>
  );
};

export default Home; 