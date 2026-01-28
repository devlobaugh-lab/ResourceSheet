# F1 Resource Manager

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A comprehensive Formula 1 game resource management application built with Next.js, Supabase, and TypeScript.

## 🎯 Overview

F1 Resource Manager is a web application designed to help Formula 1 game players track and manage their in-game resources including:

- **Drivers** - Track driver levels, stats, and progression
- **Car Parts** - Manage car components and performance stats  
- **Boosts** - Monitor boost availability and custom naming
- **Setups** - Create and save optimal car configurations
- **Track Guides** - Build racing strategies for different GP levels
- **Collection Management** - Import/export your entire collection

## 🚀 Features

### Core Functionality
- **Asset Management**: Comprehensive tracking of drivers, car parts, and boosts
- **Data Input**: Spreadsheet-style interface for quick data entry
- **Comparison Tools**: Side-by-side comparison of up to 4 items
- **Collection Backup**: Import/export functionality for data preservation
- **User Authentication**: Secure login with Supabase Auth

### Advanced Features
- **Car Setups**: Create and manage custom car configurations
- **Track Guides**: Build racing strategies for different Grand Prix levels
- **Boost Customization**: Admin-controlled custom boost naming
- **Real-time Stats**: Dynamic stat calculations with bonus percentages
- **Responsive Design**: Works seamlessly on desktop and mobile

### Data Processing
- **Unified Data Pipeline**: Two-stage processing for large external data files
- **Database Migration**: Automated schema updates and data seeding
- **Performance Optimized**: Efficient queries with strategic caching

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Database**: PostgreSQL with Row-Level Security
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Query for data fetching and caching
- **Deployment**: Vercel (Free tier)

## 📦 Installation

### Prerequisites

- Node.js 18+
- Docker (for local Supabase development)
- Supabase CLI

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/f1-resource-manager.git
   cd f1-resource-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase locally**
   ```bash
   supabase init
   supabase start
   ```

4. **Configure environment variables**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
   ```

5. **Run database migrations**
   ```bash
   supabase db push
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗 Architecture

### Database Schema
The application uses a clean separation of concerns:

- **Global Data**: Catalog items (drivers, parts, boosts) - shared across users
- **User Data**: Personal collections and preferences - isolated per user
- **Relationships**: Proper foreign key constraints and indexing

### Key Tables
- `drivers` - Driver information and stats
- `car_parts` - Car component data
- `boosts` - Boost item details
- `user_drivers` - User's driver collection
- `user_car_parts` - User's car parts
- `user_boosts` - User's boost collection
- `user_car_setups` - Saved car configurations
- `user_track_guides` - Racing strategies

### Security
- **Row-Level Security**: All user data is isolated via RLS policies
- **Authentication**: Supabase Auth with email magic links
- **Data Validation**: Comprehensive input validation and sanitization

## 📖 Documentation

- [Architecture Design](ARCHITECTURE.md) - System architecture and design decisions
- [API Documentation](API.md) - REST API endpoints and usage
- [Setup Guide](SETUP.md) - Detailed development setup instructions
- [Migration Guide](MIGRATION_GUIDE.md) - Database migration procedures
- [Product Design](ProductDesign.md) - Product vision and user experience design
- [CHANGELOG.md](CHANGELOG.md) - Version history and release notes
- [TASK.md](TASK.md) - Development task tracking and progress

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   - Import your GitHub repository
   - Framework preset: Next.js
   - Build command: `npm run build`

2. **Environment Variables**
   Add to Vercel project settings:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Database Setup**
   - Create Supabase project
   - Run migrations: `supabase db push --project-ref your-project-id`
   - Seed initial data if needed

### Production Considerations

- **Caching**: Leverage Next.js ISR for optimal performance
- **Monitoring**: Use Supabase dashboard for query monitoring
- **Backups**: Enable automated database backups
- **Scaling**: Monitor usage and upgrade plans as needed

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.io) for the excellent backend platform
- [Next.js](https://nextjs.org) for the powerful React framework
- [Tailwind CSS](https://tailwindcss.com) for rapid UI development

## 📞 Support

For support and questions:
- Create an issue in this repository
- Check the documentation in the `/docs` folder
- Review the CHANGELOG for recent updates

---

**Built with ❤️ for F1 game enthusiasts**
