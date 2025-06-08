import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import {  
  FileText, 
  Plus, 
  Save,
  X,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

export const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [formData, setFormData] = useState({
    patientId: '', doctorId: '', diagnosis: '', treatment: '', notes: '', date: ''
  });

  useEffect(() => {
    fetchRecords();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await api.get('/medical-records');
      setRecords(data);
      setError(null);
    } catch (error) {
      setError('Failed to load medical records');
      console.error('Error fetching records:', error);
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
      await api.post('/medical-records', {
        ...formData,
        date: formData.date || new Date().toISOString().split('T')[0]
      });
      setFormData({ patientId: '', doctorId: '', diagnosis: '', treatment: '', notes: '', date: '' });
      setShowForm(false);
      fetchRecords();
    } catch (error) {
      setError('Failed to save medical record');
      console.error('Error saving record:', error);
    }
  };

  const filteredRecords = selectedPatient 
    ? records.filter(record => record.patientId === selectedPatient)
    : records;

  if (loading) return <LoadingSpinner message="Loading medical records..." />;

  return (
    <div className="p-6 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Medical Records</h1>
          <p className="text-gray-600">Manage patient medical history and records</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Medical Record
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Patient
            </label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="form-select"
            >
              <option value="">All Patients</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Medical Record Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add Medical Record</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({ patientId: '', doctorId: '', diagnosis: '', treatment: '', notes: '', date: '' });
                }}
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
                      {patient.name} - {patient.phone}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor *
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
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis *
                </label>
                <textarea
                  placeholder="Enter diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                  className="form-textarea"
                  rows="3"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment *
                </label>
                <textarea
                  placeholder="Enter treatment details"
                  value={formData.treatment}
                  onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                  className="form-textarea"
                  rows="3"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  placeholder="Enter additional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="form-textarea"
                  rows="3"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Medical Record
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ patientId: '', doctorId: '', diagnosis: '', treatment: '', notes: '', date: '' });
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

      {/* Medical Records List */}
      <div className="space-y-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div key={record.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {record.patientName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Treated by {record.doctorName}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {record.date ? new Date(record.date).toLocaleDateString() : 
                   record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Diagnosis</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {record.diagnosis}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Treatment</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {record.treatment}
                  </p>
                </div>
              </div>
              
              {record.notes && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {record.notes}
                  </p>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                Record ID: {record.id} • Created: {record.createdAt ? new Date(record.createdAt).toLocaleString() : 'N/A'}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records found</h3>
            <p className="text-gray-500 mb-6">
              {selectedPatient ? 'No records found for the selected patient.' : 'Add your first medical record to get started.'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Add First Medical Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
};