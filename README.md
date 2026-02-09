# Sanago Desktop - Healthcare Management System

A comprehensive desktop application for healthcare facilities, built with Electron, React, and TypeScript. Sanago provides role-based access control for administrators, doctors, receptionists, pharmacists, and lab technicians, streamlining daily operations and patient management.

## Features

### 📊 Admin Module
- **Dashboard Overview**: Real-time analytics and key performance indicators
- **User Management**: Create, update, and manage user accounts with role-based permissions
- **Shift Management**: Schedule and track staff shifts
- **Revenue Dashboard**: Financial reporting and revenue tracking
- **User Activities**: Audit logs and activity tracking
- **Settings**: System configuration and preferences

### 🩺 Doctor Module
- **Patient Management**: Complete patient profiles with medical history
- **Appointments**: Schedule, view, and manage patient appointments
- **Consultations**: Record patient consultations and medical notes
- **Lab Requests**: Order and track laboratory tests
- **Consultation Details**: Detailed view of patient encounters

### 🏥 Reception Module
- **Patient Registration**: Register new patients and manage existing records
- **Appointment Booking**: Schedule patient appointments with doctors
- **Patient Admissions**: Manage patient admissions and discharge processes
- **Admission History**: Track patient admission records
- **Patient Management**: View and update patient information

### 💊 Pharmacist Module
- **Drug Management**: Add, update, and manage medication inventory
- **Dispense Medications**: Process medication prescriptions
- **Sales Reports**: Track medication sales and inventory levels
- **Feedback System**: Collect and manage patient feedback

### 🧪 Lab Technician Module
- **Lab Dashboard**: Monitor lab operations and pending requests
- **Lab Requests Queue**: View and process pending lab test requests
- **Results Management**: Enter and review lab test results
- **Test Management**: Create and manage lab test types
- **Results History**: Access historical lab test results

## Technologies Used

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router DOM** - Client-side routing
- **Sonner** - Toast notifications
- **Lucide React** - Icon library
- **Chart.js** - Data visualization

### Backend & Database
- **RxDB** - Local database for offline sync
- **Dexie** - IndexedDB wrapper
- **Axios** - HTTP client
- **Laravel Echo** - Real-time communication
- **Pusher** - WebSocket integration

### Desktop Application
- **Electron** - Cross-platform desktop framework
- **Electron Store** - Persistent storage
- **Vite** - Build tool and dev server

### Development Tools
- **ESLint** - Code linting
- **i18next** - Internationalization
- **Date-fns** - Date manipulation

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Clone the Repository
```bash
git clone [repository-url]
cd sanago-desktop
```

### Install Dependencies
```bash
npm install
```

## Usage

### Development
```bash
npm run electron:dev
```

This will start the development server with hot reload.

### Build
#### Linux
```bash
npm run build:linux
```

#### Windows (64-bit)
```bash
npm run build:win:64
```

#### Windows (32-bit)
```bash
npm run build:win:32
```

#### Windows Portable
```bash
npm run build:win:portable
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
sanago-desktop/
├── build/                    # Build configuration files
├── dist-electron/           # Electron build output
├── dist/                     # React build output
├── public/                   # Static assets
├── release/                  # Release packages
├── src/                      # Source code
│   ├── components/          # Reusable UI components
│   ├── db/                  # Database configuration
│   ├── hooks/               # Custom React hooks
│   ├── layouts/             # Page layouts for different roles
│   ├── locales/             # Translation files
│   ├── Pages/               # Application pages
│   ├── providers/           # React context providers
│   ├── routes/              # Route definitions
│   ├── services/            # API and business logic
│   ├── utils/               # Utility functions
│   ├── App.css              # Global styles
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # React entry point
│   └── index.css            # Tailwind CSS imports
├── index.html               # HTML entry point
├── main.ts                  # Electron main process
├── preload.js               # Electron preload script
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Key Features & Highlights

### Offline Support
- Local database with RxDB for offline operation
- Automatic sync with server when online
- Conflict resolution mechanisms

### Real-time Communication
- WebSocket integration with Laravel Echo and Pusher
- Real-time notifications for new appointments, lab requests, etc.

### Role-based Access Control
- Secure authentication and authorization
- Different modules accessible based on user roles
- Protected routes with permission checks

### Modern UI/UX
- Dark/light theme support
- Responsive design for desktop
- Smooth animations and transitions
- Context menu and breadcrumb navigation

### Data Visualization
- Interactive charts and graphs
- Dashboard analytics
- Real-time metrics and KPIs

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_URL=https://api.sanago.com
VITE_PUSHER_APP_KEY=your-pusher-key
VITE_PUSHER_APP_CLUSTER=your-pusher-cluster
```

### Database
The application uses RxDB with Dexie for local storage and sync. Database configuration can be found in `src/db/database.ts`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run tests
6. Submit a pull request

## License

This project is licensed under the [MIT License](LICENSE).

## Authors

- **Sanago Healthcare** - Initial development

## Support

For support, please email us at info@sanago.com or create an issue in the repository.

## Recent Updates

### Version 0.0.1 (Current)
- Initial release of Sanago Desktop
- Complete role-based module structure
- Offline support with RxDB
- Real-time communication via Pusher
- Dark/light theme support
- Responsive UI design

---

**Sanago Desktop** - Empowering healthcare facilities with modern management solutions.
