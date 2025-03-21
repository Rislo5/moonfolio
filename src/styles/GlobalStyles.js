import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* Light theme variables */
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --text-primary: #1a1a1a;
    --text-secondary: #666666;
    --accent-color: #6c5ce7;
    --border-color: #e0e0e0;
    --error-color: #ff4444;
    --success-color: #00c853;
    --accent-hover: #5649c0;
    --disabled-color: #cccccc;
    --bg-hover: #f0f0f0;
  }

  [data-theme='dark'] {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #b3b3b3;
    --accent-color: #a29bfe;
    --border-color: #404040;
    --error-color: #ff6b6b;
    --success-color: #00e676;
    --accent-hover: #b1a5ff;
    --disabled-color: #555555;
    --bg-hover: #333333;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }
`;

export default GlobalStyles; 