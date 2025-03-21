import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { fetchMarketData } from '../services/api';
import { PortfolioContext } from '../contexts/PortfolioContext';
import AssetDistribution from '../components/dashboard/AssetDistribution';
import PortfolioChart from '../components/dashboard/PortfolioChart';
import AssetTable from '../components/dashboard/AssetTable';
import '../utils/chartUtils'; // Importa le configurazioni di Chart.js

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
  
  @media (max-width: 576px) {
    padding: 1rem 0.75rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
  
  @media (max-width: 576px) {
    margin-bottom: 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1rem;
  }
`;

const PortfolioValue = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 576px) {
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    border-radius: 10px;
  }
`;

const TotalValue = styled.h2`
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
  }
`;

const ValueChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.isPositive ? 'var(--success-color)' : 'var(--error-color)'};
  font-weight: 500;
  
  @media (max-width: 576px) {
    font-size: 0.9rem;
  }
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 576px) {
    gap: 1.5rem;
  }
`;

const EmptyStateMessage = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 576px) {
    padding: 1.5rem;
  }
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  
  @media (max-width: 576px) {
    padding: 1.5rem;
  }
`;

const Dashboard = () => {
  const { portfolio } = useContext(PortfolioContext);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [valueChange, setValueChange] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchMarketData();
        setMarketData(data);
        
        if (portfolio && portfolio.assets && portfolio.assets.length > 0) {
          calculatePortfolioValue(portfolio.assets, data);
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Aggiornamento dei dati ogni 60 secondi
    const intervalId = setInterval(() => {
      fetchData();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [portfolio]);
  
  const calculatePortfolioValue = (assets, marketData) => {
    let total = 0;
    let changePercentage = 0;
    let totalYesterday = 0;
    
    assets.forEach(asset => {
      const coinData = marketData.find(coin => coin.id === asset.id);
      if (coinData) {
        // Calcola il valore attuale
        const currentValue = asset.amount * coinData.current_price;
        total += currentValue;
        
        // Calcola il valore di ieri (in base alla variazione percentuale nelle ultime 24h)
        const yesterdayValue = currentValue / (1 + (coinData.price_change_percentage_24h / 100));
        totalYesterday += yesterdayValue;
      }
    });
    
    if (totalYesterday > 0) {
      changePercentage = ((total - totalYesterday) / totalYesterday) * 100;
    }
    
    setTotalValue(total);
    setValueChange(changePercentage);
  };
  
  return (
    <DashboardContainer>
      <Header>
        <Title>Il Tuo Portafoglio</Title>
        <Subtitle>
          {portfolio?.name || 'Dashboard'}
        </Subtitle>
      </Header>
      
      {loading ? (
        <LoadingIndicator>
          <p>Caricamento dati...</p>
        </LoadingIndicator>
      ) : portfolio && portfolio.assets && portfolio.assets.length > 0 ? (
        <>
          <PortfolioValue>
            <TotalValue>${totalValue.toFixed(2)}</TotalValue>
            <ValueChange isPositive={valueChange >= 0}>
              {valueChange >= 0 ? '↑' : '↓'} {Math.abs(valueChange).toFixed(2)}% nelle ultime 24h
            </ValueChange>
          </PortfolioValue>
          
          <PortfolioChart assets={portfolio.assets} marketData={marketData} />
          
          <GridLayout>
            <AssetDistribution marketData={marketData} />
            {/* Altri componenti potrebbero essere aggiunti qui */}
          </GridLayout>
          
          <AssetTable assets={portfolio.assets} marketData={marketData} />
        </>
      ) : (
        <EmptyStateMessage>
          <p>Non hai ancora asset nel tuo portafoglio.</p>
          {/* Pulsante per aggiungere asset */}
        </EmptyStateMessage>
      )}
    </DashboardContainer>
  );
};

export default Dashboard; 