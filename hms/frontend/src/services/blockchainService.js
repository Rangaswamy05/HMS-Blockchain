import { ethers } from 'ethers';

// Contract ABI - same as backend
const HMS_CONTRACT_ABI = [
  "function registerPatient(string memory patientId, bytes32 identityHash) external",
  "function addRecord(string memory patientId, bytes32 recordHash, string memory recordType) external",
  "function getPatientRecords(string memory patientId) external view returns (bytes32[] memory)",
  "function verifyRecord(bytes32 recordHash) external view returns (bool)",
  "function getRecord(bytes32 recordHash) external view returns (tuple(string patientId, bytes32 recordHash, uint256 timestamp, address authorizedBy, string recordType, bool isActive))",
  "function authorizeDoctor(string memory patientId, address doctor) external",
  "function isAuthorizedDoctor(string memory patientId, address doctor) external view returns (bool)",
  "function getTotalPatients() external view returns (uint256)",
  "function getTotalRecords() external view returns (uint256)",
  "event PatientRegistered(string indexed patientId, bytes32 identityHash, address indexed registeredBy, uint256 timestamp)",
  "event RecordAdded(string indexed patientId, bytes32 indexed recordHash, address indexed authorizedBy, string recordType, uint256 timestamp)"
];

// Network configurations
const NETWORKS = {
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
  }
};

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
    this.contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    this.targetNetwork = process.env.REACT_APP_TARGET_NETWORK || 'mumbai';
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  // Connect to MetaMask
  async connectWallet() {
    try {
      if (!this.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your MetaMask wallet.');
      }

      // Initialize provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.account = accounts[0];

      // Check and switch network if needed
      await this.ensureCorrectNetwork();

      // Initialize contract if address is available
      if (this.contractAddress) {
        this.contract = new ethers.Contract(
          this.contractAddress,
          HMS_CONTRACT_ABI,
          this.signer
        );
      }

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.account = accounts[0];
          this.connectWallet(); // Reconnect with new account
        }
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload(); // Reload page on network change
      });

      return {
        success: true,
        account: this.account,
        network: await this.provider.getNetwork()
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Ensure we're on the correct network
  async ensureCorrectNetwork() {
    try {
      const network = await this.provider.getNetwork();
      const targetChainId = parseInt(NETWORKS[this.targetNetwork].chainId, 16);

      if (Number(network.chainId) !== targetChainId) {
        // Try to switch network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORKS[this.targetNetwork].chainId }]
          });
        } catch (switchError) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [NETWORKS[this.targetNetwork]]
            });
          } else {
            throw switchError;
          }
        }
      }
    } catch (error) {
      console.error('Error switching network:', error);
      throw new Error(`Please switch to ${NETWORKS[this.targetNetwork].chainName} network`);
    }
  }

  // Disconnect wallet
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
  }

  // Check if wallet is connected
  isConnected() {
    return this.account !== null && this.signer !== null;
  }

  // Get current account
  getCurrentAccount() {
    return this.account;
  }

  // Generate hash for data (client-side)
  generateHash(data) {
    return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(data)));
  }

  // Register patient on blockchain
  async registerPatient(patientData) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect your wallet first.');
      }

      const identityHash = this.generateHash({
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone
      });

      // Estimate gas
      const gasEstimate = await this.contract.registerPatient.estimateGas(
        patientData.id,
        identityHash
      );

      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate * 120n / 100n;

      const tx = await this.contract.registerPatient(
        patientData.id,
        identityHash,
        { gasLimit }
      );

      return {
        success: true,
        transactionHash: tx.hash,
        transaction: tx
      };
    } catch (error) {
      console.error('Error registering patient on blockchain:', error);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  // Add medical record to blockchain
  async addMedicalRecord(recordData) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect your wallet first.');
      }

      const recordHash = this.generateHash(recordData);

      // Estimate gas
      const gasEstimate = await this.contract.addRecord.estimateGas(
        recordData.patientId,
        recordHash,
        recordData.type || 'medical_record'
      );

      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate * 120n / 100n;

      const tx = await this.contract.addRecord(
        recordData.patientId,
        recordHash,
        recordData.type || 'medical_record',
        { gasLimit }
      );

      return {
        success: true,
        transactionHash: tx.hash,
        recordHash,
        transaction: tx
      };
    } catch (error) {
      console.error('Error adding record to blockchain:', error);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  // Get patient records from blockchain
  async getPatientRecords(patientId) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect your wallet first.');
      }

      const recordHashes = await this.contract.getPatientRecords(patientId);
      return {
        success: true,
        recordHashes: recordHashes.map(hash => hash.toString())
      };
    } catch (error) {
      console.error('Error getting patient records:', error);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  // Verify record exists on blockchain
  async verifyRecord(recordHash) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect your wallet first.');
      }

      const exists = await this.contract.verifyRecord(recordHash);
      return {
        success: true,
        exists
      };
    } catch (error) {
      console.error('Error verifying record:', error);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  // Get record details from blockchain
  async getRecordDetails(recordHash) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect your wallet first.');
      }

      const record = await this.contract.getRecord(recordHash);
      return {
        success: true,
        record: {
          patientId: record.patientId,
          recordHash: record.recordHash,
          timestamp: Number(record.timestamp),
          authorizedBy: record.authorizedBy,
          recordType: record.recordType,
          isActive: record.isActive
        }
      };
    } catch (error) {
      console.error('Error getting record details:', error);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  // Get blockchain statistics
  async getBlockchainStats() {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect your wallet first.');
      }

      const [totalPatients, totalRecords, network] = await Promise.all([
        this.contract.getTotalPatients(),
        this.contract.getTotalRecords(),
        this.provider.getNetwork()
      ]);

      return {
        success: true,
        stats: {
          totalPatients: Number(totalPatients),
          totalRecords: Number(totalRecords),
          contractAddress: this.contractAddress,
          network: {
            name: network.name,
            chainId: Number(network.chainId)
          },
          account: this.account
        }
      };
    } catch (error) {
      console.error('Error getting blockchain stats:', error);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  // Wait for transaction confirmation
  async waitForTransaction(txHash, confirmations = 1) {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const receipt = await this.provider.waitForTransaction(txHash, confirmations);
      return {
        success: true,
        receipt
      };
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  // Get transaction receipt
  async getTransactionReceipt(txHash) {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const receipt = await this.provider.getTransactionReceipt(txHash);
      return {
        success: true,
        receipt
      };
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  // Parse error messages
  parseError(error) {
    if (error.code === 4001) {
      return 'Transaction rejected by user';
    }
    if (error.code === -32603) {
      return 'Internal JSON-RPC error';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (error.message.includes('gas')) {
      return 'Gas estimation failed or insufficient gas';
    }
    if (error.message.includes('revert')) {
      // Extract revert reason
      const match = error.message.match(/revert (.+)/);
      return match ? match[1] : 'Transaction reverted';
    }
    return error.message || 'Unknown error occurred';
  }

  // Format address for display
  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Get network explorer URL
  getExplorerUrl(txHash) {
    const baseUrl = NETWORKS[this.targetNetwork].blockExplorerUrls[0];
    return `${baseUrl}tx/${txHash}`;
  }
}

// Export singleton instance
export default new BlockchainService();