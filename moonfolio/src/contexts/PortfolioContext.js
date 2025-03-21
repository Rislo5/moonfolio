import React, { createContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getPortfolio, savePortfolio, createPortfolio } from '../services/portfolioService';

/**
 * Context for managing portfolio state across the application
 * @type {React.Context}
 */
export const PortfolioContext = createContext();

/**
 * Initial portfolio state
 * @type {Object}
 */
const INITIAL_STATE = {
  assets: [],
  transactions: [],
  name: '',
  createdAt: null,
  lastModified: null
};

/**
 * Provider component for portfolio management
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const PortfolioProvider = ({ children }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load saved portfolio data on component mount
   */
  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setLoading(true);
        const savedPortfolio = await getPortfolio();
        if (savedPortfolio) {
          setPortfolio(savedPortfolio);
        }
      } catch (err) {
        setError('Failed to load portfolio');
        console.error('Portfolio loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();

    // Cleanup function
    return () => {
      setPortfolio(null);
      setLoading(false);
      setError(null);
    };
  }, []);

  /**
   * Create a new portfolio
   * @param {string} name - Portfolio name
   * @returns {Object} Newly created portfolio
   */
  const createNewPortfolio = useCallback(async (name) => {
    try {
      if (!name || typeof name !== 'string') {
        throw new Error('Invalid portfolio name');
      }

      const newPortfolio = {
        ...INITIAL_STATE,
        name,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      const createdPortfolio = await createPortfolio(newPortfolio);
      setPortfolio(createdPortfolio);
      return createdPortfolio;
    } catch (err) {
      setError('Failed to create portfolio');
      console.error('Portfolio creation error:', err);
      throw err;
    }
  }, []);

  /**
   * Update existing portfolio
   * @param {Object} updatedPortfolio - Updated portfolio data
   */
  const updatePortfolio = useCallback(async (updatedPortfolio) => {
    try {
      if (!updatedPortfolio || typeof updatedPortfolio !== 'object') {
        throw new Error('Invalid portfolio data');
      }

      const portfolioToSave = {
        ...updatedPortfolio,
        lastModified: new Date().toISOString()
      };

      await savePortfolio(portfolioToSave);
      setPortfolio(portfolioToSave);
    } catch (err) {
      setError('Failed to update portfolio');
      console.error('Portfolio update error:', err);
      throw err;
    }
  }, []);

  /**
   * Add new asset to portfolio
   * @param {Object} asset - Asset to add
   */
  const addAsset = useCallback(async (asset) => {
    try {
      if (!portfolio) throw new Error('No active portfolio');
      if (!asset || typeof asset !== 'object') {
        throw new Error('Invalid asset data');
      }

      const updatedPortfolio = {
        ...portfolio,
        assets: [...portfolio.assets, {
          ...asset,
          id: `asset-${Date.now()}`,
          addedAt: new Date().toISOString()
        }]
      };

      await updatePortfolio(updatedPortfolio);
    } catch (err) {
      setError('Failed to add asset');
      console.error('Asset addition error:', err);
      throw err;
    }
  }, [portfolio, updatePortfolio]);

  /**
   * Add new transaction to portfolio
   * @param {Object} transaction - Transaction to add
   */
  const addTransaction = useCallback(async (transaction) => {
    try {
      if (!portfolio) throw new Error('No active portfolio');
      if (!transaction || typeof transaction !== 'object') {
        throw new Error('Invalid transaction data');
      }

      const updatedPortfolio = {
        ...portfolio,
        transactions: [...portfolio.transactions, {
          ...transaction,
          id: `tx-${Date.now()}`,
          timestamp: new Date().toISOString()
        }]
      };

      await updatePortfolio(updatedPortfolio);
    } catch (err) {
      setError('Failed to add transaction');
      console.error('Transaction addition error:', err);
      throw err;
    }
  }, [portfolio, updatePortfolio]);

  /**
   * Remove asset from portfolio
   * @param {string} assetId - ID of asset to remove
   */
  const removeAsset = useCallback(async (assetId) => {
    try {
      if (!portfolio) throw new Error('No active portfolio');
      if (!assetId) throw new Error('Asset ID is required');

      const updatedPortfolio = {
        ...portfolio,
        assets: portfolio.assets.filter(asset => asset.id !== assetId)
      };

      await updatePortfolio(updatedPortfolio);
    } catch (err) {
      setError('Failed to remove asset');
      console.error('Asset removal error:', err);
      throw err;
    }
  }, [portfolio, updatePortfolio]);

  const contextValue = {
    portfolio,
    loading,
    error,
    createNewPortfolio,
    updatePortfolio,
    addAsset,
    addTransaction,
    removeAsset
  };

  return (
    <PortfolioContext.Provider value={contextValue}>
      {children}
    </PortfolioContext.Provider>
  );
};

PortfolioProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default PortfolioProvider;