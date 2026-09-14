import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Buffer } from 'buffer';
import App from './App.tsx';
import { NetworkProvider } from './providers/NetworkProvider.tsx';
import SolanaWalletProvider from './providers/SolanaWalletProvider.tsx';
import './index.css';

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

window.Buffer = Buffer;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NetworkProvider>
      <SolanaWalletProvider>
        <App />
      </SolanaWalletProvider>
    </NetworkProvider>
  </StrictMode>
);
