import React, { useState } from 'react';
import styled from 'styled-components';

const TableContainer = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Per una migliore inerzia di scrolling su iOS */
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* Per una migliore prevedibilità del layout su diversi browser */
  min-width: 750px; /* Assicura che la tabella non si comprima troppo */
  
  @media (max-width: 768px) {
    font-size: 0.9rem; /* Testo leggermente più piccolo su mobile */
  }
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  cursor: ${props => props.sortable ? 'pointer' : 'default'};
  
  &:hover {
    color: ${props => props.sortable ? 'var(--accent-color)' : 'var(--text-secondary)'};
  }
  
  /* Larghezze appropriate per colonne diverse */
  &:nth-child(1) { width: 25%; } /* Colonna Asset */
  &:nth-child(2) { width: 12%; } /* Colonna Quantità */
  &:nth-child(3) { width: 12%; } /* Colonna Prezzo Medio */
  &:nth-child(4) { width: 12%; } /* Colonna Prezzo Attuale */
  &:nth-child(5) { width: 12%; } /* Colonna Valore */
  &:nth-child(6) { width: 15%; } /* Colonna Guadagno/Perdita */
  &:nth-child(7) { width: 12%; } /* Colonna Variazione 24h */
  
  @media (max-width: 992px) {
    padding: 0.75rem;
  }
`;

const Td = styled.td`
  padding: 1rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  
  /* Gestione del testo troppo lungo */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 992px) {
    padding: 0.75rem;
  }
`;

const AssetRow = styled.tr`
  &:hover {
    background-color: var(--bg-hover);
  }
  
  &:last-child td {
    border-bottom: none;
  }
  
  /* Effetto touch per dispositivi mobili */
  @media (hover: none) {
    &:active {
      background-color: var(--bg-hover);
    }
  }
`;

const AssetLogo = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 0.5rem;
  vertical-align: middle;
  border-radius: 50%;
  
  /* Caricamento immagine più fluido */
  object-fit: cover;
  
  @media (max-width: 576px) {
    width: 20px;
    height: 20px;
    margin-right: 0.3rem;
  }
`;

const AssetName = styled.span`
  display: inline-flex;
  align-items: center;
  max-width: 100%;
`;

const AssetSymbol = styled.span`
  color: var(--text-secondary);
  margin-left: 0.5rem;
  font-size: 0.9rem;
  
  @media (max-width: 576px) {
    font-size: 0.8rem;
  }
`;

const ChangePositive = styled.span`
  color: var(--success-color);
`;

const ChangeNegative = styled.span`
  color: var(--error-color);
`;

const SearchInput = styled.input`
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  width: 100%;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(108, 92, 231, 0.1);
  }
  
  /* Stile per dispositivi iOS */
  -webkit-appearance: none;
  
  @media (max-width: 576px) {
    padding: 0.7rem;
    font-size: 0.9rem;
  }
`;

// Componente per la vista mobile alternativa (schede anziché tabella)
const MobileCardView = styled.div`
  display: none;
  
  @media (max-width: 576px) {
    display: block;
  }
`;

const MobileCard = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
`;

const MobileCardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
`;

const MobileCardBody = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`;

const MobileCardField = styled.div`
  margin-bottom: 0.3rem;
`;

const MobileCardLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const MobileCardValue = styled.div`
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
`;

const ViewToggle = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
  
  @media (min-width: 577px) {
    display: none;
  }
`;

const ViewToggleButton = styled.button`
  background-color: ${props => props.active ? 'var(--accent-color)' : 'var(--bg-primary)'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.5rem 0.7rem;
  font-size: 0.8rem;
  cursor: pointer;
  margin-left: 0.5rem;
  
  &:focus {
    outline: none;
  }
`;

const TableView = styled.div`
  display: ${props => props.isMobileView ? 'none' : 'block'};
  
  @media (max-width: 576px) {
    display: ${props => props.isMobileView ? 'none' : 'block'};
  }
`;

