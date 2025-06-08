import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';

import { 
  Plus, 
  Edit, 
  Save,
  X,
  Scissors,
  Filter
} from 'lucide-react';

export const Surgeries = () => {
  const [surgeries, setSurgeries] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSurgery, setEditingSurgery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPatient, setFilterPatient] = useState('');
  const [formData, setFormData] = useState({
    patientId: '', 
    surgeonId: '', 
    surgeryType: '', 
    surgeryName: '', 
    description: '', 
    scheduledDate: '', 
    estimatedDuration: '', 
    operatingRoom: '', 
    anesthesiaType: '', 
    preOpInstructions: '', 
    postOpInstructions: '',
    status: 'scheduled',
    urgencyLevel: 'routine'
  });

  useEffect(() => {
    fetchSurgeries();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchSurgeries = async () => {
    try {
      console.log('Fetching surgeries...');
      setLoading(true);
      const data = await api.get('/surgeries');
      console.log('Surgeries data:', data);
      setSurgeries(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching surgeries:', error);
      setError('Failed to load surgeries');
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

  const fetchDoctors = async () => {
    try {
      const data = await api.get('/doctors');
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        scheduledDate: formData.scheduledDate || new Date().toISOString().split('T')[0]
      };
      
      if (editingSurgery) {
        await api.put(`/surgeries/${editingSurgery.id}`, submitData);
      } else {
        await api.post('/surgeries', submitData);
      }
      
      setFormData({ 
        patientId: '', 
        surgeonId: '', 
        surgeryType: '', 
        surgeryName: '', 
        description: '', 
        scheduledDate: '', 
        estimatedDuration: '', 
        operatingRoom: '', 
        anesthesiaType: '', 
        preOpInstructions: '', 
        postOpInstructions: '',
        status: 'scheduled',
        urgencyLevel: 'routine'
      });
      setShowForm(false);
      setEditingSurgery(null);
      fetchSurgeries();
    } catch (error) {
      setError('Failed to save surgery');
      console.error('Error saving surgery:', error);
    }
  };

  const handleEdit = (surgery) => {
    setEditingSurgery(surgery);
    setFormData({
      patientId: surgery.patientId || '',
      surgeonId: surgery.surgeonId || '',
      surgeryType: surgery.surgeryType || '',
      surgeryName: surgery.surgeryName || '',
      description: surgery.description || '',
      scheduledDate: surgery.scheduledDate?.split('T')[0] || '',
      estimatedDuration: surgery.estimatedDuration || '',
      operatingRoom: surgery.operatingRoom || '',
      anesthesiaType: surgery.anesthesiaType || '',
      preOpInstructions: surgery.preOpInstructions || '',
      postOpInstructions: surgery.postOpInstructions || '',
      status: surgery.status || 'scheduled',
      urgencyLevel: surgery.urgencyLevel || 'routine'
    });
    setShowForm(true);
  };

  const filteredSurgeries = filterPatient 
    ? surgeries.filter(surgery => surgery.patientId === filterPatient)
    : surgeries;

  if (loading) return <LoadingSpinner message="Loading surgeries..." />;

  return (
    <div className="p-6 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Surgeries</h1>
          <p className="text-gray-600">Schedule and manage surgical procedures</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterPatient}
              onChange={(e) => setFilterPatient(e.target.value)}
              className="form-select text-sm"
            >
              <option value="">All Patients</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Schedule Surgery
          </button>
        </div>
      </div>

      {/* Surgery Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingSurgery ? 'Edit Surgery' : 'Schedule New Surgery'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingSurgery(null);
                  setFormData({ 
                    patientId: '', 
                    surgeonId: '', 
                    surgeryType: '', 
                    surgeryName: '', 
                    description: '', 
                    scheduledDate: '', 
                    estimatedDuration: '', 
                    operatingRoom: '', 
                    anesthesiaType: '', 
                    preOpInstructions: '', 
                    postOpInstructions: '',
                    status: 'scheduled',
                    urgencyLevel: 'routine'
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                        {patient.name} - {patient.phone}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Surgeon *
                  </label>
                  <select
                    value={formData.surgeonId}
                    onChange={(e) => setFormData({...formData, surgeonId: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="">Select Surgeon</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Surgery Type *
                  </label>
                  <select
                    value={formData.surgeryType}
                    onChange={(e) => setFormData({...formData, surgeryType: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="">Select Surgery Type</option>
                    <option value="General Surgery">General Surgery</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Neurosurgery">Neurosurgery</option>
                    <option value="Plastic Surgery">Plastic Surgery</option>
                    <option value="ENT">ENT</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Urology">Urology</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Surgery Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Appendectomy"
                    value={formData.surgeryName}
                    onChange={(e) => setFormData({...formData, surgeryName: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Detailed description of the surgical procedure"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 120"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({...formData, estimatedDuration: e.target.value})}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operating Room
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., OR-1"
                    value={formData.operatingRoom}
                    onChange={(e) => setFormData({...formData, operatingRoom: e.target.value})}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anesthesia Type
                  </label>
                  <select
                    value={formData.anesthesiaType}
                    onChange={(e) => setFormData({...formData, anesthesiaType: e.target.value})}
                    className="form-select"
                  >
                    <option value="">Select Type</option>
                    <option value="General">General</option>
                    <option value="Regional">Regional</option>
                    <option value="Local">Local</option>
                    <option value="Sedation">Sedation</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="form-select"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="postponed">Postponed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={formData.urgencyLevel}
                    onChange={(e) => setFormData({...formData, urgencyLevel: e.target.value})}
                    className="form-select"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pre-operative Instructions
                  </label>
                  <textarea
                    placeholder="Instructions for patient before surgery"
                    value={formData.preOpInstructions}
                    onChange={(e) => setFormData({...formData, preOpInstructions: e.target.value})}
                    className="form-textarea"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Post-operative Instructions
                  </label>
                  <textarea
                    placeholder="Instructions for patient after surgery"
                    value={formData.postOpInstructions}
                    onChange={(e) => setFormData({...formData, postOpInstructions: e.target.value})}
                    className="form-textarea"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingSurgery ? 'Update' : 'Schedule'} Surgery
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSurgery(null);
                    setFormData({ 
                      patientId: '', 
                      surgeonId: '', 
                      surgeryType: '', 
                      surgeryName: '', 
                      description: '', 
                      scheduledDate: '', 
                      estimatedDuration: '', 
                      operatingRoom: '', 
                      anesthesiaType: '', 
                      preOpInstructions: '', 
                      postOpInstructions: '',
                      status: 'scheduled',
                      urgencyLevel: 'routine'
                    });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Surgeries Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {filteredSurgeries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Surgery Details</th>
                  <th>Surgeon</th>
                  <th>Schedule</th>
                  <th>Room & Duration</th>
                  <th>Status</th>
                  <th>Urgency</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSurgeries.map((surgery) => (
                  <tr key={surgery.id}>
                    <td>
                      <div className="font-medium text-gray-900">
                        {surgery.patientName}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {surgery.surgeryName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {surgery.surgeryType}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-600">
                        {surgery.surgeonName}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div>{new Date(surgery.scheduledDate || surgery.createdAt).toLocaleDateString()}</div>
                        <div className="text-gray-500">
                          {new Date(surgery.scheduledDate || surgery.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div>{surgery.operatingRoom || 'TBD'}</div>
                        <div className="text-gray-500">
                          {surgery.estimatedDuration ? `${surgery.estimatedDuration} min` : 'TBD'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        surgery.status === 'completed' ? 'badge-success' :
                        surgery.status === 'in-progress' ? 'badge-warning' :
                        surgery.status === 'scheduled' ? 'badge-info' :
                        surgery.status === 'postponed' ? 'badge-secondary' :
                        'badge-danger'
                      }`}>
                        {surgery.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        surgery.urgencyLevel === 'emergency' ? 'badge-danger' :
                        surgery.urgencyLevel === 'urgent' ? 'badge-warning' :
                        'badge-secondary'
                      }`}>
                        {surgery.urgencyLevel}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(surgery)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Edit Surgery"
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
              <Scissors className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No surgeries scheduled</h3>
              <p className="text-gray-500 mb-6">Schedule your first surgery.</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Schedule First Surgery
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };