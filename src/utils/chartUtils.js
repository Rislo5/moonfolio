import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import 'chart.js/auto';

// Registrazione dei componenti Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Configurazioni globali di Chart.js
ChartJS.defaults.font.family = "'Inter', sans-serif";
ChartJS.defaults.color = '#666666';
ChartJS.defaults.responsive = true;

export const getColorByIndex = (index) => {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F15BB5'
  ];
  return colors[index % colors.length];
}; 