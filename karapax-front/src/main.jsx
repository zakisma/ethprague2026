import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Импорты для Web3 (RainbowKit + Wagmi)
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi'; // Добавили http
import {arbitrumSepolia, mainnet, sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// 1. Настраиваем сети и Wagmi
const config = getDefaultConfig({
  appName: 'ProofFund',
  // projectId можно получить бесплатно на cloud.walletconnect.com
  // Для хакатона временно используем этот тестовый (или вставь свой)
  projectId: 'YOUR_PROJECT_ID', 
  chains: [arbitrumSepolia, sepolia, mainnet], // Поставил sepolia первой, чтобы кошелек по умолчанию просил тестовую сеть
  ssr: false, // У нас Vite (не серверный рендеринг)
  transports: {
    // 🚀 ПЕРЕОПРЕДЕЛЯЕМ ГЛЮЧНЫЕ ПУБЛИЧНЫЕ УЗЛЫ НА НАДЕЖНЫЕ (Ankr)
    [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
    
    // Для обычной Sepolia (Надежная публичная нода):
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
    
    // Для Mainnet (Бесплатный LlamaRPC без лимитов):
    [mainnet.id]: http('https://eth.llamarpc.com'),
  },
});

// 2. Создаем клиент для запросов (нужен для Wagmi)
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* Оборачиваем приложение в RainbowKit с темной темой, чтобы подходило под наш дизайн */}
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#10b981', // Наш изумрудный цвет
          accentColorForeground: 'black',
          borderRadius: 'large',
          overlayBlur: 'small',
        })}>
          
          <App />
          
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)