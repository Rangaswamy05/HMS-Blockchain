import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';

import { 
  Plus, 
  Edit, 
  Save,
  X,
  Wrench,
  Monitor,
  AlertTriangle,
  Calendar,
  MapPin,
  Settings,
  DollarSign,
  Package
} from 'lucide-react';

export const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    manufacturer: '',
    serialNumber: '',
    category: '',
    department: '',
    location: '',
    purchaseDate: '',
    purchasePrice: '',
    warrantyExpiry: '',
    lastMaintenance: '',
    nextMaintenance: '',
    condition: 'excellent',
    status: 'available',
    description: ''
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      console.log('Fetching equipment...');
      setLoading(true);
      const data = await api.get('/equipment');
      console.log('Equipment data:', data);
      setEquipment(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const equipmentData = {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice) || 0
      };

      if (editingEquipment) {
        await api.put(`/equipment/${editingEquipment.id}`, equipmentData);
      } else {
        await api.post('/equipment', equipmentData);
      }
      
      resetForm();
      fetchEquipment();
    } catch (error) {
      setError('Failed to save equipment');
      console.error('Error saving equipment:', error);
    }
  };

  const handleEdit = (equipmentItem) => {
    setEditingEquipment(equipmentItem);
    setFormData({
      name: equipmentItem.name || '',
      model: equipmentItem.model || '',
      manufacturer: equipmentItem.manufacturer || '',
      serialNumber: equipmentItem.serialNumber || '',
      category: equipmentItem.category || '',
      department: equipmentItem.department || '',
      location: equipmentItem.location || '',
      purchaseDate: equipmentItem.purchaseDate || '',
      purchasePrice: equipmentItem.purchasePrice?.toString() || '',
      warrantyExpiry: equipmentItem.warrantyExpiry || '',
      lastMaintenance: equipmentItem.lastMaintenance || '',
      nextMaintenance: equipmentItem.nextMaintenance || '',
      condition: equipmentItem.condition || 'excellent',
      status: equipmentItem.status || 'available',
      description: equipmentItem.description || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingEquipment(null);
    setFormData({
      name: '',
      model: '',
      manufacturer: '',
      serialNumber: '',
      category: '',
      department: '',
      location: '',
      purchaseDate: '',
      purchasePrice: '',
      warrantyExpiry: '',
      lastMaintenance: '',
      nextMaintenance: '',
      condition: 'excellent',
      status: 'available',
      description: ''
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

  const isWarrantyExpired = (warrantyDate) => {
    if (!warrantyDate) return false;
    return new Date(warrantyDate) < new Date();
  };

  const isMaintenanceDue = (nextMaintenanceDate) => {
    if (!nextMaintenanceDate) return false;
    const today = new Date();
    const maintenanceDate = new Date(nextMaintenanceDate);
    const daysUntilMaintenance = Math.ceil((maintenanceDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilMaintenance <= 7; // Due within 7 days
  };

  if (loading) return <LoadingSpinner message="Loading equipment..." />;

  return (
    <div className="p-6 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Equipment Management</h1>
          <p className="text-gray-600">Manage medical equipment and devices</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Equipment
        </button>
      </div>

      {/* Equipment Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-6 ">
              <h2 className="text-xl font-semibold">
                {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
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
                    <Monitor className="h-5 w-5" />
                    Basic Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Equipment Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter equipment name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model
                      </label>
                      <input
                        type="text"
                        placeholder="Enter model number"
                        value={formData.model}
                        onChange={(e) => setFormData({...formData, model: e.target.value})}
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
                        Serial Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter serial number"
                        value={formData.serialNumber}
                        onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Classification
                  </h3>
                  
                  <div className="space-y-4">
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
                        <option value="Diagnostic">Diagnostic Equipment</option>
                        <option value="Therapeutic">Therapeutic Equipment</option>
                        <option value="Surgical">Surgical Equipment</option>
                        <option value="Laboratory">Laboratory Equipment</option>
                        <option value="Radiology">Radiology Equipment</option>
                        <option value="Monitoring">Patient Monitoring</option>
                        <option value="Life Support">Life Support</option>
                        <option value="Rehabilitation">Rehabilitation</option>
                        <option value="IT">IT Equipment</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="form-select"
                      >
                        <option value="">Select Department</option>
                        <option value="Emergency">Emergency</option>
                        <option value="ICU">ICU</option>
                        <option value="Surgery">Surgery</option>
                        <option value="Radiology">Radiology</option>
                        <option value="Laboratory">Laboratory</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Neurology">Neurology</option>
                        <option value="General Ward">General Ward</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Administration">Administration</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Room 101, Floor 2"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
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
                        <option value="in-use">In Use</option>
                        <option value="maintenance">Under Maintenance</option>
                        <option value="out-of-order">Out of Order</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase & Warranty Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Purchase & Warranty
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warranty Expiry
                    </label>
                    <input
                      type="date"
                      value={formData.warrantyExpiry}
                      onChange={(e) => setFormData({...formData, warrantyExpiry: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Maintenance Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Maintenance
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Maintenance
                    </label>
                    <input
                      type="date"
                      value={formData.lastMaintenance}
                      onChange={(e) => setFormData({...formData, lastMaintenance: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Maintenance
                    </label>
                    <input
                      type="date"
                      value={formData.nextMaintenance}
                      onChange={(e) => setFormData({...formData, nextMaintenance: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({...formData, condition: e.target.value})}
                      className="form-select"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                      <option value="needs-repair">Needs Repair</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description/Notes
                </label>
                <textarea
                  placeholder="Enter additional notes, specifications, or usage instructions"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-input"
                  rows="3"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingEquipment ? 'Update' : 'Add'} Equipment
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

      {/* Equipment Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {equipment.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Condition</th>
                  <th>Maintenance</th>
                  <th>Warranty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        {item.model && (
                          <div className="text-sm text-gray-500">
                            Model: {item.model}
                          </div>
                        )}
                        {item.manufacturer && (
                          <div className="text-xs text-gray-400">
                            {item.manufacturer}
                          </div>
                        )}
                        {item.serialNumber && (
                          <div className="text-xs text-gray-400">
                            S/N: {item.serialNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <div>
                          <div>{item.department || 'Not assigned'}</div>
                          {item.location && (
                            <div className="text-xs text-gray-500">{item.location}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-600">
                        {item.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        item.condition === 'excellent' ? 'badge-success' :
                        item.condition === 'good' ? 'badge-success' :
                        item.condition === 'fair' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {item.condition || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm">
                        {item.nextMaintenance ? (
                          <div className={`flex items-center gap-1 ${
                            isMaintenanceDue(item.nextMaintenance) ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(item.nextMaintenance)}</span>
                            {isMaintenanceDue(item.nextMaintenance) && (
                              <AlertTriangle className="h-4 w-4 text-red-500 ml-1" title="Maintenance Due" />
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not scheduled</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        {item.warrantyExpiry ? (
                          <div className={`flex items-center gap-1 ${
                            isWarrantyExpired(item.warrantyExpiry) ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(item.warrantyExpiry)}</span>
                            {isWarrantyExpired(item.warrantyExpiry) && (
                              <AlertTriangle className="h-4 w-4 text-red-500 ml-1" title="Warranty Expired" />
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        item.status === 'available' ? 'badge-success' :
                        item.status === 'in-use' ? 'badge-warning' :
                        item.status === 'maintenance' ? 'badge-warning' :
                        item.status === 'out-of-order' ? 'badge-danger' :
                        'badge-secondary'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Edit Equipment"
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
            <Monitor className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment registered</h3>
            <p className="text-gray-500 mb-6">Add your first equipment to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Add First Equipment
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {equipment.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Total Equipment</div>
            <div className="text-2xl font-bold text-gray-900">{equipment.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Total Value</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(equipment.reduce((sum, item) => sum + (item.purchasePrice || 0), 0))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Maintenance Due</div>
            <div className="text-2xl font-bold text-red-600">
              {equipment.filter(item => isMaintenanceDue(item.nextMaintenance)).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Out of Order</div>
            <div className="text-2xl font-bold text-red-600">
              {equipment.filter(item => item.status === 'out-of-order').length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};