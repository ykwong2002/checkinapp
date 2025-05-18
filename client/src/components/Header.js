import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  useMediaQuery,
  useTheme,
  IconButton
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MonitorIcon from '@mui/icons-material/Monitor';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';
  const isDisplay = location.pathname === '/';

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <MeetingRoomIcon sx={{ mr: 1.5, fontSize: 32 }} />
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              Check-in Queue
            </Typography>
          </Box>
          
          <Box>
            {isMobile ? (
              // Mobile view - show icon buttons
              <>
                <IconButton 
                  color={isDisplay ? "secondary" : "inherit"} 
                  component={Link} 
                  to="/"
                  sx={{ 
                    ml: 1,
                    bgcolor: isDisplay ? 'rgba(255,255,255,0.15)' : 'transparent' 
                  }}
                >
                  <MonitorIcon />
                </IconButton>
                <IconButton 
                  color={isAdmin ? "secondary" : "inherit"} 
                  component={Link} 
                  to="/admin"
                  sx={{ 
                    ml: 1,
                    bgcolor: isAdmin ? 'rgba(255,255,255,0.15)' : 'transparent' 
                  }}
                >
                  <AdminPanelSettingsIcon />
                </IconButton>
              </>
            ) : (
              // Desktop view - show text buttons
              <>
                <Button 
                  color={isDisplay ? "secondary" : "inherit"} 
                  component={Link} 
                  to="/"
                  startIcon={<MonitorIcon />}
                  variant={isDisplay ? "contained" : "text"}
                  sx={{ 
                    mr: 1,
                    bgcolor: isDisplay ? 'rgba(255,255,255,0.15)' : 'transparent',
                    '&:hover': {
                      bgcolor: isDisplay ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'
                    }
                  }}
                >
                  Display Screen
                </Button>
                <Button 
                  color={isAdmin ? "secondary" : "inherit"} 
                  component={Link} 
                  to="/admin"
                  startIcon={<AdminPanelSettingsIcon />}
                  variant={isAdmin ? "contained" : "text"}
                  sx={{ 
                    bgcolor: isAdmin ? 'rgba(255,255,255,0.15)' : 'transparent',
                    '&:hover': {
                      bgcolor: isAdmin ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'
                    }
                  }}
                >
                  Admin
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 