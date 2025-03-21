import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { normalizeAddress } from '../services/blockchainService';
import { PortfolioContext } from '../contexts/PortfolioContext';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
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
  
  &:hover {
    background-color: var(--accent-hover);
  }
  
  &:disabled {
    background-color: var(--disabled-color);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: var(--error-color);
  font-size: 0.9rem;
`;

const InfoMessage = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(108, 92, 231, 0.1);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const EnterWallet = () => {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshOnChainData } = useContext(PortfolioContext);

  const validateAddress = (address) => {
    // Verifica se l'indirizzo è un ENS o un indirizzo Ethereum valido
    return address.endsWith('.eth') || /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!address.trim()) {
      setError('Inserisci un indirizzo wallet');
      return;
    }
    
    if (!validateAddress(address)) {
      setError('Indirizzo wallet non valido');
      return;
    }
    
    setLoading(true);
    
    try {
      // Verifica se l'indirizzo è valido (se è un ENS, lo risolve)
      const normalizedAddress = await normalizeAddress(address);
      
      if (!normalizedAddress) {
        setError('Impossibile risolvere l\'indirizzo ENS');
        setLoading(false);
        return;
      }
      
      // Salva l'indirizzo e naviga alla dashboard
      localStorage.setItem('walletAddress', address); // Salva l'indirizzo originale, non quello risolto
      
      // Aggiorna il contesto
      await refreshOnChainData();
      
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setError('Errore nel recupero dei dati del wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Inserisci il tuo indirizzo wallet</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Indirizzo ENS o Ethereum (0x...)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Caricamento...' : 'Visualizza Portafoglio'}
        </Button>
      </Form>
      
      <InfoMessage>
        <p>Puoi inserire un indirizzo ENS (come "vitalik.eth") o un indirizzo Ethereum completo (0x...).</p>
        <p>La tua privacy è garantita: i dati vengono recuperati direttamente dalla blockchain e non vengono mai salvati sui nostri server.</p>
      </InfoMessage>
    </Container>
  );
};

export default EnterWallet; 