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
    <div className="p-6 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blockchain Records</h1>
          <p className="text-gray-600">Immutable transaction history and verification</p>
        </div>
        <div className="flex items-center gap-4">
          {verification && (
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              verification.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
          <div className="text-sm text-gray-600">
            {verification?.blockCount} blocks
          </div>
          <button
            onClick={() => {
              fetchBlockchain();
              verifyBlockchain();
            }}
            className="btn-primary text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Block Detail Modal */}
      {selectedBlock && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Block #{selectedBlock.index} Details</h2>
              <button
                onClick={() => setSelectedBlock(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Block Index
                  </label>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    {selectedBlock.index}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timestamp
                  </label>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {new Date(selectedBlock.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block Hash
                </label>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono break-all">
                  {selectedBlock.hash}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Hash
                </label>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono break-all">
                  {selectedBlock.previousHash}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Data
                </label>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {selectedBlock.data === "Genesis Block" ? (
                    <p className="text-gray-600">Genesis Block - No transaction data</p>
                  ) : (
                    <div className="space-y-2">
                      <div><strong>Type:</strong> {selectedBlock.data.type}</div>
                      {selectedBlock.data.patientId && (
                        <div><strong>Patient ID:</strong> {selectedBlock.data.patientId}</div>
                      )}
                      {selectedBlock.data.doctorId && (
                        <div><strong>Doctor ID:</strong> {selectedBlock.data.doctorId}</div>
                      )}
                      {selectedBlock.data.appointmentId && (
                        <div><strong>Appointment ID:</strong> {selectedBlock.data.appointmentId}</div>
                      )}
                      {selectedBlock.data.recordId && (
                        <div><strong>Record ID:</strong> {selectedBlock.data.recordId}</div>
                      )}
                      <div><strong>Transaction Time:</strong> {new Date(selectedBlock.data.timestamp).toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => setSelectedBlock(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Visualization */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
               onClick={() => handleBlockClick(block)}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Block #{block.index}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(block.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800">
                <Eye className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Hash</h4>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded truncate">
                  {block.hash}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Previous Hash</h4>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded truncate">
                  {block.previousHash}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Transaction Type</h4>
                <div className="bg-gray-100 p-2 rounded">
                  {block.data === "Genesis Block" ? (
                    <span className="text-xs text-gray-600">Genesis Block</span>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded ${
                      block.data.type === 'PATIENT_REGISTERED' ? 'bg-blue-100 text-blue-800' :
                      block.data.type === 'DOCTOR_REGISTERED' ? 'bg-green-100 text-green-800' :
                      block.data.type === 'APPOINTMENT_SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                      block.data.type === 'MEDICAL_RECORD_CREATED' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {block.data.type?.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {index < blocks.length - 1 && (
              <div className="flex justify-center mt-4">
                <div className="w-px h-8 bg-gray-300"></div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {blocks.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blockchain data</h3>
          <p className="text-gray-500">Blockchain will be populated as transactions occur.</p>
        </div>
      )}
    </div>
  );
};