import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a535c',
      light: '#4ecdc4',
      dark: '#0e2b31',
      contrastText: '#fff',
    },
    secondary: {
      main: '#ff6b6b',
      light: '#ff9e9e',
      dark: '#c53b3b',
      contrastText: '#fff',
    },
    success: {
      main: '#4ecdc4',
      dark: '#38ada9',
    },
    error: {
      main: '#ff6b6b',
      dark: '#c53b3b',
    },
    warning: {
      main: '#ffe66d',
      dark: '#ffd900',
    },
    info: {
      main: '#6b7fd7',
      dark: '#5468c9',
    },
    background: {
      default: '#f7f9fc',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#636e72',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 6px rgba(0, 0, 0, 0.07)',
    '0px 6px 8px rgba(0, 0, 0, 0.08)',
    '0px 8px 12px rgba(0, 0, 0, 0.09)',
    '0px 10px 14px rgba(0, 0, 0, 0.1)',
    '0px 12px 16px rgba(0, 0, 0, 0.11)',
    '0px 14px 18px rgba(0, 0, 0, 0.12)',
    '0px 16px 20px rgba(0, 0, 0, 0.13)',
    '0px 18px 22px rgba(0, 0, 0, 0.14)',
    '0px 20px 24px rgba(0, 0, 0, 0.15)',
    '0px 22px 26px rgba(0, 0, 0, 0.16)',
    '0px 24px 28px rgba(0, 0, 0, 0.17)',
    '0px 26px 30px rgba(0, 0, 0, 0.18)',
    '0px 28px 32px rgba(0, 0, 0, 0.19)',
    '0px 30px 34px rgba(0, 0, 0, 0.2)',
    '0px 32px 36px rgba(0, 0, 0, 0.21)',
    '0px 34px 38px rgba(0, 0, 0, 0.22)',
    '0px 36px 40px rgba(0, 0, 0, 0.23)',
    '0px 38px 42px rgba(0, 0, 0, 0.24)',
    '0px 40px 44px rgba(0, 0, 0, 0.25)',
    '0px 42px 46px rgba(0, 0, 0, 0.26)',
    '0px 44px 48px rgba(0, 0, 0, 0.27)',
    '0px 46px 50px rgba(0, 0, 0, 0.28)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.07)',
          padding: '8px 20px',
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.09)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
        elevation1: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          borderRadius: 12,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme; 