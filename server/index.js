const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Initialize app
const app = express();
const server = http.createServer(app);

// CORS configuration
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  console.log('Serving static files from:', path.join(__dirname, '../client/build'));
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Data storage (in-memory for this example)
let attendees = [];
let readyForCollection = [];
let missedNumbers = [];
let collectedNumbers = [];
let currentId = 1;

// Routes
app.post('/api/import', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Transform imported data
    attendees = data.map((row, index) => {
      return {
        id: currentId + index,
        queueNumber: row.QueueNumber || (currentId + index),
        name: row.Name,
        status: 'waiting', // waiting, ready, missed, collected
        timestamp: null
      };
    });

    currentId += attendees.length;
    
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
    
    // Emit update to all connected clients
    io.emit('attendeesUpdated', { attendees });
    
    res.status(200).json({ 
      message: 'File imported successfully', 
      count: attendees.length 
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Error importing file', error: error.message });
  }
});

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ status: 'success', message: 'Server is up and running', timestamp: new Date().toISOString() });
});

// Get all attendees
app.get('/api/attendees', (req, res) => {
  res.json(attendees);
});

// Reset all attendees
app.delete('/api/attendees/reset', (req, res) => {
  try {
    // Clear all data
    attendees = [];
    readyForCollection = [];
    missedNumbers = [];
    collectedNumbers = [];
    currentId = 1;

    // Emit updates to all connected clients
    io.emit('displayUpdated', { 
      readyForCollection, 
      missedNumbers 
    });
    
    io.emit('attendeesUpdated', { attendees });
    
    res.json({ message: 'All data has been reset successfully' });
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({ message: 'Error resetting data', error: error.message });
  }
});

// Add a new attendee
app.post('/api/attendees', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  
  const newAttendee = {
    id: currentId,
    queueNumber: currentId,
    name,
    status: 'waiting',
    timestamp: null
  };
  
  attendees.push(newAttendee);
  currentId++;
  
  io.emit('attendeesUpdated', { attendees });
  
  res.status(201).json(newAttendee);
});

// Mark attendee as ready for collection
app.put('/api/attendees/:id/ready', (req, res) => {
  const id = parseInt(req.params.id);
  const attendee = attendees.find(a => a.id === id);
  
  if (!attendee) {
    return res.status(404).json({ message: 'Attendee not found' });
  }
  
  attendee.status = 'ready';
  attendee.timestamp = Date.now();
  
  readyForCollection = readyForCollection.filter(num => num !== attendee.queueNumber);
  readyForCollection.push(attendee.queueNumber);
  
  io.emit('displayUpdated', { 
    readyForCollection, 
    missedNumbers 
  });
  
  io.emit('attendeesUpdated', { attendees });
  
  res.json(attendee);
});

// Mark attendee as collected
app.put('/api/attendees/:id/collected', (req, res) => {
  const id = parseInt(req.params.id);
  const attendee = attendees.find(a => a.id === id);
  
  if (!attendee) {
    return res.status(404).json({ message: 'Attendee not found' });
  }
  
  attendee.status = 'collected';
  attendee.timestamp = null;
  
  readyForCollection = readyForCollection.filter(num => num !== attendee.queueNumber);
  missedNumbers = missedNumbers.filter(num => num !== attendee.queueNumber);
  collectedNumbers.push(attendee.queueNumber);
  
  io.emit('displayUpdated', { 
    readyForCollection, 
    missedNumbers 
  });
  
  io.emit('attendeesUpdated', { attendees });
  
  res.json(attendee);
});

