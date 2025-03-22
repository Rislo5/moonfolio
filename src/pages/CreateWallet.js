import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
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
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--text-primary);
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

const CreateWallet = () => {
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { createNewPortfolio } = useContext(PortfolioContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!walletName.trim()) {
      setError('Inserisci un nome per il portafoglio');
      return;
    }

    try {
      createNewPortfolio(walletName);
      navigate('/dashboard');
    } catch (error) {
      setError('Errore nella creazione del portafoglio');
    }
  };

  return (
    <Container>
      <Title>Crea un Nuovo Portafoglio</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="walletName">Nome del Portafoglio</Label>
          <Input
            id="walletName"
            type="text"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
            placeholder="Es. Il Mio Portafoglio Crypto"
          />
        </FormGroup>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit">Crea Portafoglio</Button>
      </Form>
    </Container>
  );
};

export default CreateWallet; 