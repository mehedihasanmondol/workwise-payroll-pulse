# Workforce Management System

A comprehensive employee management platform built with React, TypeScript, and Supabase. This system provides complete workforce administration capabilities including employee profiles, roster management, working hours tracking, payroll processing, and financial management.

## 🎯 Project Goal

This workforce management system aims to streamline business operations by providing:

- **Employee Profile Management**: Complete staff information, roles, and permissions
- **Roster Scheduling**: Create and assign work schedules with multiple employees
- **Time Tracking**: Monitor working hours with approval workflows  
- **Payroll Processing**: Generate payroll with bank account integration
- **Financial Management**: Track bank transactions and balances
- **Notification System**: Keep teams informed with actionable notifications
- **Reporting Dashboard**: Comprehensive analytics and reporting tools

## 🚀 Live Project

**URL**: https://lovable.dev/projects/575cc36e-655a-4202-834f-8abeb808b437

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** with custom design system
- **shadcn/ui** for consistent UI components
- **React Query** for data fetching and caching
- **React Router** for navigation

### Backend
- **Supabase** for backend-as-a-service
- **PostgreSQL** database with Row Level Security (RLS)
- **Real-time subscriptions** for live updates
- **Authentication** with role-based access control
- **Database functions** and triggers for business logic

### Key Features
- 🔐 **Role-based permissions** (Admin, Employee, Accountant, Operation, Sales Manager)
- 📊 **Real-time dashboard** with analytics
- 💰 **Bank integration** for payroll processing
- 📱 **Responsive design** for mobile and desktop
- 🔔 **Notification system** with actionable alerts
- 📈 **Comprehensive reporting** with data visualization

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Git

### Local Development

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
The project uses Supabase for backend services. The configuration is already set up in:
- `src/integrations/supabase/client.ts` - Supabase client configuration
- `supabase/config.toml` - Project configuration

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Development Workflow

**Option 1: Use Lovable (Recommended)**
- Visit [Lovable Project](https://lovable.dev/projects/575cc36e-655a-4202-834f-8abeb808b437)
- Make changes using AI-powered development
- Changes auto-sync to GitHub

**Option 2: Local Development**
- Clone repo and develop locally
- Push changes to GitHub
- Changes automatically sync to Lovable

**Option 3: GitHub Codespaces**
- Open in GitHub Codespaces for cloud development
- Full development environment in browser

## 📦 Deployment

### Instant Deployment with Lovable
1. Open [Lovable Project](https://lovable.dev/projects/575cc36e-655a-4202-834f-8abeb808b437)
2. Click **Share → Publish**
3. Your app is live instantly with auto-scaling

### Custom Domain Setup
1. Navigate to **Project > Settings > Domains** in Lovable
2. Click **Connect Domain**
3. Follow the DNS configuration steps
4. [Detailed guide](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

### Alternative Deployment Options
Since this is a standard React app, you can deploy to:
- **Vercel**: `npm run build` then deploy `dist/` folder
- **Netlify**: Connect GitHub repo for continuous deployment
- **AWS S3 + CloudFront**: Static hosting with CDN
- **Any hosting provider** supporting static sites

## 🗄️ Database Schema

### Core Tables
- **profiles**: User information and roles
- **clients**: Customer/company data
- **projects**: Work projects linked to clients
- **rosters**: Work schedules with multiple employees
- **working_hours**: Time tracking with approval workflow
- **payroll**: Salary processing with bank integration
- **bank_accounts**: Financial account management
- **bank_transactions**: Financial transaction history
- **notifications**: System alerts and communications

### Role-Based Access Control
- **Admin**: Full system access
- **Accountant**: Financial and payroll management
- **Operation**: Roster and working hours management
- **Sales Manager**: Client and project oversight
- **Employee**: Personal data and time tracking

## 🛠️ Development Guide

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base shadcn/ui components
│   ├── roster/         # Roster management
│   ├── payroll/        # Payroll processing
│   ├── bank/           # Financial management
│   └── notifications/  # Alert system
├── hooks/              # Custom React hooks
├── integrations/       # Supabase configuration
├── pages/              # Route components
└── types/              # TypeScript definitions
```

### Adding New Features
1. **Database Changes**: Use Supabase migration tool in Lovable
2. **UI Components**: Extend shadcn/ui components
3. **Business Logic**: Create custom hooks for data management
4. **Permissions**: Update role-based access in database functions

### Code Style
- TypeScript strict mode enabled
- Tailwind CSS with custom design tokens
- Component composition over inheritance
- Custom hooks for business logic separation

## 🔧 Technologies Used

### Frontend Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend & Infrastructure
- **Supabase** - Backend-as-a-service
- **PostgreSQL** - Database with RLS
- **Real-time subscriptions** - Live data updates
- **Row Level Security** - Data access control
- **Database functions** - Server-side logic
- **Edge Functions** - Serverless functions

## 📊 Getting Started with Development

### User Roles Setup
1. First user automatically becomes **Admin**
2. Admin can create other users and assign roles
3. Each role has specific permissions for different features

### Basic Workflow
1. **Profiles**: Create employee profiles with roles
2. **Clients & Projects**: Set up business entities
3. **Rosters**: Schedule work assignments
4. **Working Hours**: Track and approve time
5. **Payroll**: Process payments with bank integration
6. **Reports**: Analyze business metrics

### Testing the System
1. Create test profiles with different roles
2. Set up sample clients and projects  
3. Create rosters and assign employees
4. Track working hours and approve them
5. Generate payroll for employees
6. Monitor notifications and reports
