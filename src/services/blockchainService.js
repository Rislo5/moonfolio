import { ethers } from 'ethers';
import axios from 'axios';

// Inizializzazione del provider con la tua chiave Infura
const INFURA_KEY = '675fca7a17824893ba42bf07c8b89664';
const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_KEY}`);

// Funzione per risolvere indirizzi ENS
export const resolveENSAddress = async (ensName) => {
  try {
    const address = await provider.resolveName(ensName);
    return address;
  } catch (error) {
    console.error('Errore nella risoluzione dell\'indirizzo ENS:', error);
    throw error;
  }
};

// Funzione per ottenere un indirizzo in formato standard
export const normalizeAddress = async (addressOrEns) => {
  if (addressOrEns.endsWith('.eth')) {
    return resolveENSAddress(addressOrEns);
  }
  return addressOrEns;
};

// Funzione per ottenere il saldo ETH
export const getEthBalance = async (address) => {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Errore nel recupero del saldo ETH:', error);
    throw error;
  }
};

// Funzione per ottenere i token ERC20 usando l'API Ethplorer
export const getTokenBalances = async (address) => {
  try {
    const response = await axios.get(
      `https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`
    );
    return response.data.tokens || [];
  } catch (error) {
    console.error('Errore nel recupero dei token:', error);
    return [];
  }
};

// Funzione per ottenere le transazioni recenti
export const getTransactions = async (address) => {
  try {
    // Usiamo Etherscan per ottenere le transazioni
    const etherscanApiKey = 'YOURCUSTOMETHERSCANKEY'; // Idealmente questo dovrebbe essere una variabile d'ambiente
    const response = await axios.get(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${etherscanApiKey}`
    );
    return response.data.result || [];
  } catch (error) {
    console.error('Errore nel recupero delle transazioni:', error);
    return [];
  }
};

// Funzione combinata per ottenere tutti i dati del portafoglio
export const getWalletData = async (addressOrEns) => {
  try {
    // Normalizza l'indirizzo (risolvi ENS se necessario)
    const address = await normalizeAddress(addressOrEns);
    
    if (!address) {
      throw new Error('Indirizzo non valido o ENS non risolvibile');
    }
    
    // Ottieni il saldo ETH
    const ethBalance = await getEthBalance(address);
    
    // Ottieni i token ERC20
    const tokens = await getTokenBalances(address);
    
    // Formatta i dati dei token
    const formattedTokens = tokens.map(token => ({
      id: token.tokenInfo.address.toLowerCase(),
      name: token.tokenInfo.name || 'Token sconosciuto',
      symbol: token.tokenInfo.symbol || '???',
      amount: token.balance / Math.pow(10, token.tokenInfo.decimals),
      price: token.tokenInfo.price?.rate || 0,
      value: (token.balance / Math.pow(10, token.tokenInfo.decimals)) * (token.tokenInfo.price?.rate || 0),
      avgPrice: token.tokenInfo.price?.rate || 0
    }));
    
    // Aggiungi ETH ai token
    const ethData = {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      amount: parseFloat(ethBalance),
      price: 0,
      value: 0,
      avgPrice: 0
    };
    
    // Restituisci i dati completi
    return {
      address,
      assets: [ethData, ...formattedTokens],
      totalValue: 0,
      name: 'Wallet On-Chain'
    };
  } catch (error) {
    console.error('Errore nel recupero dei dati del wallet:', error);
    throw error;
  }
}; 