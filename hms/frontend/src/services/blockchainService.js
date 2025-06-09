import { ethers } from 'ethers';
import { BLOCKCHAIN_CONFIG, NETWORKS } from '../libs/config';

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
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function grantDoctorRole(address doctor) external",
  "function DOCTOR_ROLE() external view returns (bytes32)",
  "function ADMIN_ROLE() external view returns (bytes32)",
  "event PatientRegistered(string indexed patientId, bytes32 identityHash, address indexed registeredBy, uint256 timestamp)",
  "event RecordAdded(string indexed patientId, bytes32 indexed recordHash, address indexed authorizedBy, string recordType, uint256 timestamp)"
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
    this.contractAddress = BLOCKCHAIN_CONFIG.contractAddress;
    this.targetNetwork = BLOCKCHAIN_CONFIG.targetNetwork;
    this.isEnabled = BLOCKCHAIN_CONFIG.enableBlockchain;
    
    // Initialize if blockchain is enabled
    if (this.isEnabled) {
      this.initializeEventListeners();
    }
  }

  // Initialize event listeners for MetaMask
  initializeEventListeners() {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.account = accounts[0];
          this.reconnect();
        }
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Network changed:', chainId);
        window.location.reload(); // Reload page on network change
      });

      // Listen for connection
      window.ethereum.on('connect', (connectInfo) => {
        console.log('MetaMask connected:', connectInfo);
      });

      // Listen for disconnection
      window.ethereum.on('disconnect', (error) => {
        console.log('MetaMask disconnected:', error);
        this.disconnect();
      });
    }
  }

  // Check if blockchain features are enabled
  isBlockchainEnabled() {
    return this.isEnabled;
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  // Connect to MetaMask
  async connectWallet() {
    try {
      if (!this.isBlockchainEnabled()) {
        throw new Error('Blockchain features are disabled');
      }

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

      console.log('Wallet connected:', this.account);

      // Check and switch network if needed
      await this.ensureCorrectNetwork();

      // Initialize contract if address is available
      if (this.contractAddress) {
        this.contract = new ethers.Contract(
          this.contractAddress,
          HMS_CONTRACT_ABI,
          this.signer
        );
        console.log('Contract initialized:', this.contractAddress);
      } else {
        console.warn('Contract address not configured');
      }

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

  // Reconnect after account change
  async reconnect() {
    if (this.account && this.isBlockchainEnabled()) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        
        if (this.contractAddress) {
          this.contract = new ethers.Contract(
            this.contractAddress,
            HMS_CONTRACT_ABI,
            this.signer
          );
        }
        
        console.log('Reconnected with account:', this.account);
      } catch (error) {
        console.error('Error reconnecting:', error);
      }
    }
  }

  // Ensure we're on the correct network
  async ensureCorrectNetwork() {
    try {
      const network = await this.provider.getNetwork();
      const targetChainId = parseInt(NETWORKS[this.targetNetwork].chainId, 16);

      console.log('Current network:', Number(network.chainId), 'Target:', targetChainId);

      if (Number(network.chainId) !== targetChainId) {
        console.log('Switching to target network:', this.targetNetwork);
        
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
    console.log('Wallet disconnected');
  }

  // Check if wallet is connected
  isConnected() {
    return this.account !== null && this.signer !== null && this.isBlockchainEnabled();
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
      if (!this.isBlockchainEnabled()) {
        return { success: false, error: 'Blockchain features are disabled' };
      }

      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect your wallet first.');
      }

      const identityHash = this.generateHash({
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone
      });

      console.log('Registering patient on blockchain:', patientData.id);

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

      console.log('Patient registration transaction sent:', tx.hash);

      return {
        success: true,
        transactionHash: tx.hash,
        identityHash,
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
      if (!this.isBlockchainEnabled()) {
        return { success: false, error: 'Blockchain features are disabled' };
      }

      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect your wallet first.');
      }

      const recordHash = this.generateHash(recordData);

      console.log('Adding medical record to blockchain:', recordData.patientId);

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

      console.log('Medical record transaction sent:', tx.hash);

      return {
        success: true,
        transactionHash: tx.hash,
        recordHash,
        blockNumber: tx.blockNumber,
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
      if (!this.isBlockchainEnabled()) {
        return { success: false, error: 'Blockchain features are disabled' };
      }

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
      if (!this.isBlockchainEnabled()) {
        return { success: false, error: 'Blockchain features are disabled' };
      }

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
      if (!this.isBlockchainEnabled()) {
        return { success: false, error: 'Blockchain features are disabled' };
      }

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
      if (!this.isBlockchainEnabled()) {
        return { success: false, error: 'Blockchain features are disabled' };
      }

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
            chainId: Number(network.chainId),
            blockExplorerUrls: NETWORKS[this.targetNetwork]?.blockExplorerUrls
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
  getExplorerUrl(address) {
    const baseUrl = NETWORKS[this.targetNetwork]?.blockExplorerUrls?.[0];
    if (!baseUrl) return '#';
    return `${baseUrl}address/${address}`;
  }

  // Get transaction explorer URL
  getTransactionUrl(txHash) {
    const baseUrl = NETWORKS[this.targetNetwork]?.blockExplorerUrls?.[0];
    if (!baseUrl) return '#';
    return `${baseUrl}tx/${txHash}`;
  }
}

// Export singleton instance
export default new BlockchainService();