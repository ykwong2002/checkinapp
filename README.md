# Check-in Queue Management System

A web application to manage hotel check-in queues for large events. This system helps event staff manage the check-in process efficiently by displaying ready-for-collection queue numbers on a large display screen, and allowing staff to manage attendees through a simple admin interface.

## Features

- **Real-time Display Screen**: Shows queue numbers that are ready for collection
- **Missed Numbers Section**: Automatically shows missed queue numbers after 5 minutes
- **Admin Panel**: Allows staff to:
  - Add attendees one by one
  - Import attendees from a spreadsheet (Excel/CSV)
  - Mark attendees as "Ready for Collection"
  - Mark attendees as "Collected"
  - View all attendees with their current status

## Tech Stack

- **Frontend**: React, Material-UI, Socket.io Client
- **Backend**: Node.js, Express, Socket.io
- **Data Storage**: In-memory (can be extended to use a database)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/checkinapp.git
cd checkinapp
```

2. Install dependencies for both server and client
```bash
npm run install-all
```

### Running the Application

Development mode:
```bash
npm run dev
```

This will start both the backend server and the frontend application.

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### Usage

1. **Display Screen**: Open http://localhost:3000 on a large display in the waiting room
2. **Admin Panel**: Open http://localhost:3000/admin on staff computers

### Spreadsheet Import Format

The import feature expects Excel or CSV files with the following columns:
- `Name` (required): The attendee's name
- `QueueNumber` (optional): A predefined queue number

If `QueueNumber` is not provided, the system will automatically assign sequential numbers.

## Deployment

To deploy for production:

1. Build the frontend
```bash
cd client
npm run build
```

2. Start the server in production mode
```bash
NODE_ENV=production npm start
```

The application will be available at http://localhost:5000

## License

MIT 