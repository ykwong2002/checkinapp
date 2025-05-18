import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Container,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HotelIcon from '@mui/icons-material/Hotel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UndoIcon from '@mui/icons-material/Undo';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import axios from 'axios';
import io from 'socket.io-client';

// Backend API URL - using direct values instead of environment variables
const API_URL = 'http://localhost:5001/api';
const socket = io('http://localhost:5001');

const Admin = () => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newAttendeeName, setNewAttendeeName] = useState('');
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'info' });
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    waiting: 0,
    ready: 0,
    missed: 0,
    collected: 0
  });

  useEffect(() => {
    // Fetch attendees when component mounts
    fetchAttendees();

    // Listen for real-time updates
    socket.on('attendeesUpdated', (data) => {
      if (data.attendees) {
        setAttendees(data.attendees);
        updateStats(data.attendees);
      }
    });

    // Clean up on unmount
    return () => {
      socket.off('attendeesUpdated');
    };
  }, []);
  
  const updateStats = (attendeesList) => {
    const newStats = {
      total: attendeesList.length,
      waiting: attendeesList.filter(a => a.status === 'waiting').length,
      ready: attendeesList.filter(a => a.status === 'ready').length,
      missed: attendeesList.filter(a => a.status === 'missed').length,
      collected: attendeesList.filter(a => a.status === 'collected').length
    };
    setStats(newStats);
  };

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/attendees`);
      setAttendees(response.data);
      updateStats(response.data);
    } catch (error) {
      console.error('Error fetching attendees:', error);
      showAlert('Failed to load attendees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttendee = async () => {
    if (!newAttendeeName.trim()) {
      showAlert('Name is required', 'error');
      return;
    }

    try {
      await axios.post(`${API_URL}/attendees`, { name: newAttendeeName });
      setNewAttendeeName('');
      setOpenAddDialog(false);
      showAlert('Attendee added successfully', 'success');
    } catch (error) {
      console.error('Error adding attendee:', error);
      showAlert('Failed to add attendee', 'error');
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      showAlert('Please select a file', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_URL}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setOpenUploadDialog(false);
      setSelectedFile(null);
      showAlert(`Successfully imported ${response.data.count} attendees`, 'success');
    } catch (error) {
      console.error('Error uploading file:', error);
      showAlert('Failed to import attendees', 'error');
    }
  };

  const handleMarkReady = async (id) => {
    try {
      console.log(`Attempting to mark attendee ${id} as ready`);
      const response = await axios.put(`${API_URL}/attendees/${id}/ready`);
      console.log('Mark ready response:', response.data);
      showAlert('Marked as ready for collection', 'success');
    } catch (error) {
      console.error('Error marking as ready:', error);
      showAlert('Failed to update status', 'error');
    }
  };

  const handleMarkCollected = async (id) => {
    try {
      console.log(`Attempting to mark attendee ${id} as collected`);
      const response = await axios.put(`${API_URL}/attendees/${id}/collected`);
      console.log('Mark collected response:', response.data);
      showAlert('Marked as collected', 'success');
    } catch (error) {
      console.error('Error marking as collected:', error);
      showAlert('Failed to update status', 'error');
    }
  };

  const handleUndoReady = async (id) => {
    try {
      console.log(`Attempting to undo ready status for attendee with ID: ${id}`);
      const response = await axios.put(`${API_URL}/attendees/${id}/undo-ready`);
      console.log('Undo ready response:', response.data);
      showAlert('Undid ready status', 'success');
    } catch (error) {
      console.error('Error undoing ready status:', error);
      if (error.response) {
        // Server responded with a status code outside of 2xx range
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        showAlert(`Failed to undo: ${error.response.data.message || 'Server error'}`, 'error');
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        showAlert('Server did not respond. Please check if server is running.', 'error');
      } else {
        // Something happened in setting up the request
        console.error('Error message:', error.message);
        showAlert(`Request error: ${error.message}`, 'error');
      }
    }
  };

  const handleUndoCollected = async (id) => {
    try {
      console.log(`Attempting to undo collected status for attendee with ID: ${id}`);
      const response = await axios.put(`${API_URL}/attendees/${id}/undo-collected`);
      console.log('Undo collected response:', response.data);
      showAlert('Undid collected status', 'success');
    } catch (error) {
      console.error('Error undoing collected status:', error);
      if (error.response) {
        // Server responded with a status code outside of 2xx range
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        showAlert(`Failed to undo: ${error.response.data.message || 'Server error'}`, 'error');
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        showAlert('Server did not respond. Please check if server is running.', 'error');
      } else {
        // Something happened in setting up the request
        console.error('Error message:', error.message);
        showAlert(`Request error: ${error.message}`, 'error');
      }
    }
  };

  const showAlert = (message, severity) => {
    setAlertInfo({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseAlert = () => {
    setAlertInfo({ ...alertInfo, open: false });
  };

  // Enhanced columns with better styling
  const columns = [
    { 
      field: 'queueNumber', 
      headerName: 'Queue Number', 
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body1" fontWeight="medium">
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'name', 
      headerName: 'Attendee Name', 
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body1">
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const statusColors = {
          waiting: {
            bgcolor: 'info.main',
            icon: <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
          },
          ready: {
            bgcolor: 'success.main',
            icon: <HotelIcon fontSize="small" sx={{ mr: 0.5 }} />
          },
          missed: {
            bgcolor: 'error.main',
            icon: <UndoIcon fontSize="small" sx={{ mr: 0.5 }} />
          },
          collected: {
            bgcolor: 'text.disabled',
            icon: <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
          }
        };
        
        const status = params.value;
        const statusConfig = statusColors[status] || statusColors.waiting;
        
        return (
          <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            color={status === 'waiting' ? 'info' :
                   status === 'ready' ? 'success' :
                   status === 'missed' ? 'error' : 'default'}
            size="small"
            icon={statusConfig.icon}
            sx={{ 
              fontWeight: 'medium',
              minWidth: '100px'
            }}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const { status, id } = params.row;
        
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {status === 'waiting' && (
              <Button
                variant="outlined"
                startIcon={<HotelIcon />}
                size="small"
                color="primary"
                onClick={() => handleMarkReady(id)}
              >
                Ready
              </Button>
            )}
            
            {(status === 'ready' || status === 'missed') && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CheckCircleOutlineIcon />}
                  size="small"
                  color="success"
                  onClick={() => handleMarkCollected(id)}
                >
                  Collected
                </Button>
                <Tooltip title="Undo Ready Status">
                  <IconButton 
                    size="small" 
                    color="warning"
                    onClick={() => handleUndoReady(id)}
                  >
                    <UndoIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            
            {status === 'collected' && (
              <Tooltip title="Undo Collected Status">
                <IconButton 
                  size="small" 
                  color="warning"
                  onClick={() => handleUndoCollected(id)}
                >
                  <UndoIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
          <DashboardIcon sx={{ mr: 1, mb: -0.5 }} />
          Check-in Admin Panel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage attendees and queue status for the check-in process
        </Typography>
      </Box>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleAltIcon color="primary" sx={{ mr: 1, fontSize: 24 }} />
                <Typography variant="h6" color="text.secondary">
                  Total Attendees
                </Typography>
              </Box>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon color="info" sx={{ mr: 1, fontSize: 24 }} />
                <Typography variant="h6" color="text.secondary">
                  Waiting
                </Typography>
              </Box>
              <Typography variant="h3" color="info.main" fontWeight="bold">
                {stats.waiting}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HotelIcon color="success" sx={{ mr: 1, fontSize: 24 }} />
                <Typography variant="h6" color="text.secondary">
                  Ready / Missed
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} alignItems="baseline">
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {stats.ready}
                </Typography>
                <Typography variant="h5" color="error.main" fontWeight="bold">
                  {stats.missed}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleOutlineIcon color="success" sx={{ mr: 1, fontSize: 24 }} />
                <Typography variant="h6" color="text.secondary">
                  Collected
                </Typography>
              </Box>
              <Typography variant="h3" color="text.secondary" fontWeight="bold">
                {stats.collected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Card sx={{ mb: 4 }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2
        }}>
          <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
            <MeetingRoomIcon sx={{ mr: 1 }} />
            Attendee Management
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<PersonAddIcon />} 
              onClick={() => setOpenAddDialog(true)}
            >
              Add Attendee
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<CloudUploadIcon />} 
              onClick={() => setOpenUploadDialog(true)}
            >
              Import from Spreadsheet
            </Button>
          </Box>
        </Box>
        
        <Divider />
        
        <Box sx={{ height: 600, width: '100%', p: 2 }}>
          <DataGrid
            rows={attendees}
            columns={columns}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
              sorting: {
                sortModel: [{ field: 'queueNumber', sort: 'asc' }],
              },
            }}
            loading={loading}
            autoHeight
            disableRowSelectionOnClick
            getRowClassName={(params) => 
              params.row.status === 'ready' ? 'ready-row' : 
              params.row.status === 'missed' ? 'missed-row' : ''
            }
            sx={{
              '& .ready-row': {
                backgroundColor: 'rgba(76, 175, 80, 0.08)',
              },
              '& .missed-row': {
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
              },
            }}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </Box>
      </Card>

      {/* Add Attendee Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonAddIcon sx={{ mr: 1 }} />
            Add New Attendee
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Attendee Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newAttendeeName}
            onChange={(e) => setNewAttendeeName(e.target.value)}
            sx={{ mt: 2, minWidth: '300px' }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenAddDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAddAttendee} variant="contained">Add Attendee</Button>
        </DialogActions>
      </Dialog>

      {/* Import Spreadsheet Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CloudUploadIcon sx={{ mr: 1 }} />
            Import Attendees from Spreadsheet
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: 1 }}>
            Upload an Excel spreadsheet with columns: "Name" and optionally "QueueNumber".
          </Typography>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 2, py: 1.5 }}
          >
            Select File
            <input
              type="file"
              hidden
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
          </Button>
          {selectedFile && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                Selected: {selectedFile.name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenUploadDialog(false)} variant="outlined">Cancel</Button>
          <Button 
            onClick={handleUploadFile} 
            variant="contained" 
            disabled={!selectedFile}
            startIcon={<CloudUploadIcon />}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alertInfo.open}
        autoHideDuration={5000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alertInfo.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertInfo.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Admin; 