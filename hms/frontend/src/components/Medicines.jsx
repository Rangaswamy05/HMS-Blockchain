import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';

import { 
  Plus, 
  Edit, 
  Save,
  X,
  Pill,
  Package,
  AlertTriangle,
  Calendar,
  Beaker,
  Factory
} from 'lucide-react';

export const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    manufacturer: '',
    dosage: '',
    form: '',
    category: '',
    quantity: '',
    unitPrice: '',
    expiryDate: '',
    batchNumber: '',
    description: '',
    status: 'available'
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      console.log('Fetching medicines...');
      setLoading(true);
      const data = await api.get('/medicines');
      console.log('Medicines data:', data);
      setMedicines(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setError('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const medicineData = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        unitPrice: parseFloat(formData.unitPrice) || 0
      };

      if (editingMedicine) {
        await api.put(`/medicines/${editingMedicine.id}`, medicineData);
      } else {
        await api.post('/medicines', medicineData);
      }
      
      resetForm();
      fetchMedicines();
    } catch (error) {
      setError('Failed to save medicine');
      console.error('Error saving medicine:', error);
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name || '',
      genericName: medicine.genericName || '',
      manufacturer: medicine.manufacturer || '',
      dosage: medicine.dosage || '',
      form: medicine.form || '',
      category: medicine.category || '',
      quantity: medicine.quantity?.toString() || '',
      unitPrice: medicine.unitPrice?.toString() || '',
      expiryDate: medicine.expiryDate || '',
      batchNumber: medicine.batchNumber || '',
      description: medicine.description || '',
      status: medicine.status || 'available'
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMedicine(null);
    setFormData({
      name: '',
      genericName: '',
      manufacturer: '',
      dosage: '',
      form: '',
      category: '',
      quantity: '',
      unitPrice: '',
      expiryDate: '',
      batchNumber: '',
      description: '',
      status: 'available'
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

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isLowStock = (quantity) => {
    return quantity < 10; // Consider low stock if less than 10 units
  };

  if (loading) return <LoadingSpinner message="Loading medicines..." />;

  return (
    <div className="p-6 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Medicine Inventory</h1>
          <p className="text-gray-600">Manage pharmaceutical inventory and stock</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Medicine
        </button>
      </div>

      {/* Medicine Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Basic Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medicine Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter medicine brand name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Generic Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter generic/scientific name"
                        value={formData.genericName}
                        onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manufacturer
                      </label>
                      <input
                        type="text"
                        placeholder="Enter manufacturer name"
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="form-select"
                      >
                        <option value="">Select Category</option>
                        <option value="Antibiotic">Antibiotic</option>
                        <option value="Analgesic">Analgesic (Pain Relief)</option>
                        <option value="Antiviral">Antiviral</option>
                        <option value="Antihistamine">Antihistamine</option>
                        <option value="Cardiovascular">Cardiovascular</option>
                        <option value="Diabetes">Diabetes</option>
                        <option value="Respiratory">Respiratory</option>
                        <option value="Gastrointestinal">Gastrointestinal</option>
                        <option value="Neurological">Neurological</option>
                        <option value="Vitamin/Supplement">Vitamin/Supplement</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Beaker className="h-5 w-5" />
                    Specifications
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 500mg, 10ml"
                        value={formData.dosage}
                        onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Form
                      </label>
                      <select
                        value={formData.form}
                        onChange={(e) => setFormData({...formData, form: e.target.value})}
                        className="form-select"
                      >
                        <option value="">Select Form</option>
                        <option value="Tablet">Tablet</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Syrup">Syrup</option>
                        <option value="Injection">Injection</option>
                        <option value="Cream">Cream</option>
                        <option value="Ointment">Ointment</option>
                        <option value="Drops">Drops</option>
                        <option value="Inhaler">Inhaler</option>
                        <option value="Patch">Patch</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Batch Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter batch number"
                        value={formData.batchNumber}
                        onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
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
                        <option value="available">Available</option>
                        <option value="out-of-stock">Out of Stock</option>
                        <option value="discontinued">Discontinued</option>
                        <option value="restricted">Restricted</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory & Pricing */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory & Pricing
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity in Stock *
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description/Notes
                </label>
                <textarea
                  placeholder="Enter additional notes, usage instructions, or warnings"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-input"
                  rows="3"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingMedicine ? 'Update' : 'Add'} Medicine
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

      {/* Medicines Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {medicines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Manufacturer</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((medicine) => (
                  <tr key={medicine.id}>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {medicine.name}
                        </div>
                        {medicine.genericName && (
                          <div className="text-sm text-gray-500">
                            {medicine.genericName}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          {medicine.dosage} {medicine.form && `• ${medicine.form}`}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Factory className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {medicine.manufacturer || 'Not specified'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-600">
                        {medicine.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className={`font-medium ${
                          isLowStock(medicine.quantity) ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {medicine.quantity || 0}
                        </span>
                        {isLowStock(medicine.quantity) && (
                          <AlertTriangle className="h-4 w-4 text-red-500" title="Low Stock" />
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(medicine.unitPrice || 0)}
                      </span>
                    </td>
                    <td>
                      <div className={`flex items-center gap-1 text-sm ${
                        isExpired(medicine.expiryDate) ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(medicine.expiryDate)}</span>
                        {isExpired(medicine.expiryDate) && (
                          <AlertTriangle className="h-4 w-4 text-red-500 ml-1" title="Expired" />
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        medicine.status === 'available' ? 'badge-success' :
                        medicine.status === 'out-of-stock' ? 'badge-danger' :
                        medicine.status === 'discontinued' ? 'badge-secondary' :
                        'badge-warning'
                      }`}>
                        {medicine.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(medicine)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Edit Medicine"
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
            <Pill className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines in inventory</h3>
            <p className="text-gray-500 mb-6">Add your first medicine to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Add First Medicine
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {medicines.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Total Medicines</div>
            <div className="text-2xl font-bold text-gray-900">{medicines.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Total Stock Value</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(medicines.reduce((sum, med) => sum + ((med.quantity || 0) * (med.unitPrice || 0)), 0))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Low Stock Items</div>
            <div className="text-2xl font-bold text-red-600">
              {medicines.filter(med => isLowStock(med.quantity)).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Expired Items</div>
            <div className="text-2xl font-bold text-red-600">
              {medicines.filter(med => isExpired(med.expiryDate)).length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};