// Undo Ready for Collection status (return to waiting)
app.put('/api/attendees/:id/undo-ready', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`Received request to undo ready for ID: ${id}`);
  
  try {
    const attendee = attendees.find(a => a.id === id);
    
    if (!attendee) {
      console.log(`Attendee with ID ${id} not found`);
      return res.status(404).json({ message: 'Attendee not found' });
    }
    
    console.log(`Found attendee: ${JSON.stringify(attendee)}`);
    
    // Only undo if status is ready or missed
    if (attendee.status === 'ready' || attendee.status === 'missed') {
      console.log(`Updating attendee ${id} status from ${attendee.status} to waiting`);
      attendee.status = 'waiting';
      attendee.timestamp = null;
      
      // Remove from the respective lists
      console.log(`Removing queue number ${attendee.queueNumber} from ready/missed lists`);
      readyForCollection = readyForCollection.filter(num => num !== attendee.queueNumber);
      missedNumbers = missedNumbers.filter(num => num !== attendee.queueNumber);
      
      // Emit updates
      io.emit('displayUpdated', { 
        readyForCollection, 
        missedNumbers 
      });
      
      io.emit('attendeesUpdated', { attendees });
      
      console.log(`Successfully undid ready/missed status for ID: ${id}`);
      return res.json(attendee);
    } else {
      console.log(`Cannot undo ready - attendee status is: ${attendee.status}`);
      return res.status(400).json({ 
        message: `Cannot undo ready status because attendee is in '${attendee.status}' status` 
      });
    }
  } catch (error) {
    console.error(`Error in undo-ready endpoint:`, error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Undo Collected status (return to ready)
app.put('/api/attendees/:id/undo-collected', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`Received request to undo collected for ID: ${id}`);
  
  try {
    const attendee = attendees.find(a => a.id === id);
    
    if (!attendee) {
      console.log(`Attendee with ID ${id} not found`);
      return res.status(404).json({ message: 'Attendee not found' });
    }
    
    console.log(`Found attendee: ${JSON.stringify(attendee)}`);
    
    // Only undo if status is collected
    if (attendee.status === 'collected') {
      console.log(`Updating attendee ${id} status from ${attendee.status} to ready`);
      attendee.status = 'ready';
      attendee.timestamp = Date.now(); // Reset the timestamp
      
      // Update the lists
      console.log(`Removing queue number ${attendee.queueNumber} from collected list`);
      collectedNumbers = collectedNumbers.filter(num => num !== attendee.queueNumber);
      
      console.log(`Adding queue number ${attendee.queueNumber} to ready list`);
      readyForCollection.push(attendee.queueNumber);
      
      // Emit updates
      io.emit('displayUpdated', { 
        readyForCollection, 
        missedNumbers 
      });
      
      io.emit('attendeesUpdated', { attendees });
      
      console.log(`Successfully undid collected status for ID: ${id}`);
      return res.json(attendee);
    } else {
      console.log(`Cannot undo collected - attendee status is: ${attendee.status}`);
      return res.status(400).json({ 
        message: `Cannot undo collected status because attendee is in '${attendee.status}' status` 
      });
    }
  } catch (error) {
    console.error(`Error in undo-collected endpoint:`, error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// WebSocket setup
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Send initial data to newly connected client
  socket.emit('displayUpdated', { 
    readyForCollection, 
    missedNumbers 
  });
  
  socket.emit('attendeesUpdated', { attendees });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Update attendee details (name and queue number)
app.put('/api/attendees/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`Received request to update attendee details for ID: ${id}`);
  const { name, queueNumber } = req.body;
  
  try {
    const attendee = attendees.find(a => a.id === id);
    
    if (!attendee) {
      console.log(`Attendee with ID ${id} not found`);
      return res.status(404).json({ message: 'Attendee not found' });
    }
    
    // Check if the queue number is already in use by another attendee
    if (queueNumber !== undefined && queueNumber !== attendee.queueNumber) {
      const queueExists = attendees.some(a => a.id !== id && a.queueNumber === queueNumber);
      if (queueExists) {
        return res.status(400).json({ message: 'Queue number already in use' });
      }
      
      // Update ready and missed lists if queue number changes
      if (attendee.status === 'ready') {
        readyForCollection = readyForCollection.filter(num => num !== attendee.queueNumber);
        readyForCollection.push(queueNumber);
      } else if (attendee.status === 'missed') {
        missedNumbers = missedNumbers.filter(num => num !== attendee.queueNumber);
        missedNumbers.push(queueNumber);
      } else if (attendee.status === 'collected') {
        collectedNumbers = collectedNumbers.filter(num => num !== attendee.queueNumber);
        collectedNumbers.push(queueNumber);
      }
      
      // Update the queue number
      attendee.queueNumber = queueNumber;
    }
    
    // Update the name if provided
    if (name !== undefined) {
      attendee.name = name;
    }
    
    // Emit updates
    io.emit('displayUpdated', { 
      readyForCollection, 
      missedNumbers 
    });
    
    io.emit('attendeesUpdated', { attendees });
    
    console.log(`Successfully updated attendee details for ID: ${id}`);
    return res.json(attendee);
  } catch (error) {
    console.error(`Error in update attendee endpoint:`, error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check for missed collections every minute
setInterval(() => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  
  attendees.forEach(attendee => {
    if (attendee.status === 'ready' && attendee.timestamp < fiveMinutesAgo) {
      attendee.status = 'missed';
      
      // Update the lists
      readyForCollection = readyForCollection.filter(num => num !== attendee.queueNumber);
      
      if (!missedNumbers.includes(attendee.queueNumber)) {
        missedNumbers.push(attendee.queueNumber);
      }
    }
  });
  
  io.emit('displayUpdated', { 
    readyForCollection, 
    missedNumbers 
  });
  
  io.emit('attendeesUpdated', { attendees });
}, 60 * 1000);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      console.log('Serving React app for path:', req.path);
      res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    }
  });
}

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export the Express API
module.exports = app; 