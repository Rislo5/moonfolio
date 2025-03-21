import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { Pie } from 'react-chartjs-2';
import { PortfolioContext } from '../../contexts/PortfolioContext';


const ChartContainer = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 576px) {
    padding: 1.25rem;
    border-radius: 10px;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.2rem;
    margin-bottom: 0.75rem;
  }
`;

const ChartWrapper = styled.div`
  position: relative;
  height: 100%;
  min-height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 768px) {
    min-height: 220px;
  }
  
  @media (max-width: 576px) {
    min-height: 200px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  height: 100%;
  
  @media (max-width: 576px) {
    padding: 1.5rem;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--text-secondary);
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 576px) {
    gap: 0.75rem;
    margin-top: 0.75rem;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  
  @media (max-width: 576px) {
    font-size: 0.8rem;
  }
`;

const ColorIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 6px;
  
  @media (max-width: 576px) {
    width: 10px;
    height: 10px;
  }
`;

const AssetDistribution = ({ marketData }) => {
  const { portfolio } = useContext(PortfolioContext);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!portfolio || !portfolio.assets || portfolio.assets.length === 0 || !marketData) {
      setLoading(false);
      return;
    }
    
    try {
      // Calcola il valore di ciascun asset
      const assetsWithValues = portfolio.assets.map(asset => {
        const coinData = marketData.find(coin => coin.id === asset.id);
        if (!coinData) return null;
        
        return {
          ...asset,
          value: asset.amount * coinData.current_price,
          name: coinData.name,
          symbol: coinData.symbol.toUpperCase(),
          image: coinData.image
        };
      }).filter(Boolean);
      
      // Ordina per valore
      const sortedAssets = [...assetsWithValues].sort((a, b) => b.value - a.value);
      
      // Prendi i primi 5 asset, raggruppa il resto come "Altri"
      let topAssets, otherAssets;
      
      if (sortedAssets.length <= 6) {
        topAssets = sortedAssets;
        otherAssets = null;
      } else {
        topAssets = sortedAssets.slice(0, 5);
        
        // Raggruppa il resto come "Altri"
        const otherValue = sortedAssets
          .slice(5)
          .reduce((sum, asset) => sum + asset.value, 0);
          
        otherAssets = {
          name: 'Altri',
          value: otherValue
        };
      }
      
      // Crea i dati per il grafico a torta
      const finalAssets = otherAssets 
        ? [...topAssets, otherAssets]
        : topAssets;
      
      // Colori predefiniti per il grafico
      const colors = [
        '#6c5ce7', '#fd79a8', '#00b894', '#fdcb6e', '#0984e3', '#636e72'
      ];
      
      setChartData({
        labels: finalAssets.map(asset => asset.name),
        datasets: [{
          data: finalAssets.map(asset => asset.value),
          backgroundColor: colors.slice(0, finalAssets.length),
          borderWidth: 0,
          hoverOffset: 4
        }],
        assets: finalAssets,
        colors: colors.slice(0, finalAssets.length)
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error creating asset distribution chart:', error);
      setLoading(false);
    }
  }, [portfolio, marketData]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    },
    cutout: '50%'
  };
  
  return (
    <ChartContainer>
      <Title>Distribuzione Asset</Title>
      
      {loading ? (
        <LoadingIndicator>Caricamento dati...</LoadingIndicator>
      ) : chartData ? (
        <>
          <ChartWrapper>
            <Pie data={chartData} options={chartOptions} />
          </ChartWrapper>
          
          <Legend>
            {chartData.assets.map((asset, index) => (
              <LegendItem key={asset.name}>
                <ColorIndicator color={chartData.colors[index]} />
                {asset.name}
              </LegendItem>
            ))}
          </Legend>
        </>
      ) : (
        <EmptyState>
          <p>Nessun dato disponibile per la distribuzione degli asset.</p>
        </EmptyState>
      )}
    </ChartContainer>
  );
};

export default AssetDistribution; 