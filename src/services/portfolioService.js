// Funzioni per gestire il portafoglio locale
export const savePortfolio = (portfolio) => {
  localStorage.setItem('portfolio', JSON.stringify(portfolio));
};

export const getPortfolio = () => {
  const portfolio = localStorage.getItem('portfolio');
  return portfolio ? JSON.parse(portfolio) : null;
};

export const createPortfolio = (name) => {
  const newPortfolio = {
    id: Date.now().toString(),
    name,
    assets: [],
    transactions: [],
    createdAt: new Date().toISOString(),
  };
  savePortfolio(newPortfolio);
  return newPortfolio;
};

export const addTransaction = (transaction) => {
  const portfolio = getPortfolio();
  if (!portfolio) return null;
  
  portfolio.transactions.push({
    ...transaction,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  });
  
  // Aggiorna gli asset in base alla transazione
  updateAssetFromTransaction(portfolio, transaction);
  
  savePortfolio(portfolio);
  return portfolio;
};

const updateAssetFromTransaction = (portfolio, transaction) => {
  const { assetId, type, amount, price } = transaction;
  
  let assetIndex = portfolio.assets.findIndex(asset => asset.id === assetId);
  
  if (assetIndex === -1) {
    // Asset non trovato, creane uno nuovo
    portfolio.assets.push({
      id: assetId,
      amount: type === 'buy' ? amount : -amount,
      avgPrice: price,
    });
  } else {
    // Aggiorna l'asset esistente
    const asset = portfolio.assets[assetIndex];
    if (type === 'buy') {
      const totalValue = asset.amount * asset.avgPrice + amount * price;
      asset.amount += amount;
      asset.avgPrice = totalValue / asset.amount;
    } else if (type === 'sell') {
      asset.amount -= amount;
      // Se la quantità diventa 0 o negativa, rimuovi l'asset
      if (asset.amount <= 0) {
        portfolio.assets.splice(assetIndex, 1);
      }
    }
  }
}; 