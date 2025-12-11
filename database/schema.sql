-- Network Graph Database Schema
-- PostgreSQL database schema for ENS Network Graph feature

-- Users table: Stores unique user identifiers (UUIDs)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Nodes table: Stores ENS domain nodes in the network graph
CREATE TABLE IF NOT EXISTS nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ens_name VARCHAR(255) NOT NULL,
    position_x FLOAT NOT NULL DEFAULT 0,
    position_y FLOAT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, ens_name)
);

-- Connections table: Stores edges/connections between nodes
CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, source_node_id, target_node_id),
    CHECK (source_node_id != target_node_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_nodes_user_id ON nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_nodes_ens_name ON nodes(ens_name);
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_source ON connections(source_node_id);
CREATE INDEX IF NOT EXISTS idx_connections_target ON connections(target_node_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
