This is a full-stack web application that simulates a complete drone fleet management system. It allows users to create, monitor, and control multiple drones performing survey missions. The system features real-time tracking on an interactive map, mission state management, battery consumption simulation, and automatic drone movement logic. It demonstrates skills in real-time applications, WebSockets, mapping libraries, and full-stack development.

Key Features

- Real-time drone position tracking and updates
- Mission lifecycle management (Pending, Active, Completed, Aborted)
- Interactive map visualization with mission paths
- Battery drain simulation and low-battery handling
- Automatic drone movement and mission completion logic
- Responsive dashboard for managing multiple drones

Tech Stack

- **Frontend**: React.js, Leaflet.js, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO, SQLite
- **Others**: REST APIs, Real-time synchronization

Setup Instructions
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in new terminal)
cd frontend/frontend
npm install
npm start
