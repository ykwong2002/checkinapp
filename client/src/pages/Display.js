import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  Divider, 
  Container, 
  Grid,
  Card,
  CardContent,
  Fade,
  Zoom
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import io from 'socket.io-client';
import config from '../config';

// Update socket connection
const socket = io(config.SOCKET_URL, {
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

const Display = () => {
  const [readyNumbers, setReadyNumbers] = useState([]);
  const [missedNumbers, setMissedNumbers] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update the time every minute
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Listen for updates from the server
    socket.on('displayUpdated', (data) => {
      setReadyNumbers(data.readyForCollection || []);
      setMissedNumbers(data.missedNumbers || []);
    });

    // Clean up on unmount
    return () => {
      socket.off('displayUpdated');
      clearInterval(intervalId);
    };
  }, []);

  // Format the current time
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          mb: 3 
        }}
      >
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {formattedDate}
        </Typography>
        <Typography variant="h2" fontWeight="bold" color="primary.main">
          {formattedTime}
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          backgroundColor: theme => theme.palette.primary.main, 
          color: 'white',
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mb: 4 
          }}
        >
          <MeetingRoomIcon sx={{ fontSize: 40, mr: 2 }} />
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              fontWeight: 700,
              letterSpacing: 1 
            }}
          >
            Ready for Collection
          </Typography>
        </Box>
        
        <Grid 
          container 
          spacing={3} 
          justifyContent="center"
          sx={{ flex: 1 }}
        >
          {readyNumbers.length > 0 ? (
            readyNumbers.map((number) => (
              <Grid item key={number}>
                <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                  <Card 
                    sx={{ 
                      bgcolor: theme => theme.palette.success.main, 
                      minWidth: { xs: '90px', sm: '110px', md: '130px' },
                      height: { xs: '90px', sm: '110px', md: '130px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    <CardContent sx={{ p: 1 }}>
                      <Typography 
                        variant="h3" 
                        align="center" 
                        fontWeight="bold"
                        sx={{ 
                          color: 'white',
                          fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                          lineHeight: 1
                        }}
                      >
                        {number}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '200px' 
              }}>
                <Typography variant="h4" color="rgba(255,255,255,0.7)" sx={{ fontStyle: 'italic' }}>
                  No queue numbers ready for collection
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
        
        {missedNumbers.length > 0 && (
          <Fade in={true}>
            <Box sx={{ mt: 6 }}>
              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 3 
              }}>
                <DoNotDisturbIcon sx={{ fontSize: 32, mr: 2, color: theme => theme.palette.error.light }} />
                <Typography variant="h4" gutterBottom fontWeight="bold" color={theme => theme.palette.error.light}>
                  Missed Queue
                </Typography>
              </Box>
              
              <Grid container spacing={2} justifyContent="center">
                {missedNumbers.map((number) => (
                  <Grid item key={number}>
                    <Card 
                      sx={{ 
                        bgcolor: theme => theme.palette.error.main, 
                        py: 1.5,
                        px: 3,
                        minWidth: '80px',
                        borderRadius: 2,
                      }}
                    >
                      <Typography 
                        variant="h5" 
                        fontWeight="bold" 
                        align="center"
                        color="white"
                      >
                        {number}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Fade>
        )}
      </Paper>
    </Container>
  );
};

export default Display; 