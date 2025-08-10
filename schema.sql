-- Pentwheel Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE status_type AS ENUM ('completed', 'pending', 'in-progress', 'cancelled');
CREATE TYPE shipment_type AS ENUM ('incoming', 'outgoing');
CREATE TYPE repair_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Companies/Customers table
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    contact_person VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Returns table
CREATE TABLE returns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    return_id VARCHAR(50) UNIQUE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    status status_type DEFAULT 'pending',
    return_date DATE NOT NULL,
    reason TEXT,
    total_items INTEGER DEFAULT 0,
    total_value DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service repairs table
CREATE TABLE repairs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    repair_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255),
    device_model VARCHAR(255),
    issue_description TEXT NOT NULL,
    status status_type DEFAULT 'pending',
    priority repair_priority DEFAULT 'medium',
    start_date TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    actual_completion TIMESTAMP WITH TIME ZONE,
    assigned_technician VARCHAR(255),
    labor_cost DECIMAL(10,2) DEFAULT 0,
    parts_cost DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (labor_cost + parts_cost) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipments table
CREATE TABLE shipments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shipment_id VARCHAR(50) UNIQUE NOT NULL,
    type shipment_type NOT NULL,
    origin VARCHAR(255),
    destination VARCHAR(255),
    carrier VARCHAR(255),
    tracking_number VARCHAR(255),
    serial_start VARCHAR(50),
    serial_end VARCHAR(50),
    total_units INTEGER DEFAULT 0,
    weight_kg DECIMAL(8,2),
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    status status_type DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Components/Parts table
CREATE TABLE components (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_cost DECIMAL(10,2) DEFAULT 0,
    supplier VARCHAR(255),
    minimum_stock INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repair components junction table
CREATE TABLE repair_components (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    repair_id UUID REFERENCES repairs(id) ON DELETE CASCADE,
    component_id UUID REFERENCES components(id) ON DELETE CASCADE,
    quantity_needed INTEGER NOT NULL DEFAULT 1,
    quantity_used INTEGER DEFAULT 0,
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity_used * cost_per_unit) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock movements table
CREATE TABLE stock_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    component_id UUID REFERENCES components(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    reference_id UUID, -- Could reference repair_id, shipment_id, etc.
    reference_type VARCHAR(50), -- 'repair', 'shipment', 'adjustment', etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget tracking table
CREATE TABLE budget_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    budgeted_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    actual_amount DECIMAL(12,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_returns_status ON returns(status);
CREATE INDEX idx_returns_return_date ON returns(return_date);
CREATE INDEX idx_repairs_status ON repairs(status);
CREATE INDEX idx_repairs_priority ON repairs(priority);
CREATE INDEX idx_repairs_start_date ON repairs(start_date);
CREATE INDEX idx_shipments_type ON shipments(type);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_estimated_arrival ON shipments(estimated_arrival);
CREATE INDEX idx_components_sku ON components(sku);
CREATE INDEX idx_components_current_stock ON components(current_stock);
CREATE INDEX idx_stock_movements_component_id ON stock_movements(component_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX idx_budget_entries_week_start ON budget_entries(week_start);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_returns_updated_at BEFORE UPDATE ON returns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON repairs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON components FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_entries_updated_at BEFORE UPDATE ON budget_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update component stock
CREATE OR REPLACE FUNCTION update_component_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.movement_type = 'in' THEN
        UPDATE components SET current_stock = current_stock + NEW.quantity WHERE id = NEW.component_id;
    ELSIF NEW.movement_type = 'out' THEN
        UPDATE components SET current_stock = current_stock - NEW.quantity WHERE id = NEW.component_id;
    ELSIF NEW.movement_type = 'adjustment' THEN
        UPDATE components SET current_stock = NEW.quantity WHERE id = NEW.component_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_component_stock 
    AFTER INSERT ON stock_movements 
    FOR EACH ROW EXECUTE FUNCTION update_component_stock();

-- Insert sample data
INSERT INTO companies (name, email, phone, contact_person) VALUES
('TechCorp Inc.', 'orders@techcorp.com', '+1-555-0101', 'John Smith'),
('Global Logistics', 'supply@globallog.com', '+1-555-0102', 'Sarah Johnson'),
('MegaMart', 'procurement@megamart.com', '+1-555-0103', 'Mike Chen'),
('Northern Supplies', 'orders@northsupply.com', '+1-555-0104', 'Lisa Williams');

INSERT INTO components (name, sku, description, category, unit_cost, supplier, minimum_stock, current_stock, reorder_level) VALUES
('Motor Assembly', 'PWH-MOT-001', 'High-efficiency motor assembly', 'Motors', 125.50, 'Motor Dynamics LLC', 10, 45, 15),
('Control Board', 'PWH-PCB-001', 'Main control circuit board', 'Electronics', 89.99, 'Circuit Solutions Inc', 5, 23, 8),
('Power Cable', 'PWH-CAB-001', '12AWG power cable assembly', 'Cables', 15.75, 'Cable Works Ltd', 50, 156, 25),
('Sensor Unit', 'PWH-SEN-001', 'Temperature and pressure sensor', 'Sensors', 67.25, 'Sensor Tech Corp', 15, 8, 12),
('Housing Bracket', 'PWH-BRK-001', 'Aluminum housing bracket', 'Hardware', 23.45, 'Metal Fab Industries', 20, 67, 25);

INSERT INTO budget_entries (week_start, week_end, category, budgeted_amount, actual_amount, description) VALUES
('2025-08-05', '2025-08-11', 'Parts & Components', 50000.00, 32450.75, 'Weekly parts procurement budget'),
('2025-08-05', '2025-08-11', 'Labor Costs', 25000.00, 18250.50, 'Technician labor costs'),
('2025-08-05', '2025-08-11', 'Shipping & Logistics', 15000.00, 12100.25, 'Inbound and outbound shipping'),
('2025-08-05', '2025-08-11', 'Operational Expenses', 52000.00, 26750.00, 'General operational costs');

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;

-- For now, allow all authenticated users to access all data
CREATE POLICY "Allow all operations for authenticated users" ON companies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON returns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON repairs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON shipments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON components FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON repair_components FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON stock_movements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON budget_entries FOR ALL USING (auth.role() = 'authenticated');
