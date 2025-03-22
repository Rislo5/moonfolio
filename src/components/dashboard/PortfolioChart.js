import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import { fetchHistoricalData } from '../../services/api';

const ChartContainer = styled.div`
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

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.2rem;
  }
`;

const TimeRangeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 576px) {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    -webkit-overflow-scrolling: touch;
  }
`;

const TimeButton = styled.button`
  padding: 0.5rem 0.8rem;
  background-color: ${props => props.active ? 'var(--accent-color)' : 'var(--bg-primary)'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  border-radius: 8px;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.2s ease;
  border: 1px solid var(--border-color);
  
  &:hover {
    background-color: ${props => props.active ? 'var(--accent-hover)' : 'var(--bg-hover)'};
  }
  
  @media (max-width: 576px) {
    padding: 0.4rem 0.7rem;
    font-size: 0.9rem;
    flex-shrink: 0;
  }
`;

const ChartWrapper = styled.div`
  position: relative;
  height: 300px;
  
  @media (max-width: 768px) {
    height: 250px;
  }
  
  @media (max-width: 576px) {
    height: 200px;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(var(--bg-secondary-rgb), 0.7);
  border-radius: 8px;
  z-index: 10;
`;

const PortfolioChart = ({ assets, marketData }) => {
  const [timeRange, setTimeRange] = useState('1w');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!assets || assets.length === 0 || !marketData) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Converti il periodo selezionato in giorni
        let days;
        switch (timeRange) {
          case '24h': days = 1; break;
          case '1w': days = 7; break;
          case '1m': days = 30; break;
          case '3m': days = 90; break;
          case '1y': days = 365; break;
          default: days = 7;
        }
        
        // Ottieni i dati storici per ogni asset
        const historicalDataPromises = assets.map(asset => 
          fetchHistoricalData(asset.id, days)
        );
        
        const historicalResults = await Promise.all(historicalDataPromises);
        
        // Calcola il valore del portafoglio per ogni punto temporale
        const timestampMap = new Map();
        
        historicalResults.forEach((coinData, index) => {
          const asset = assets[index];
          if (!coinData || !coinData.prices) return;
          
          coinData.prices.forEach(([timestamp, price]) => {
            const value = price * asset.amount;
            if (timestampMap.has(timestamp)) {
              timestampMap.set(timestamp, timestampMap.get(timestamp) + value);
            } else {
              timestampMap.set(timestamp, value);
            }
          });
        });
        
        // Converti la mappa in array ordinato per timestamp
        const sortedData = Array.from(timestampMap.entries())
          .sort((a, b) => a[0] - b[0]);
        
        // Formatta i dati per Chart.js
        const labels = sortedData.map(([timestamp]) => {
          const date = new Date(timestamp);
          
          if (days <= 1) {
            // Formato orario per 24h
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else if (days <= 30) {
            // Formato giorno per 7d e 30d
            return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
          } else {
            // Formato mese per 90d e 365d
            return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
          }
        });
        
        const values = sortedData.map(([, value]) => value);
        
        setChartData({
          labels,
          datasets: [{
            label: 'Valore Portafoglio',
            data: values,
            fill: true,
            backgroundColor: 'rgba(108, 92, 231, 0.1)',
            borderColor: 'rgba(108, 92, 231, 1)',
            borderWidth: 2,
            pointRadius: days <= 7 ? 2 : 0,
            pointHoverRadius: 5,
            tension: 0.4
          }]
        });
      } catch (error) {
        console.error('Error fetching historical data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [assets, marketData, timeRange]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: (value) => {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear'
      }
    }
  };
  
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };
  
  return (
    <ChartContainer>
      <ChartHeader>
        <Title>Andamento del Portafoglio</Title>
        <TimeRangeSelector>
          <TimeButton 
            active={timeRange === '24h'} 
            onClick={() => handleTimeRangeChange('24h')}
          >
            24H
          </TimeButton>
          <TimeButton 
            active={timeRange === '1w'} 
            onClick={() => handleTimeRangeChange('1w')}
          >
            1S
          </TimeButton>
          <TimeButton 
            active={timeRange === '1m'} 
            onClick={() => handleTimeRangeChange('1m')}
          >
            1M
          </TimeButton>
          <TimeButton 
            active={timeRange === '3m'} 
            onClick={() => handleTimeRangeChange('3m')}
          >
            3M
          </TimeButton>
          <TimeButton 
            active={timeRange === '1y'} 
            onClick={() => handleTimeRangeChange('1y')}
          >
            1A
          </TimeButton>
        </TimeRangeSelector>
      </ChartHeader>
      
      <ChartWrapper>
        {chartData && <Line data={chartData} options={chartOptions} />}
        {loading && <LoadingOverlay>Caricamento dati...</LoadingOverlay>}
      </ChartWrapper>
    </ChartContainer>
  );
};

export default PortfolioChart; 