const AssetTable = ({ assets, marketData }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'value', direction: 'descending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileView, setShowMobileView] = useState(false);
  
  if (!assets || assets.length === 0 || !marketData) {
    return (
      <TableContainer>
        <Title>I tuoi Asset</Title>
        <p>Nessun asset disponibile nel portafoglio.</p>
      </TableContainer>
    );
  }
  
  // Combina i dati degli asset con i dati di mercato
  const combinedData = assets.map(asset => {
    const coinData = marketData.find(coin => coin.id === asset.id);
    if (!coinData) return null;
    
    const currentValue = asset.amount * coinData.current_price;
    const costBasis = asset.amount * asset.avgPrice;
    const profitLoss = currentValue - costBasis;
    const profitLossPercentage = (profitLoss / costBasis) * 100;
    
    return {
      id: asset.id,
      name: coinData.name,
      symbol: coinData.symbol.toUpperCase(),
      image: coinData.image,
      amount: asset.amount,
      avgPrice: asset.avgPrice,
      currentPrice: coinData.current_price,
      value: currentValue,
      costBasis,
      profitLoss,
      profitLossPercentage,
      priceChange24h: coinData.price_change_percentage_24h
    };
  }).filter(Boolean);
  
  // Filtra in base alla ricerca
  const filteredData = combinedData.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Ordina i dati
  const sortedData = [...filteredData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
  
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  return (
    <TableContainer>
      <Title>I tuoi Asset</Title>
      
      <SearchInput
        type="text"
        placeholder="Cerca per nome o simbolo..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <ViewToggle>
        <ViewToggleButton 
          active={!showMobileView} 
          onClick={() => setShowMobileView(false)}
        >
          Tabella
        </ViewToggleButton>
        <ViewToggleButton 
          active={showMobileView} 
          onClick={() => setShowMobileView(true)}
        >
          Schede
        </ViewToggleButton>
      </ViewToggle>
      
      <TableView isMobileView={showMobileView}>
        <Table>
          <thead>
            <tr>
              <Th sortable onClick={() => requestSort('name')}>Asset</Th>
              <Th sortable onClick={() => requestSort('amount')}>Quantità</Th>
              <Th sortable onClick={() => requestSort('avgPrice')}>Prezzo Medio</Th>
              <Th sortable onClick={() => requestSort('currentPrice')}>Prezzo Attuale</Th>
              <Th sortable onClick={() => requestSort('value')}>Valore</Th>
              <Th sortable onClick={() => requestSort('profitLossPercentage')}>Guadagno/Perdita</Th>
              <Th sortable onClick={() => requestSort('priceChange24h')}>Variazione 24h</Th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map(asset => (
              <AssetRow key={asset.id}>
                <Td>
                  <AssetName>
                    <AssetLogo src={asset.image} alt={asset.name} />
                    {asset.name}
                    <AssetSymbol>{asset.symbol}</AssetSymbol>
                  </AssetName>
                </Td>
                <Td>{asset.amount.toFixed(6)}</Td>
                <Td>${asset.avgPrice.toFixed(2)}</Td>
                <Td>${asset.currentPrice.toFixed(2)}</Td>
                <Td>${asset.value.toFixed(2)}</Td>
                <Td>
                  {asset.profitLoss >= 0 ? (
                    <ChangePositive>
                      +${asset.profitLoss.toFixed(2)} ({asset.profitLossPercentage.toFixed(2)}%)
                    </ChangePositive>
                  ) : (
                    <ChangeNegative>
                      -${Math.abs(asset.profitLoss).toFixed(2)} ({asset.profitLossPercentage.toFixed(2)}%)
                    </ChangeNegative>
                  )}
                </Td>
                <Td>
                  {asset.priceChange24h >= 0 ? (
                    <ChangePositive>+{asset.priceChange24h.toFixed(2)}%</ChangePositive>
                  ) : (
                    <ChangeNegative>{asset.priceChange24h.toFixed(2)}%</ChangeNegative>
                  )}
                </Td>
              </AssetRow>
            ))}
          </tbody>
        </Table>
      </TableView>
      
      {/* Vista a schede per dispositivi mobili */}
      {showMobileView && (
        <MobileCardView>
          {sortedData.map(asset => (
            <MobileCard key={asset.id}>
              <MobileCardHeader>
                <AssetLogo src={asset.image} alt={asset.name} />
                <AssetName>
                  {asset.name}
                  <AssetSymbol>{asset.symbol}</AssetSymbol>
                </AssetName>
              </MobileCardHeader>
              <MobileCardBody>
                <MobileCardField>
                  <MobileCardLabel>Quantità</MobileCardLabel>
                  <MobileCardValue>{asset.amount.toFixed(6)}</MobileCardValue>
                </MobileCardField>
                <MobileCardField>
                  <MobileCardLabel>Valore</MobileCardLabel>
                  <MobileCardValue>${asset.value.toFixed(2)}</MobileCardValue>
                </MobileCardField>
                <MobileCardField>
                  <MobileCardLabel>Prezzo Medio</MobileCardLabel>
                  <MobileCardValue>${asset.avgPrice.toFixed(2)}</MobileCardValue>
                </MobileCardField>
                <MobileCardField>
                  <MobileCardLabel>Prezzo Attuale</MobileCardLabel>
                  <MobileCardValue>${asset.currentPrice.toFixed(2)}</MobileCardValue>
                </MobileCardField>
                <MobileCardField>
                  <MobileCardLabel>Guadagno/Perdita</MobileCardLabel>
                  <MobileCardValue>
                    {asset.profitLoss >= 0 ? (
                      <ChangePositive>
                        +${asset.profitLoss.toFixed(2)} ({asset.profitLossPercentage.toFixed(2)}%)
                      </ChangePositive>
                    ) : (
                      <ChangeNegative>
                        -${Math.abs(asset.profitLoss).toFixed(2)} ({asset.profitLossPercentage.toFixed(2)}%)
                      </ChangeNegative>
                    )}
                  </MobileCardValue>
                </MobileCardField>
                <MobileCardField>
                  <MobileCardLabel>Variazione 24h</MobileCardLabel>
                  <MobileCardValue>
                    {asset.priceChange24h >= 0 ? (
                      <ChangePositive>+{asset.priceChange24h.toFixed(2)}%</ChangePositive>
                    ) : (
                      <ChangeNegative>{asset.priceChange24h.toFixed(2)}%</ChangeNegative>
                    )}
                  </MobileCardValue>
                </MobileCardField>
              </MobileCardBody>
            </MobileCard>
          ))}
        </MobileCardView>
      )}
    </TableContainer>
  );
};

export default AssetTable; 