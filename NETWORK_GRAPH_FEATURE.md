# Network Graph Feature - Implementation Summary

## Overview

A complete network graph visualization feature has been implemented for the ENS Network application. Users can create, edit, and visualize relationships between ENS domains in an interactive graph.

## Features Implemented

### 1. User Management
- **UUID-based user identification**: Each user (PC) gets a unique UUID stored in localStorage
- **Backend user creation**: UUIDs are synchronized with the database
- **Automatic user creation**: New users are created automatically on first load

### 2. ENS Domain Search & Validation
- **Real-time validation**: Search input validates ENS names as you type
- **Visual feedback**: Green border for valid names, red for invalid
- **Loading states**: Shows spinner while validating
- **Auto-normalization**: ENS names are normalized before validation

### 3. Network Graph Visualization
- **Interactive graph**: Built with @xyflow/react (React Flow)
- **Node management**: Add, position, and delete nodes
- **Connection management**: Create connections by dragging between nodes
- **Click to navigate**: Click nodes to view their profile page
- **Visual controls**: Zoom, pan, minimap, and background grid
- **Real-time updates**: Changes are saved to database immediately

### 4. Database Integration
- **PostgreSQL schema**: Complete database schema with users, nodes, and connections tables
- **API routes**: RESTful API for all CRUD operations
- **Connection pooling**: Optimized database connection handling
- **Supabase ready**: Configured for Supabase hosting

## File Structure

```
ensnetwork/
├── app/
│   ├── api/
│   │   ├── users/route.ts          # User UUID management
│   │   ├── nodes/route.ts          # Node CRUD operations
│   │   ├── connections/route.ts    # Connection CRUD operations
│   │   └── graph/route.ts          # Fetch complete graph data
│   └── network/
│       └── page.tsx                # Network graph page
├── database/
│   ├── schema.sql                  # Database schema
│   └── README.md                   # Database setup guide
├── src/
│   ├── components/
│   │   └── network/
│   │       ├── ENSSearchInput.tsx  # ENS search with validation
│   │       └── NetworkGraph.tsx   # Main graph component
│   ├── hooks/
│   │   └── useUserId.ts           # UUID management hook
│   └── lib/
│       └── db.ts                  # Database connection utility
```

## Setup Instructions

### 1. Install Dependencies
Already installed: `pg` and `@types/pg`

### 2. Database Setup
1. Set up PostgreSQL database (local or Supabase)
2. Add `DATABASE_URL` to your `.env` file:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```
3. Run the schema migration:
   ```bash
   psql $DATABASE_URL -f database/schema.sql
   ```
   Or use Supabase SQL Editor (see `database/README.md` for details)

### 3. Start the Application
```bash
pnpm dev
```

### 4. Access the Network Graph
Navigate to: `http://localhost:3000/network`

## Usage

### Adding Nodes
1. Enter an ENS name in the search field (e.g., `vitalik.eth`)
2. Wait for validation (green border indicates valid)
3. Click "Add" or press Enter
4. Node appears in the graph

### Creating Connections
1. Hover over a node to see connection handles
2. Drag from one node's handle to another node's handle
3. Connection is created and saved automatically

### Navigating to Profiles
1. Click on any node
2. Opens the domain profile page at `/domain/[name]`

### Deleting Connections
1. Click on a connection/edge
2. Confirm deletion in the dialog
3. Connection is removed from database

### Moving Nodes
1. Drag nodes to reposition them
2. Positions are automatically saved (debounced)

## API Endpoints

### Users
- `GET /api/users?userId=<uuid>` - Get or create user
- `POST /api/users` - Create new user (returns UUID)

### Nodes
- `GET /api/nodes?userId=<uuid>` - Get all nodes for user
- `POST /api/nodes` - Create new node
- `DELETE /api/nodes?nodeId=<id>&userId=<uuid>` - Delete node

### Connections
- `GET /api/connections?userId=<uuid>` - Get all connections for user
- `POST /api/connections` - Create new connection
- `DELETE /api/connections?connectionId=<id>&userId=<uuid>` - Delete connection

### Graph
- `GET /api/graph?userId=<uuid>` - Get complete graph (nodes + connections)

## Database Schema

### Tables

1. **users**
   - `id` (UUID, Primary Key)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

2. **nodes**
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key → users.id)
   - `ens_name` (VARCHAR)
   - `position_x` (FLOAT)
   - `position_y` (FLOAT)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)
   - Unique constraint: (user_id, ens_name)

3. **connections**
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key → users.id)
   - `source_node_id` (UUID, Foreign Key → nodes.id)
   - `target_node_id` (UUID, Foreign Key → nodes.id)
   - `created_at` (Timestamp)
   - Unique constraint: (user_id, source_node_id, target_node_id)
   - Check constraint: source_node_id != target_node_id

## Technical Details

### UUID Management
- UUIDs are stored in localStorage with key `ens_network_user_id`
- If no UUID exists, a new one is created via API
- UUIDs are validated before use

### Position Updates
- Node positions are debounced (500ms) to avoid excessive database writes
- Positions are updated in the database when nodes are dragged

### Error Handling
- All API calls include error handling
- User-friendly error messages displayed via alerts
- Console logging for debugging

### Performance
- Connection pooling for database queries
- Debounced position updates
- Optimistic UI updates where possible

## Future Enhancements

Potential improvements:
- [ ] Node context menu (right-click to delete, edit, etc.)
- [ ] Bulk operations (select multiple nodes)
- [ ] Graph layout algorithms (force-directed, hierarchical)
- [ ] Export/import graph data
- [ ] Share graphs with other users
- [ ] Graph templates/presets
- [ ] Node grouping/categories
- [ ] Search within graph
- [ ] Undo/redo functionality

## Notes

- Each PC/browser is treated as a separate user
- Graphs are user-specific (not shared between users)
- All changes are persisted immediately to the database
- The graph uses React Flow's built-in features (zoom, pan, minimap)
- Dark mode is fully supported
