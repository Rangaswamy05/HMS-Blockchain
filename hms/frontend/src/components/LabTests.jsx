import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';

import { 
  Plus, 
  Edit, 
  Save,
  X,
  TestTube,
  Filter
} from 'lucide-react';

export const LabTests = () => {
  const [labTests, setLabTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPatient, setFilterPatient] = useState('');
  const [formData, setFormData] = useState({
    patientId: '', doctorId: '', technicianId: '', testType: '', testName: '', 
    instructions: '', results: '', status: 'ordered', orderedDate: '', completedDate: ''
  });

  useEffect(() => {
    fetchLabTests();
    fetchPatients();
    fetchDoctors();
    fetchTechnicians();
  }, []);

  const fetchLabTests = async () => {
    try {
      console.log('Fetching lab tests...');
      setLoading(true);
      const data = await api.get('/lab-tests');
      console.log('Lab tests data:', data);
      setLabTests(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      setError('Failed to load lab tests');
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

  const fetchTechnicians = async () => {
    try {
      const data = await api.get('/technicians');
      setTechnicians(data);
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        orderedDate: formData.orderedDate || new Date().toISOString().split('T')[0]
      };
      
      if (editingTest) {
        await api.put(`/lab-tests/${editingTest.id}`, submitData);
      } else {
        await api.post('/lab-tests', submitData);
      }
      setFormData({ 
        patientId: '', doctorId: '', technicianId: '', testType: '', testName: '', 
        instructions: '', results: '', status: 'ordered', orderedDate: '', completedDate: ''
      });
      setShowForm(false);
      setEditingTest(null);
      fetchLabTests();
    } catch (error) {
      setError('Failed to save lab test');
      console.error('Error saving lab test:', error);
    }
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setFormData({
      patientId: test.patientId || '',
      doctorId: test.doctorId || '',
      technicianId: test.technicianId || '',
      testType: test.testType || '',
      testName: test.testName || '',
      instructions: test.instructions || '',
      results: test.results || '',
      status: test.status || 'ordered',
      orderedDate: test.orderedDate?.split('T')[0] || '',
      completedDate: test.completedDate?.split('T')[0] || ''
    });
    setShowForm(true);
  };

  const filteredTests = filterPatient 
    ? labTests.filter(test => test.patientId === filterPatient)
    : labTests;

  if (loading) return <LoadingSpinner message="Loading lab tests..." />;

  return (
    <div className="p-6 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lab Tests</h1>
          <p className="text-gray-600">Manage laboratory tests and results</p>
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
            Order Test
          </button>
        </div>
      </div>

      {/* Lab Test Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingTest ? 'Edit Lab Test' : 'Order New Lab Test'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingTest(null);
                  setFormData({ 
                    patientId: '', doctorId: '', technicianId: '', testType: '', testName: '', 
                    instructions: '', results: '', status: 'ordered', orderedDate: '', completedDate: ''
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
                    Ordering Doctor *
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Type *
                  </label>
                  <select
                    value={formData.testType}
                    onChange={(e) => setFormData({...formData, testType: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="">Select Test Type</option>
                    <option value="Blood Test">Blood Test</option>
                    <option value="Urine Test">Urine Test</option>
                    <option value="Stool Test">Stool Test</option>
                    <option value="Imaging">Imaging</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Hematology">Hematology</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Complete Blood Count"
                    value={formData.testName}
                    onChange={(e) => setFormData({...formData, testName: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Technician
                </label>
                <select
                  value={formData.technicianId}
                  onChange={(e) => setFormData({...formData, technicianId: e.target.value})}
                  className="form-select"
                >
                  <option value="">Assign Technician</option>
                  {technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>
                      {technician.name} - {technician.specialization}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  placeholder="Special instructions for the test"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  className="form-textarea"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordered Date
                  </label>
                  <input
                    type="date"
                    value={formData.orderedDate}
                    onChange={(e) => setFormData({...formData, orderedDate: e.target.value})}
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
                    <option value="ordered">Ordered</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Completed Date
                  </label>
                  <input
                    type="date"
                    value={formData.completedDate}
                    onChange={(e) => setFormData({...formData, completedDate: e.target.value})}
                    className="form-input"
                    disabled={formData.status !== 'completed'}
                  />
                </div>
              </div>
              
              {(editingTest || formData.status === 'completed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Results
                  </label>
                  <textarea
                    placeholder="Test results and findings"
                    value={formData.results}
                    onChange={(e) => setFormData({...formData, results: e.target.value})}
                    className="form-textarea"
                    rows="4"
                  />
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingTest ? 'Update' : 'Order'} Test
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTest(null);
                    setFormData({ 
                      patientId: '', doctorId: '', technicianId: '', testType: '', testName: '', 
                      instructions: '', results: '', status: 'ordered', orderedDate: '', completedDate: ''
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

      {/* Lab Tests Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {filteredTests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Test Details</th>
                  <th>Doctor</th>
                  <th>Technician</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test) => (
                  <tr key={test.id}>
                    <td>
                      <div className="font-medium text-gray-900">
                        {test.patientName}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {test.testName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {test.testType}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-600">
                        {test.doctorName}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-600">
                        {test.technicianName || 'Unassigned'}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div>Ordered: {new Date(test.orderedDate || test.createdAt).toLocaleDateString()}</div>
                        {test.completedDate && (
                          <div className="text-green-600">
                            Completed: {new Date(test.completedDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        test.status === 'completed' ? 'badge-success' :
                        test.status === 'in-progress' ? 'badge-warning' :
                        test.status === 'ordered' ? 'badge-info' :
                        'badge-danger'
                      }`}>
                        {test.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(test)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Edit Test"
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
              <TestTube className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lab test</h3>
              <p className="text-gray-500 mb-6">Add your first lab test.</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Add First Lab Test
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };