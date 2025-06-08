import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';

import { 
  Plus, 
  Edit, 
  Save,
  X,
  Receipt,
  DollarSign,
  Calendar,
  User,
  Filter
} from 'lucide-react';

export const Bills = () => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPatientId, setFilterPatientId] = useState('');
  const [formData, setFormData] = useState({
    patientId: '', 
    description: '', 
    amount: '', 
    billType: '', 
    dueDate: '', 
    status: 'pending'
  });

  useEffect(() => {
    fetchBills();
    fetchPatients();
  }, []);

  useEffect(() => {
    fetchBills();
  }, [filterPatientId]);

  const fetchBills = async () => {
    try {
      console.log('Fetching bills...');
      setLoading(true);
      const url = filterPatientId ? `/bills?patientId=${filterPatientId}` : '/bills';
      const data = await api.get(url);
      console.log('Bills data:', data);
      setBills(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setError('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await api.get('/patients');
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const billData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingBill) {
        await api.put(`/bills/${editingBill.id}`, billData);
      } else {
        await api.post('/bills', billData);
      }
      
      setFormData({ 
        patientId: '', 
        description: '', 
        amount: '', 
        billType: '', 
        dueDate: '', 
        status: 'pending' 
      });
      setShowForm(false);
      setEditingBill(null);
      fetchBills();
    } catch (error) {
      setError('Failed to save bill');
      console.error('Error saving bill:', error);
    }
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setFormData({
      patientId: bill.patientId || '',
      description: bill.description || '',
      amount: bill.amount?.toString() || '',
      billType: bill.billType || '',
      dueDate: bill.dueDate || '',
      status: bill.status || 'pending'
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingBill(null);
    setFormData({ 
      patientId: '', 
      description: '', 
      amount: '', 
      billType: '', 
      dueDate: '', 
      status: 'pending' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <LoadingSpinner message="Loading bills..." />;

  return (
    <div className="p-6 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bills Management</h1>
          <p className="text-gray-600">Manage patient billing and invoices</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Bill
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter by Patient:</label>
            <select
              value={filterPatientId}
              onChange={(e) => setFilterPatientId(e.target.value)}
              className="form-select w-48"
            >
              <option value="">All Patients</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
          {filterPatientId && (
            <button
              onClick={() => setFilterPatientId('')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Bill Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingBill ? 'Edit Bill' : 'Create New Bill'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient *
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                  className="form-select"
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  placeholder="Enter bill description or services provided"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-input"
                  rows="3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill Type
                  </label>
                  <select
                    value={formData.billType}
                    onChange={(e) => setFormData({...formData, billType: e.target.value})}
                    className="form-select"
                  >
                    <option value="">Select Type</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Laboratory">Laboratory Tests</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Medication">Medication</option>
                    <option value="Room Charges">Room Charges</option>
                    <option value="Emergency">Emergency Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="form-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingBill ? 'Update' : 'Create'} Bill
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {bills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Patient</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <div className="font-mono text-sm text-gray-600">
                        #{bill.id?.slice(-8)}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {bill.patientName || 'Unknown Patient'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {bill.description}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          {formatCurrency(bill.amount)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-600">
                        {bill.billType || 'Not specified'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{formatDate(bill.dueDate)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        bill.status === 'paid' ? 'badge-success' :
                        bill.status === 'pending' ? 'badge-warning' :
                        bill.status === 'overdue' ? 'badge-danger' :
                        'badge-secondary'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-gray-500">
                        {formatDate(bill.createdAt)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(bill)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Edit Bill"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Receipt className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
            <p className="text-gray-500 mb-6">
              {filterPatientId ? 'No bills found for the selected patient.' : 'Create your first bill to get started.'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Create First Bill
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {bills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Total Bills</div>
            <div className="text-2xl font-bold text-gray-900">{bills.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Total Amount</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(bills.reduce((sum, bill) => sum + (bill.amount || 0), 0))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Paid Bills</div>
            <div className="text-2xl font-bold text-green-600">
              {bills.filter(bill => bill.status === 'paid').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Pending Bills</div>
            <div className="text-2xl font-bold text-yellow-600">
              {bills.filter(bill => bill.status === 'pending').length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};