// API Configuration
export const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
  targetNetwork: process.env.REACT_APP_TARGET_NETWORK || 'mumbai',
  enableBlockchain: process.env.REACT_APP_ENABLE_BLOCKCHAIN === 'true'
};

// Network configurations
export const NETWORKS = {
  mumbai: {
    chainId: '0x13881', // 80001 in hex
    chainName: 'Polygon Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/']
  },
  sepolia: {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/']
  },
  localhost: {
    chainId: '0x7a69', // 31337 in hex
    chainName: 'Localhost 8545',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['http://127.0.0.1:8545/'],
    blockExplorerUrls: ['']
  }
};