import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import EnterWallet from '../EnterWallet';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('EnterWallet Component', () => {
  beforeEach(() => {
    // Clear mocks and localStorage before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <EnterWallet />
      </MemoryRouter>
    );

  describe('Rendering', () => {
    it('renders all components correctly', () => {
      renderComponent();
      expect(screen.getByRole('heading')).toHaveTextContent('Inserisci il tuo indirizzo wallet');
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Visualizza Portafoglio');
    });
  });

  describe('Input Validation', () => {
    it('validates correct Ethereum address', async () => {
      renderComponent();
      const input = screen.getByRole('textbox');
      await userEvent.type(input, '0x1234567890123456789012345678901234567890');
      
      const submitButton = screen.getByRole('button');
      await userEvent.click(submitButton);
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('validates correct ENS address', async () => {
      renderComponent();
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test.eth');
      
      const submitButton = screen.getByRole('button');
      await userEvent.click(submitButton);
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error for invalid address', async () => {
      renderComponent();
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'invalid-address');
      
      const submitButton = screen.getByRole('button');
      await userEvent.click(submitButton);
      
      expect(screen.getByRole('alert')).toHaveTextContent('Indirizzo wallet non valido');
    });
  });

  describe('Form Submission', () => {
    it('handles successful submission', async () => {
      renderComponent();
      const input = screen.getByRole('textbox');
      const validAddress = '0x1234567890123456789012345678901234567890';
      
      await userEvent.type(input, validAddress);
      await userEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(localStorage.getItem('walletAddress')).toBe(validAddress);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows loading state during submission', async () => {
      renderComponent();
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      await userEvent.type(input, '0x1234567890123456789012345678901234567890');
      fireEvent.click(button);
      
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Caricamento...');
    });
  });
});