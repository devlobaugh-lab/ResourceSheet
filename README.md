# F1 Resource Manager

A comprehensive web application for managing F1 racing game resources including drivers, car parts, and boost items.

## Features

- **Driver Management**: Track driver levels, cards, and stats
- **Car Parts Management**: Monitor parts across different types (Engine, Brakes, Gearbox, Suspension, Front Wing, Rear Wing)
- **Boost Items**: Manage boost upgrades and effects
- **User Authentication**: Secure login with Supabase Auth
- **Admin Interface**: Upload new data files and manage users
- **Asset Comparison**: Compare multiple assets side-by-side
- **Data Entry**: Optimized for keyboard input with mobile support

## Architecture

- **Frontend**: Next.js with Server Components and Client Components
- **Backend**: Next.js API Routes and Server Actions
- **Database**: Supabase with Row-Level Security
- **Authentication**: Supabase Auth with magic links
- **Deployment**: Vercel

## Development

This project follows a phased development approach with incremental commits and reviews.

### Phase 1: Database Setup
- Create Supabase tables for catalog_items, user_items, and seasons
- Implement RLS policies for data isolation
- Create proper indexes for efficient querying

### Phase 2: Data Processing
- Parse JSON data files into database-compatible format
- Implement data validation and transformation
- Create import/export functionality

### Phase 3: API Development
- Build CRUD endpoints for all entities
- Implement authentication middleware
- Add proper error handling and validation

### Phase 4: Frontend Components
- Data entry screens with validation
- Asset display grids with sorting/filtering
- Asset comparison tools
- Admin interface

## Data Structure

### Catalog Items
Global data for drivers, parts, and boosts containing:
- ID, name, rarity, series, season
- Stats per level (speed, cornering, power, etc.)
- Upgrade costs (cards, currency)
- Visual information (icons, collections)

### User Items
User-specific data tracking:
- Current level for each catalog item
- Number of cards owned
- Association with catalog items

### Seasons
Track season start/end dates and link catalog items to specific seasons.

## License

MIT License
