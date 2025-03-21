import React, { createContext, useState, useEffect } from 'react';
import { getPortfolio, savePortfolio, createPortfolio } from '../services/portfolioService';
import { getWalletData } from '../services/blockchainService';
import { fetchMarketData } from '../services/api';

export const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [onChainData, setOnChainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnChain, setIsOnChain] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    // Controlla se c'è un indirizzo wallet salvato
    const savedAddress = localStorage.getItem('walletAddress');
    
    if (savedAddress) {
      // Se c'è un indirizzo, imposta la modalità on-chain
      setIsOnChain(true);
      setWalletAddress(savedAddress);
      loadOnChainData(savedAddress);
    } else {
      // Altrimenti, carica il portafoglio locale se esiste
      const savedPortfolio = getPortfolio();
      if (savedPortfolio) {
        setPortfolio(savedPortfolio);
      }
      setLoading(false);
    }
  }, []);

  const loadOnChainData = async (address) => {
    setLoading(true);
    try {
      // Recupera i dati del wallet dalla blockchain
      const data = await getWalletData(address);
      
      // Recupera i prezzi attuali da CoinGecko
      const marketData = await fetchMarketData();
      
      // Aggiorna i prezzi e calcola i valori
      const updatedAssets = data.assets.map(asset => {
        const coinData = marketData.find(
          coin => coin.id === asset.id || coin.symbol.toLowerCase() === asset.symbol.toLowerCase()
        );
        
        if (coinData) {
          return {
            ...asset,
            price: coinData.current_price,
            value: asset.amount * coinData.current_price,
            priceChange24h: coinData.price_change_percentage_24h
          };
        }
        
        return asset;
      });
      
      // Calcola il valore totale
      const totalValue = updatedAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);
      
      setOnChainData({
        ...data,
        assets: updatedAssets,
        totalValue
      });
    } catch (error) {
      console.error('Errore nel caricamento dei dati on-chain:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewPortfolio = (name) => {
    const newPortfolio = createPortfolio(name);
    setPortfolio(newPortfolio);
    return newPortfolio;
  };

  const updatePortfolio = (updatedPortfolio) => {
    setPortfolio(updatedPortfolio);
    savePortfolio(updatedPortfolio);
  };

  const addAsset = (asset) => {
    if (isOnChain) return; // Non permettere modifiche manuali ai portafogli on-chain
    
    if (!portfolio) return;
    
    const updatedPortfolio = {
      ...portfolio,
      assets: [...portfolio.assets, asset]
    };
    
    updatePortfolio(updatedPortfolio);
  };

  const addTransaction = (transaction) => {
    if (isOnChain) return; // Non permettere modifiche manuali ai portafogli on-chain
    
    if (!portfolio) return;
    
    const updatedPortfolio = {
      ...portfolio,
      transactions: [...portfolio.transactions, {
        ...transaction,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      }]
    };
    
    updatePortfolio(updatedPortfolio);
  };

  const disconnectWallet = () => {
    localStorage.removeItem('walletAddress');
    setIsOnChain(false);
    setWalletAddress(null);
    setOnChainData(null);
    
    // Carica il portafoglio locale se esiste
    const savedPortfolio = getPortfolio();
    if (savedPortfolio) {
      setPortfolio(savedPortfolio);
    }
  };

  const refreshOnChainData = async () => {
    if (walletAddress) {
      await loadOnChainData(walletAddress);
      return true;
    }
    return false;
  };

  return (
    <PortfolioContext.Provider value={{
      portfolio: isOnChain ? onChainData : portfolio,
      loading,
      isOnChain,
      walletAddress,
      createNewPortfolio,
      updatePortfolio,
      addAsset,
      addTransaction,
      disconnectWallet,
      refreshOnChainData
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}; 