# Task Management App

A modern task management application built with React, TypeScript, and Supabase.

## Features

- 🎯 **Task Management**: Create, edit, delete tasks
- 📋 **Sprint Organization**: Organize tasks by sprints
- 🌳 **Hierarchical Tasks**: Parent-child task relationships
- ⏱️ **Time Tracking**: Estimated hours for tasks
- 📊 **Real-time Updates**: Live data synchronization
- 🔐 **Authentication**: Secure user authentication
- 📱 **Responsive Design**: Works on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **State Management**: Redux Toolkit
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Material-UI (MUI)
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Onurapple2000/task-management-app.git
cd task-management-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your Supabase credentials in `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Database Setup

1. Create a new Supabase project
2. Run the SQL commands from `database-schema.sql` in your Supabase SQL editor
3. Enable Row Level Security (RLS) policies as defined in the schema

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout component
│   ├── TaskTree.tsx    # Task tree visualization
│   ├── TaskForm.tsx    # Task creation/editing form
│   └── SprintList.tsx  # Sprint management
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Login.tsx       # Authentication
│   └── Register.tsx    # User registration
├── store/              # Redux store
│   ├── index.ts        # Store configuration
│   └── slices/         # Redux slices
├── hooks/              # Custom React hooks
├── config/             # Configuration files
└── theme/              # Material-UI theme
```

## Features in Detail

### Task Management
- Create tasks with descriptions, estimated hours, and status
- Organize tasks in hierarchical structure (parent-child relationships)
- Track task progress with status updates
- Assign tasks to sprints

### Sprint Management
- Create and manage sprints
- Filter tasks by sprint
- Track sprint progress

### Authentication
- User registration and login
- Secure session management
- Protected routes

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Author

**Onur Apple**
- GitHub: [@Onurapple2000](https://github.com/Onurapple2000)

## Acknowledgments

- Material-UI for the component library
- Supabase for the backend infrastructure
- React team for the amazing framework
