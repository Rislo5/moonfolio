import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// Constants
const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;
const ENS_REGEX = /^[a-zA-Z0-9-]+\.eth$/;

// Styled Components
const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Title = styled.h1`
  font-size: clamp(1.5rem, 4vw, 2rem);
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 2px solid ${props => props.hasError ? 'var(--error-color)' : 'var(--border-color)'};
  border-radius: 8px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--accent-color-alpha);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  padding: 0.8rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: var(--accent-hover);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background-color: var(--disabled-color);
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ErrorMessage = styled.p`
  color: var(--error-color);
  font-size: 0.9rem;
  margin-top: 0.5rem;
  animation: slideIn 0.2s ease-in;
  role: alert;

  @keyframes slideIn {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const EnterWallet = () => {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateAddress = useCallback((address) => {
    const trimmedAddress = address.trim();
    return WALLET_REGEX.test(trimmedAddress) || ENS_REGEX.test(trimmedAddress);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const trimmedAddress = address.trim();
    
    if (!trimmedAddress) {
      setError('Inserisci un indirizzo wallet');
      return;
    }
    
    if (!validateAddress(trimmedAddress)) {
      setError('Indirizzo wallet non valido');
      return;
    }
    
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('walletAddress', trimmedAddress);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error processing wallet:', error);
      setError('Errore nel recupero dei dati del wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    setAddress(e.target.value);
    setError(''); // Clear error when input changes
  }, []);

  return (
    <Container>
      <Title>Inserisci il tuo indirizzo wallet</Title>
      <Form onSubmit={handleSubmit} noValidate>
        <Input
          type="text"
          placeholder="Indirizzo ENS o Ethereum (0x...)"
          value={address}
          onChange={handleInputChange}
          disabled={loading}
          hasError={!!error}
          aria-invalid={!!error}
          aria-label="Wallet address input"
        />
        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
        <Button 
          type="submit" 
          disabled={loading || !address.trim()}
          aria-busy={loading}
        >
          {loading ? 'Caricamento...' : 'Visualizza Portafoglio'}
        </Button>
      </Form>
    </Container>
  );
};

EnterWallet.propTypes = {
  onSubmit: PropTypes.func,
};

export default EnterWallet;