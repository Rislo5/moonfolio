import axios from 'axios';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export const fetchCoinData = async (coinId) => {
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/coins/${coinId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching coin data:', error);
    throw error;
  }
};

export const fetchMarketData = async () => {
  try {
    const response = await axios.get(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};

export const fetchHistoricalData = async (coinId, days = 30) => {
  try {
    const response = await axios.get(
      `${COINGECKO_API_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
}; 