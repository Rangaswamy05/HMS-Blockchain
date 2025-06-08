import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';

import { 
  Plus, 
  Edit, 
  Save,
  X,
  Bed,
  Filter
} from 'lucide-react';

export const Admissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPatient, setFilterPatient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    patientId: '', 
    doctorId: '', 
    roomId: '', 
    admissionType: 'planned',
    admissionReason: '', 
    diagnosis: '', 
    admissionDate: '', 
    estimatedDischargeDate: '', 
    dischargeDate: '',
    emergencyContact: '',
    emergencyContactPhone: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
    admissionNotes: '',
    dischargeNotes: '',
    status: 'active',
    priority: 'routine'
  });

  useEffect(() => {
    fetchAdmissions();
    fetchPatients();
    fetchDoctors();
    fetchRooms();
  }, []);

  const fetchAdmissions = async () => {
    try {
      console.log('Fetching admissions...');
      setLoading(true);
      const data = await api.get('/admissions');
      console.log('Admissions data:', data);
      setAdmissions(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching admissions:', error);
      setError('Failed to load admissions');
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

  const fetchRooms = async () => {
    try {
      const data = await api.get('/rooms');
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0]
      };
      
      if (editingAdmission) {
        await api.put(`/admissions/${editingAdmission.id}`, submitData);
      } else {
        await api.post('/admissions', submitData);
      }
      
      setFormData({ 
        patientId: '', 
        doctorId: '', 
        roomId: '', 
        admissionType: 'planned',
        admissionReason: '', 
        diagnosis: '', 
        admissionDate: '', 
        estimatedDischargeDate: '', 
        dischargeDate: '',
        emergencyContact: '',
        emergencyContactPhone: '',
        medicalHistory: '',
        allergies: '',
        currentMedications: '',
        admissionNotes: '',
        dischargeNotes: '',
        status: 'active',
        priority: 'routine'
      });
      setShowForm(false);
      setEditingAdmission(null);
      fetchAdmissions();
      fetchRooms(); // Refresh rooms to update availability
    } catch (error) {
      setError('Failed to save admission');
      console.error('Error saving admission:', error);
    }
  };

  const handleEdit = (admission) => {
    setEditingAdmission(admission);
    setFormData({
      patientId: admission.patientId || '',
      doctorId: admission.doctorId || '',
      roomId: admission.roomId || '',
      admissionType: admission.admissionType || 'planned',
      admissionReason: admission.admissionReason || '',
      diagnosis: admission.diagnosis || '',
      admissionDate: admission.admissionDate?.split('T')[0] || '',
      estimatedDischargeDate: admission.estimatedDischargeDate?.split('T')[0] || '',
      dischargeDate: admission.dischargeDate?.split('T')[0] || '',
      emergencyContact: admission.emergencyContact || '',
      emergencyContactPhone: admission.emergencyContactPhone || '',
      medicalHistory: admission.medicalHistory || '',
      allergies: admission.allergies || '',
      currentMedications: admission.currentMedications || '',
      admissionNotes: admission.admissionNotes || '',
      dischargeNotes: admission.dischargeNotes || '',
      status: admission.status || 'active',
      priority: admission.priority || 'routine'
    });
    setShowForm(true);
  };

  const filteredAdmissions = admissions.filter(admission => {
    const patientMatch = !filterPatient || admission.patientId === filterPatient;
    const statusMatch = !filterStatus || admission.status === filterStatus;
    return patientMatch && statusMatch;
  });

  // Get available rooms (not occupied)
  const availableRooms = rooms.filter(room => room.status !== 'occupied' || room.id === formData.roomId);

  if (loading) return <LoadingSpinner message="Loading admissions..." />;

  return (
    <div className="p-6 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Patient Admissions</h1>
          <p className="text-gray-600">Manage hospital admissions and discharges</p>
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
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="discharged">Discharged</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Admission
          </button>
        </div>
      </div>

      {/* Admission Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingAdmission ? 'Edit Admission' : 'New Patient Admission'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAdmission(null);
                  setFormData({ 
                    patientId: '', 
                    doctorId: '', 
                    roomId: '', 
                    admissionType: 'planned',
                    admissionReason: '', 
                    diagnosis: '', 
                    admissionDate: '', 
                    estimatedDischargeDate: '', 
                    dischargeDate: '',
                    emergencyContact: '',
                    emergencyContactPhone: '',
                    medicalHistory: '',
                    allergies: '',
                    currentMedications: '',
                    admissionNotes: '',
                    dischargeNotes: '',
                    status: 'active',
                    priority: 'routine'
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-3 gap-4">
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
                      Attending Doctor *
                    </label>
                    <select
                      value={formData.doctorId}
                      onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                      className="form-select"
                      required
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Assignment
                    </label>
                    <select
                      value={formData.roomId}
                      onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                      className="form-select"
                    >
                      <option value="">Select Room</option>
                      {availableRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.number} - {room.type} ({room.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Admission Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Admission Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admission Type *
                    </label>
                    <select
                      value={formData.admissionType}
                      onChange={(e) => setFormData({...formData, admissionType: e.target.value})}
                      className="form-select"
                      required
                    >
                      <option value="planned">Planned</option>
                      <option value="emergency">Emergency</option>
                      <option value="urgent">Urgent</option>
                      <option value="transfer">Transfer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="form-select"
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admission Reason *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Chest pain, Surgery, Observation"
                      value={formData.admissionReason}
                      onChange={(e) => setFormData({...formData, admissionReason: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Diagnosis
                    </label>
                    <input
                      type="text"
                      placeholder="Primary diagnosis or suspected condition"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Dates and Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dates & Status</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admission Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({...formData, admissionDate: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Discharge
                    </label>
                    <input
                      type="date"
                      value={formData.estimatedDischargeDate}
                      onChange={(e) => setFormData({...formData, estimatedDischargeDate: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discharge Date
                    </label>
                    <input
                      type="date"
                      value={formData.dischargeDate}
                      onChange={(e) => setFormData({...formData, dischargeDate: e.target.value})}
                      className="form-input"
                      disabled={formData.status === 'active'}
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
                      <option value="active">Active</option>
                      <option value="discharged">Discharged</option>
                      <option value="transferred">Transferred</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      placeholder="Contact person name"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="Contact phone number"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medical History
                    </label>
                    <textarea
                      placeholder="Relevant medical history"
                      value={formData.medicalHistory}
                      onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                      className="form-textarea"
                      rows="2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Known Allergies
                      </label>
                      <textarea
                        placeholder="List any known allergies"
                        value={formData.allergies}
                        onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                        className="form-textarea"
                        rows="2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Medications
                      </label>
                      <textarea
                        placeholder="List current medications"
                        value={formData.currentMedications}
                        onChange={(e) => setFormData({...formData, currentMedications: e.target.value})}
                        className="form-textarea"
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admission Notes
                    </label>
                    <textarea
                      placeholder="Additional notes about the admission"
                      value={formData.admissionNotes}
                      onChange={(e) => setFormData({...formData, admissionNotes: e.target.value})}
                      className="form-textarea"
                      rows="3"
                    />
                  </div>
                  
                  {(editingAdmission || formData.status === 'discharged') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discharge Notes
                      </label>
                      <textarea
                        placeholder="Discharge summary and instructions"
                        value={formData.dischargeNotes}
                        onChange={(e) => setFormData({...formData, dischargeNotes: e.target.value})}
                        className="form-textarea"
                        rows="3"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingAdmission ? 'Update' : 'Create'} Admission
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAdmission(null);
                    setFormData({ 
                      patientId: '', 
                      doctorId: '', 
                      roomId: '', 
                      admissionType: 'planned',
                      admissionReason: '', 
                      diagnosis: '', 
                      admissionDate: '', 
                      estimatedDischargeDate: '', 
                      dischargeDate: '',
                      emergencyContact: '',
                      emergencyContactPhone: '',
                      medicalHistory: '',
                      allergies: '',
                      currentMedications: '',
                      admissionNotes: '',
                      dischargeNotes: '',
                      status: 'active',
                      priority: 'routine'
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

      {/* Admissions Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {filteredAdmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Room</th>
                  <th>admission Details</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.map((admission) => (
                  <tr key={admission.id}>
                    <td>
                      <div className="font-medium text-gray-900">
                        {admission.patientName}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-600">
                        {admission.doctorName}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-600">
                        {admission.roomNumber || 'Unassigned'}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {admission.admissionReason}
                        </div>
                        <div className="text-sm text-gray-500">
                          {admission.admissionType} admission
                        </div>
                        {admission.diagnosis && (
                          <div className="text-sm text-gray-600">
                            {admission.diagnosis}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div>Admitted: {new Date(admission.admissionDate || admission.createdAt).toLocaleDateString()}</div>
                        {admission.estimatedDischargeDate && (
                          <div className="text-blue-600">
                            Est. Discharge: {new Date(admission.estimatedDischargeDate).toLocaleDateString()}
                          </div>
                        )}
                        {admission.dischargeDate && (
                          <div className="text-green-600">
                            Discharged: {new Date(admission.dischargeDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        admission.status === 'active' ? 'badge-success' :
                        admission.status === 'discharged' ? 'badge-secondary' :
                        admission.status === 'transferred' ? 'badge-info' :
                        'badge-warning'
                      }`}>
                        {admission.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        admission.priority === 'critical' ? 'badge-danger' :
                        admission.priority === 'urgent' ? 'badge-warning' :
                        'badge-secondary'
                      }`}>
                        {admission.priority}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(admission)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Edit Admission"
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
              <Bed className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No admissions found</h3>
              <p className="text-gray-500 mb-6">Create your first patient admission.</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Create First Admission
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };