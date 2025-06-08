const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple Blockchain Implementation
class Block {
  constructor(index, timestamp, data, previousHash) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data))
      .digest('hex');
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), "Genesis Block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  addTransaction(transaction) {
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      transaction,
      this.getLatestBlock().hash
    );
    this.addBlock(newBlock);
  }

  getChain() {
    return this.chain;
  }
}

// Initialize blockchain
const hmsBlockchain = new Blockchain();

// In-memory storage (use database in production)
let patients = [];
let doctors = [];
let appointments = [];
let medicalRecords = [];
let technicians = [];
let labTests = [];
let surgeries = [];
let admissions = [];
let bills = [];
let medicines = [];
let equipment = [];
let emergencies = [];
let inventory = []; // Additional feature
let rooms = []; // Additional feature

// Helper function to generate ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Patients
app.get('/api/patients', (req, res) => {
  res.json(patients);
});

app.post('/api/patients', (req, res) => {
  const patient = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  patients.push(patient);
  
  // Add to blockchain
  hmsBlockchain.addTransaction({
    type: 'PATIENT_REGISTERED',
    patientId: patient.id,
    data: patient,
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json(patient);
});

app.get('/api/patients/:id', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json(patient);
});

app.put('/api/patients/:id', (req, res) => {
  const index = patients.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  
  patients[index] = { ...patients[index], ...req.body, updatedAt: new Date().toISOString() };
  
  // Add to blockchain
  hmsBlockchain.addTransaction({
    type: 'PATIENT_UPDATED',
    patientId: req.params.id,
    data: patients[index],
    timestamp: new Date().toISOString()
  });
  
  res.json(patients[index]);
});

// Doctors
app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

app.post('/api/doctors', (req, res) => {
  const doctor = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  doctors.push(doctor);
  
  // Add to blockchain
  hmsBlockchain.addTransaction({
    type: 'DOCTOR_REGISTERED',
    doctorId: doctor.id,
    data: doctor,
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json(doctor);
});

// Appointments
app.get('/api/appointments', (req, res) => {
  const appointmentsWithDetails = appointments.map(apt => {
    const patient = patients.find(p => p.id === apt.patientId);
    const doctor = doctors.find(d => d.id === apt.doctorId);
    return {
      ...apt,
      patientName: patient ? patient.name : 'Unknown',
      doctorName: doctor ? doctor.name : 'Unknown'
    };
  });
  res.json(appointmentsWithDetails);
});

app.post('/api/appointments', (req, res) => {
  const appointment = {
    id: generateId(),
    ...req.body,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };
  
  appointments.push(appointment);
  
  // Add to blockchain
  hmsBlockchain.addTransaction({
    type: 'APPOINTMENT_SCHEDULED',
    appointmentId: appointment.id,
    data: appointment,
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json(appointment);
});

app.put('/api/appointments/:id', (req, res) => {
  const index = appointments.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  
  appointments[index] = { ...appointments[index], ...req.body, updatedAt: new Date().toISOString() };
  
  // Add to blockchain
  hmsBlockchain.addTransaction({
    type: 'APPOINTMENT_UPDATED',
    appointmentId: req.params.id,
    data: appointments[index],
    timestamp: new Date().toISOString()
  });
  
  res.json(appointments[index]);
});

// Medical Records
app.get('/api/medical-records', (req, res) => {
  const { patientId } = req.query;
  let records = medicalRecords;
  
  if (patientId) {
    records = records.filter(r => r.patientId === patientId);
  }
  
  const recordsWithDetails = records.map(record => {
    const patient = patients.find(p => p.id === record.patientId);
    const doctor = doctors.find(d => d.id === record.doctorId);
    return {
      ...record,
      patientName: patient ? patient.name : 'Unknown',
      doctorName: doctor ? doctor.name : 'Unknown'
    };
  });
  
  res.json(recordsWithDetails);
});

app.post('/api/medical-records', (req, res) => {
  const record = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  medicalRecords.push(record);
  
  // Add to blockchain
  hmsBlockchain.addTransaction({
    type: 'MEDICAL_RECORD_CREATED',
    recordId: record.id,
    data: record,
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json(record);
});

// TECHNICIANS
app.get('/api/technicians', (req, res) => {
  res.json(technicians);
});

app.post('/api/technicians', (req, res) => {
  const technician = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  technicians.push(technician);
  
  hmsBlockchain.addTransaction({
    type: 'TECHNICIAN_REGISTERED',
    technicianId: technician.id,
    data: technician,
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json(technician);
});

app.put('/api/technicians/:id', (req, res) => {
  const index = technicians.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Technician not found' });
  }
  
  technicians[index] = { ...technicians[index], ...req.body, updatedAt: new Date().toISOString() };
  
  hmsBlockchain.addTransaction({
    type: 'TECHNICIAN_UPDATED',
    technicianId: req.params.id,
    data: technicians[index],
    timestamp: new Date().toISOString()
  });
  
  res.json(technicians[index]);
});

// LAB TESTS
app.get('/api/lab-tests', (req, res) => {
  const { patientId } = req.query;
  let tests = labTests;
  
  if (patientId) {
    tests = tests.filter(t => t.patientId === patientId);
  }
  
  const testsWithDetails = tests.map(test => {
    const patient = patients.find(p => p.id === test.patientId);
    const doctor = doctors.find(d => d.id === test.doctorId);
    const technician = technicians.find(t => t.id === test.technicianId);
    return {
      ...test,
      patientName: patient ? patient.name : 'Unknown',
      doctorName: doctor ? doctor.name : 'Unknown',
      technicianName: technician ? technician.name : 'Unassigned'
    };
  });
  
  res.json(testsWithDetails);
});

app.post('/api/lab-tests', (req, res) => {
  const labTest = {
    id: generateId(),
    ...req.body,
    status: 'ordered',
    createdAt: new Date().toISOString()
  };
  
  labTests.push(labTest);
  
  hmsBlockchain.addTransaction({
    type: 'LAB_TEST_ORDERED',
    testId: labTest.id,
    data: labTest,
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json(labTest);
});

app.put('/api/lab-tests/:id', (req, res) => {
  const index = labTests.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Lab test not found' });
  }
  
  labTests[index] = { ...labTests[index], ...req.body, updatedAt: new Date().toISOString() };
  
  hmsBlockchain.addTransaction({
    type: 'LAB_TEST_UPDATED',
    testId: req.params.id,
    data: labTests[index],
    timestamp: new Date().toISOString()
  });
  
  res.json(labTests[index]);
});

// SURGERIES
app.get('/api/surgeries', (req, res) => {
  const surgeriesWithDetails = surgeries.map(surgery => {
    const patient = patients.find(p => p.id === surgery.patientId);
    const doctor = doctors.find(d => d.id === surgery.surgeonId);
    return {
      ...surgery,
      patientName: patient ? patient.name : 'Unknown',
      surgeonName: doctor ? doctor.name : 'Unknown'
    };
  });
  res.json(surgeriesWithDetails);
});

app.post('/api/surgeries', (req, res) => {
  const surgery = {
    id: generateId(),
    ...req.body,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };
  
  surgeries.push(surgery);
  
  hmsBlockchain.addTransaction({
    type: 'SURGERY_SCHEDULED',
    surgeryId: surgery.id,
    data: surgery,
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json(surgery);
});

app.put('/api/surgeries/:id', (req, res) => {
  const index = surgeries.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Surgery not found' });
  }
  
  surgeries[index] = { ...surgeries[index], ...req.body, updatedAt: new Date().toISOString() };
  
  hmsBlockchain.addTransaction({
    type: 'SURGERY_UPDATED',
    surgeryId: req.params.id,
    data: surgeries[index],
    timestamp: new Date().toISOString()
  });
  
  res.json(surgeries[index]);
});

// ADMISSIONS
app.get('/api/admissions', (req, res) => {
  const admissionsWithDetails = admissions.map(admission => {
    const patient = patients.find(p => p.id === admission.patientId);
    const doctor = doctors.find(d => d.id === admission.doctorId);
    const room = rooms.find(r => r.id === admission.roomId);
    return {
      ...admission,
      patientName: patient ? patient.name : 'Unknown',
      doctorName: doctor ? doctor.name : 'Unknown',
      roomNumber: room ? room.number : 'Unassigned'
    };
  });
  res.json(admissionsWithDetails);
});

app.post('/api/admissions', (req, res) => {
  const admission = {
    id: generateId(),
    ...req.body,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  admissions.push(admission);
  
  // Update room status if roomId provided
  if (admission.roomId) {
    const roomIndex = rooms.findIndex(r => r.id === admission.roomId);
    if (roomIndex !== -1) {
      rooms[roomIndex].status = 'occupied';
    }
  }
  
  hmsBlockchain.addTransaction({
    type: 'PATIENT_ADMITTED',
    admissionId: admission.id,
    data: admission,
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json(admission);
});

app.put('/api/admissions/:id', (req, res) => {
  const index = admissions.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Admission not found' });
  }
  
  const oldAdmission = { ...admissions[index] };
  admissions[index] = { ...admissions[index], ...req.body, updatedAt: new Date().toISOString() };
  
  // Handle room status changes
  if (req.body.status === 'discharged' && oldAdmission.roomId) {
    const roomIndex = rooms.findIndex(r => r.id === oldAdmission.roomId);
    if (roomIndex !== -1) {
      rooms[roomIndex].status = 'available';
    }
  }
  
  hmsBlockchain.addTransaction({
    type: 'ADMISSION_UPDATED',
    admissionId: req.params.id,
    data: admissions[index],
    timestamp: new Date().toISOString()
  });
  
  res.json(admissions[index]);
});

// BILLS
app.get('/api/bills', (req, res) => {
  const { patientId } = req.query;
  let billList = bills;
  
  if (patientId) {
    billList = billList.filter(b => b.patientId === patientId);
  }
  
  const billsWithDetails = billList.map(bill => {
    const patient = patients.find(p => p.id === bill.patientId);
    return {
      ...bill,
      patientName: patient ? patient.name : 'Unknown'
    };
  });
  
  res.json(billsWithDetails);
});

app.post('/api/bills', (req, res) => {
  const bill = {
    id: generateId(),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  bills.push(bill);
  
  hmsBlockchain.addTransaction({
    type: 'BILL_GENERATED',
    billId: bill.id,
    data: bill,
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json(bill);
});

app.put('/api/bills/:id', (req, res) => {
  const index = bills.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Bill not found' });
  }
  
  bills[index] = { ...bills[index], ...req.body, updatedAt: new Date().toISOString() };
  
  hmsBlockchain.addTransaction({
    type: 'BILL_UPDATED',
    billId: req.params.id,
    data: bills[index],
    timestamp: new Date().toISOString()
  });
  
  res.json(bills[index]);
});

// MEDICINES
app.get('/api/medicines', (req, res) => {
  res.json(medicines);
});

app.post('/api/medicines', (req, res) => {
  const medicine = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  medicines.push(medicine);
  
  hmsBlockchain.addTransaction({
    type: 'MEDICINE_ADDED',
    medicineId: medicine.id,
    data: medicine,
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json(medicine);
});

app.put('/api/medicines/:id', (req, res) => {
  const index = medicines.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Medicine not found' });
  }
  
  medicines[index] = { ...medicines[index], ...req.body, updatedAt: new Date().toISOString() };
  
  hmsBlockchain.addTransaction({
    type: 'MEDICINE_UPDATED',
    medicineId: req.params.id,
    data: medicines[index],
    timestamp: new Date().toISOString()
  });
  
  res.json(medicines[index]);
});

// EQUIPMENT
app.get('/api/equipment', (req, res) => {
  res.json(equipment);
});

app.post('/api/equipment', (req, res) => {
  const equipmentItem = {
    id: generateId(),
    ...req.body,
    status: 'available',
    createdAt: new Date().toISOString()
  };
  
  equipment.push(equipmentItem);
  
  hmsBlockchain.addTransaction({
    type: 'EQUIPMENT_ADDED',
    equipmentId: equipmentItem.id,
    data: equipmentItem,
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json(equipmentItem);
});

app.put('/api/equipment/:id', (req, res) => {
  const index = equipment.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Equipment not found' });
  }
  
  equipment[index] = { ...equipment[index], ...req.body, updatedAt: new Date().toISOString() };
  
  hmsBlockchain.addTransaction({
    type: 'EQUIPMENT_UPDATED',
    equipmentId: req.params.id,
    data: equipment[index],
    timestamp: new Date().toISOString()
  });
  
  res.json(equipment[index]);
});

// EMERGENCIES
app.get('/api/emergencies', (req, res) => {
  const emergenciesWithDetails = emergencies.map(emergency => {
    const patient = patients.find(p => p.id === emergency.patientId);
    const doctor = doctors.find(d => d.id === emergency.doctorId);
    return {
      ...emergency,
      patientName: patient ? patient.name : 'Unknown',
      doctorName: doctor ? doctor.name : 'Unassigned'
    };
  });
  res.json(emergenciesWithDetails);
});

app.post('/api/emergencies', (req, res) => {
  const emergency = {
    id: generateId(),
    ...req.body,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  emergencies.push(emergency);
  
  hmsBlockchain.addTransaction({
    type: 'EMERGENCY_REPORTED',
    emergencyId: emergency.id,
    data: emergency,
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json(emergency);
});

app.put('/api/emergencies/:id', (req, res) => {
  const index = emergencies.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Emergency not found' });
  }
  
  emergencies[index] = { ...emergencies[index], ...req.body, updatedAt: new Date().toISOString() };
  
  hmsBlockchain.addTransaction({
    type: 'EMERGENCY_UPDATED',
    emergencyId: req.params.id,
    data: emergencies[index],
    timestamp: new Date().toISOString()
  });
  
  res.json(emergencies[index]);
});

// INVENTORY (Additional Feature)
app.get('/api/inventory', (req, res) => {
  res.json(inventory);
});

app.post('/api/inventory', (req, res) => {
  const inventoryItem = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  inventory.push(inventoryItem);
  
  hmsBlockchain.addTransaction({
    type: 'INVENTORY_ADDED',
    inventoryId: inventoryItem.id,
    data: inventoryItem,
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json(inventoryItem);
});

app.put('/api/inventory/:id', (req, res) => {
  const index = inventory.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Inventory item not found' });
  }
  
  inventory[index] = { ...inventory[index], ...req.body, updatedAt: new Date().toISOString() };
  
  hmsBlockchain.addTransaction({
    type: 'INVENTORY_UPDATED',
    inventoryId: req.params.id,
    data: inventory[index],
    timestamp: new Date().toISOString()
  });
  
  res.json(inventory[index]);
});

// ROOMS (Additional Feature)
app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

app.post('/api/rooms', (req, res) => {
  const room = {
    id: generateId(),
    ...req.body,
    status: 'available',
    createdAt: new Date().toISOString()
  };
  
  rooms.push(room);
  
  hmsBlockchain.addTransaction({
    type: 'ROOM_ADDED',
    roomId: room.id,
    data: room,
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json(room);
});

app.put('/api/rooms/:id', (req, res) => {
  const index = rooms.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  rooms[index] = { ...rooms[index], ...req.body, updatedAt: new Date().toISOString() };
  
  hmsBlockchain.addTransaction({
    type: 'ROOM_UPDATED',
    roomId: req.params.id,
    data: rooms[index],
    timestamp: new Date().toISOString()
  });
  
  res.json(rooms[index]);
});

// Blockchain endpoints
app.get('/api/blockchain', (req, res) => {
  res.json(hmsBlockchain.getChain());
});

app.get('/api/blockchain/verify', (req, res) => {
  const chain = hmsBlockchain.getChain();
  let isValid = true;
  
  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];
    
    if (currentBlock.hash !== currentBlock.calculateHash()) {
      isValid = false;
      break;
    }
    
    if (currentBlock.previousHash !== previousBlock.hash) {
      isValid = false;
      break;
    }
  }
  
  res.json({ isValid, blockCount: chain.length });
});

// Dashboard stats
app.get('/api/stats', (req, res) => {
  const stats = {
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    totalTechnicians: technicians.length,
    totalAppointments: appointments.length,
    totalMedicalRecords: medicalRecords.length,
    totalLabTests: labTests.length,
    totalSurgeries: surgeries.length,
    totalAdmissions: admissions.length,
    totalBills: bills.length,
    totalMedicines: medicines.length,
    totalEquipment: equipment.length,
    totalEmergencies: emergencies.length,
    totalInventoryItems: inventory.length,
    totalRooms: rooms.length,
    blockchainBlocks: hmsBlockchain.getChain().length,
    recentAppointments: appointments.slice(-5).map(apt => {
      const patient = patients.find(p => p.id === apt.patientId);
      const doctor = doctors.find(d => d.id === apt.doctorId);
      return {
        ...apt,
        patientName: patient ? patient.name : 'Unknown',
        doctorName: doctor ? doctor.name : 'Unknown'
      };
    }),
    activeEmergencies: emergencies.filter(e => e.status === 'active').length,
    pendingBills: bills.filter(b => b.status === 'pending').length,
    availableRooms: rooms.filter(r => r.status === 'available').length,
    occupiedRooms: rooms.filter(r => r.status === 'occupied').length
  };
  
  res.json(stats);
});

// Search endpoint (Additional Feature)
app.get('/api/search', (req, res) => {
  const { query, type } = req.query;
  let results = [];
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  const searchTerm = query.toLowerCase();
  
  if (!type || type === 'patients') {
    const patientResults = patients.filter(p => 
      p.name?.toLowerCase().includes(searchTerm) ||
      p.email?.toLowerCase().includes(searchTerm) ||
      p.phone?.includes(searchTerm)
    ).map(p => ({ ...p, type: 'patient' }));
    results = [...results, ...patientResults];
  }
  
  if (!type || type === 'doctors') {
    const doctorResults = doctors.filter(d => 
      d.name?.toLowerCase().includes(searchTerm) ||
      d.specialization?.toLowerCase().includes(searchTerm)
    ).map(d => ({ ...d, type: 'doctor' }));
    results = [...results, ...doctorResults];
  }
  
  if (!type || type === 'appointments') {
    const appointmentResults = appointments.filter(a => {
      const patient = patients.find(p => p.id === a.patientId);
      const doctor = doctors.find(d => d.id === a.doctorId);
      return patient?.name?.toLowerCase().includes(searchTerm) ||
             doctor?.name?.toLowerCase().includes(searchTerm);
    }).map(a => ({ ...a, type: 'appointment' }));
    results = [...results, ...appointmentResults];
  }
  
  res.json(results);
});

app.listen(PORT, () => {
  console.log(`HMS Backend Server running on port ${PORT}`);
  console.log(`Blockchain initialized with ${hmsBlockchain.getChain().length} blocks`);
});