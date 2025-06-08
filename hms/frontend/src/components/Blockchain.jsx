import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import { useState, useEffect } from 'react';

import { 
  Shield,  
  Eye, 
  X,
  CheckCircle,
  AlertCircle,
  Activity,
  Clock,
  Hash,
  Link,
  Zap,
  RefreshCw,
  Database,
  Lock
} from 'lucide-react';

export const Blockchain = () => {
  const [blocks, setBlocks] = useState([]);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);

  useEffect(() => {
    fetchBlockchain();
    verifyBlockchain();
  }, []);

  const fetchBlockchain = async () => {
    try {
      setLoading(true);
      const data = await api.get('/blockchain');
      setBlocks(data);
      setError(null);
    } catch (error) {
      setError('Failed to load blockchain');
      console.error('Error fetching blockchain:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyBlockchain = async () => {
    try {
      const data = await api.get('/blockchain/verify');
      setVerification(data);
    } catch (error) {
      console.error('Error verifying blockchain:', error);
    }
  };

  const handleBlockClick = (block) => {
    setSelectedBlock(block);
  };

  if (loading) return <LoadingSpinner message="Loading blockchain..." />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-3xl border border-white p-8 hover:border-gray-600/50 transition-all duration-500 hover:scale-10 hover:shadow-2xl hover:shadow-purple-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-black border-white"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-black to-purple-800 rounded-2xl flex items-center border-purple-500 justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-400 to-purple-950 bg-clip-text text-transparent">
                  Blockchain
                </h1>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-400 to-purple-950 bg-clip-text text-transparent">
                  Security Ledger
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {verification && (
                <div className={`px-6 py-3 rounded-2xl text-sm font-medium backdrop-blur-sm border transition-all duration-300 ${
                  verification.isValid 
                    ? 'bg-green-500/10 border-green-500/30 text-green-200' 
                    : 'bg-red-500/10 border-red-500/30 text-red-200'
                }`}>
                  {verification.isValid ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Blockchain Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Blockchain Invalid
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={() => {
                  fetchBlockchain();
                  verifyBlockchain();
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-black to-purple-800 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg border border-purple-500/30 hover:border-purple-400/50"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          <p className="text-gray-300 text-lg max-w-2xl mb-8">
            Immutable transaction history secured through cryptographic hashing and distributed consensus.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-200" />
                <span className="text-sm text-gray-300">Total Blocks</span>
              </div>
              <p className="text-2xl font-bold text-purple-200 mt-1">{verification?.blockCount || 0}</p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-green-200" />
                <span className="text-sm text-gray-300">Security</span>
              </div>
              <p className="text-2xl font-bold text-green-200 mt-1">100%</p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-200" />
                <span className="text-sm text-gray-300">Status</span>
              </div>
              <p className="text-2xl font-bold text-blue-200 mt-1">
                {verification?.isValid ? 'Valid' : 'Invalid'}
              </p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/10">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-200" />
                <span className="text-sm text-gray-300">Last Block</span>
              </div>
              <p className="text-2xl font-bold text-yellow-200 mt-1">
                {blocks.length > 0 ? `#${blocks[blocks.length - 1]?.index}` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Block Detail Modal */}
      {selectedBlock && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-gradient-to-br from-black to-gray-900 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-400 to-purple-600 bg-clip-text text-transparent">
                Block #{selectedBlock.index} Details
              </h2>
              <button
                onClick={() => setSelectedBlock(null)}
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <Hash className="h-4 w-4 mr-2" />
                    Block Index
                  </label>
                  <div className="bg-black/50 p-3 rounded-lg text-sm font-mono text-purple-200">
                    {selectedBlock.index}
                  </div>
                </div>
                
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Timestamp
                  </label>
                  <div className="bg-black/50 p-3 rounded-lg text-sm text-blue-200">
                    {new Date(selectedBlock.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Block Hash
                </label>
                <div className="bg-black/50 p-3 rounded-lg text-sm font-mono break-all text-green-200">
                  {selectedBlock.hash}
                </div>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Link className="h-4 w-4 mr-2" />
                  Previous Hash
                </label>
                <div className="bg-black/50 p-3 rounded-lg text-sm font-mono break-all text-yellow-200">
                  {selectedBlock.previousHash}
                </div>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Transaction Data
                </label>
                <div className="bg-black/50 p-4 rounded-lg text-sm">
                  {selectedBlock.data === "Genesis Block" ? (
                    <p className="text-gray-400">Genesis Block - No transaction data</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <strong className="text-gray-300 w-32">Type:</strong> 
                        <span className="text-purple-200">{selectedBlock.data.type}</span>
                      </div>
                      {selectedBlock.data.patientId && (
                        <div className="flex items-center">
                          <strong className="text-gray-300 w-32">Patient ID:</strong> 
                          <span className="text-blue-200">{selectedBlock.data.patientId}</span>
                        </div>
                      )}
                      {selectedBlock.data.doctorId && (
                        <div className="flex items-center">
                          <strong className="text-gray-300 w-32">Doctor ID:</strong> 
                          <span className="text-green-200">{selectedBlock.data.doctorId}</span>
                        </div>
                      )}
                      {selectedBlock.data.appointmentId && (
                        <div className="flex items-center">
                          <strong className="text-gray-300 w-32">Appointment ID:</strong> 
                          <span className="text-yellow-200">{selectedBlock.data.appointmentId}</span>
                        </div>
                      )}
                      {selectedBlock.data.recordId && (
                        <div className="flex items-center">
                          <strong className="text-gray-300 w-32">Record ID:</strong> 
                          <span className="text-pink-200">{selectedBlock.data.recordId}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <strong className="text-gray-300 w-32">Transaction Time:</strong> 
                        <span className="text-cyan-200">{new Date(selectedBlock.data.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={() => setSelectedBlock(null)}
                className="px-6 py-3 bg-gradient-to-r from-black to-gray-800 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-600/50 hover:border-gray-500/50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Visualization */}
      <div className="space-y-6">
        {blocks.map((block, index) => (
          <div 
            key={index} 
            className="group relative bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700 p-6 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer"
            onClick={() => handleBlockClick(block)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Block #{block.index}</h3>
                    <p className="text-sm text-gray-400 flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-2" />
                      {new Date(block.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button className="w-10 h-10 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl flex items-center justify-center text-purple-400 hover:text-purple-300 transition-all duration-300 group-hover:scale-110">
                  <Eye className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <h4 className="font-medium text-gray-300 mb-2 flex items-center">
                    <Hash className="h-4 w-4 mr-2 text-green-400" />
                    Hash
                  </h4>
                  <p className="text-xs font-mono bg-black/50 p-2 rounded-lg truncate text-green-200">
                    {block.hash}
                  </p>
                </div>
                
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <h4 className="font-medium text-gray-300 mb-2 flex items-center">
                    <Link className="h-4 w-4 mr-2 text-yellow-400" />
                    Previous Hash
                  </h4>
                  <p className="text-xs font-mono bg-black/50 p-2 rounded-lg truncate text-yellow-200">
                    {block.previousHash}
                  </p>
                </div>
                
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <h4 className="font-medium text-gray-300 mb-2 flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-blue-400" />
                    Transaction Type
                  </h4>
                  <div className="bg-black/50 p-2 rounded-lg">
                    {block.data === "Genesis Block" ? (
                      <span className="text-xs text-gray-400">Genesis Block</span>
                    ) : (
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        block.data.type === 'PATIENT_REGISTERED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        block.data.type === 'DOCTOR_REGISTERED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        block.data.type === 'APPOINTMENT_SCHEDULED' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        block.data.type === 'MEDICAL_RECORD_CREATED' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                      }`}>
                        {block.data.type?.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {index < blocks.length - 1 && (
              <div className="flex justify-center mt-6">
                <div className="w-px h-8 bg-gradient-to-b from-purple-500/50 to-transparent"></div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {blocks.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700/50">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Shield className="h-12 w-12 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Blockchain Data</h3>
          <p className="text-gray-400">Blockchain will be populated as transactions occur in the system.</p>
        </div>
      )}
    </div>
  );
};