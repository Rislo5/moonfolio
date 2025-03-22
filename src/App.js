import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { PortfolioProvider } from './contexts/PortfolioContext';
import GlobalStyles from './styles/GlobalStyles';
import Header from './components/common/Header';
import Home from './pages/Home';
import EnterWallet from './pages/EnterWallet';
import Dashboard from './pages/Dashboard';
import CreateWallet from './pages/CreateWallet';

function App() {
  return (
    <ThemeProvider>
      <PortfolioProvider>
        <GlobalStyles />
        <Router>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/enter-wallet" element={<EnterWallet />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-wallet" element={<CreateWallet />} />
            </Routes>
          </div>
        </Router>
      </PortfolioProvider>
    </ThemeProvider>
  );
}

export default App;
