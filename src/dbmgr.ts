import React, { useState, useEffect } from 'react';

// Mock data and types for demonstration
interface Component {
  id: string;
  name: string;
  sku: string;
  category: string;
  current_stock: number;
  reorder_level: number;
  unit_cost: number;
  supplier: string;
}

interface Return {
  id: string;
  return_id: string;
  company_name: string;
  return_date: string;
  total_items: number;
  total_value: number;
  status: string;
}

interface Repair {
  id: string;
  repair_id: string;
  customer_name: string;
  device_model: string;
  priority: string;
  status: string;
  assigned_technician: string;
  total_cost: number;
}

interface Shipment {
  id: string;
  shipment_id: string;
  type: 'incoming' | 'outgoing';
  origin: string;
  destination: string;
  estimated_arrival: string;
  status: string;
  total_units: number;
}

interface BudgetEntry {
  id: string;
  week_start: string;
  category: string;
  budgeted_amount: number;
  actual_amount: number;
  description: string;
}

// API service simulate Supabase calls
class MockDatabaseService {
  static async getDashboardMetrics() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      incomingShipments: 47,
      outgoingShipments: 23,
      totalBudget: 142000,
      totalUsed: 89000,
      budgetRemaining: 53000
    };
  }

  static async getLowStockComponents(): Promise<Component[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        name: 'Sensor Unit',
        sku: 'PWH-SEN-001',
        category: 'Sensors',
        current_stock: 8,
        reorder_level: 12,
        unit_cost: 67.25,
        supplier: 'Sensor Tech Corp'
      },
      {
        id: '2',
        name: 'Control Board',
        sku: 'PWH-PCB-001',
        category: 'Electronics',
        current_stock: 5,
        reorder_level: 8,
        unit_cost: 89.99,
        supplier: 'Circuit Solutions Inc'
      }
    ];
  }

  static async getReturns(): Promise<Return[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: '1',
        return_id: 'RET-2025-001',
        company_name: 'TechCorp Inc.',
        return_date: '2025-08-07',
        total_items: 5,
        total_value: 1250.50,
        status: 'in-progress'
      },
      {
        id: '2',
        return_id: 'RET-2025-002',
        company_name: 'Global Logistics',
        return_date: '2025-08-06',
        total_items: 12,
        total_value: 2450.75,
        status: 'completed'
      },
      {
        id: '3',
        return_id: 'RET-2025-003',
        company_name: 'MegaMart',
        return_date: '2025-08-05',
        total_items: 3,
        total_value: 675.25,
        status: 'pending'
      }
    ];
  }

  static async getRepairs(): Promise<Repair[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      {
        id: '1',
        repair_id: 'SRV-001',
        customer_name: 'John Smith',
        device_model: 'PWH-Model-X',
        priority: 'high',
        status: 'in-progress',
        assigned_technician: 'Mike Johnson',
        total_cost: 245.50
      },
      {
        id: '2',
        repair_id: 'SRV-002',
        customer_name: 'Sarah Wilson',
        device_model: 'PWH-Model-Y',
        priority: 'medium',
        status: 'pending',
        assigned_technician: 'Lisa Chen',
        total_cost: 189.25
      }
    ];
  }

  static async getShipments(): Promise<Shipment[]> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return [
      {
        id: '1',
        shipment_id: 'OS-2025-089',
        type: 'incoming',
        origin: 'Shanghai, CN',
        destination: 'San Jose, CA',
        estimated_arrival: '2025-08-10',
        status: 'in-progress',
        total_units: 150
      },
      {
        id: '2',
        shipment_id: 'OS-2025-090',
        type: 'outgoing',
        origin: 'San Jose, CA',
        destination: 'New York, NY',
        estimated_arrival: '2025-08-12',
        status: 'pending',
        total_units: 75
      }
    ];
  }

  static async getComponents(): Promise<Component[]> {
    await new Promise(resolve => setTimeout(resolve, 900));
    
    return [
      {
        id: '1',
        name: 'Motor Assembly',
        sku: 'PWH-MOT-001',
        category: 'Motors',
        current_stock: 45,
        reorder_level: 15,
        unit_cost: 125.50,
        supplier: 'Motor Dynamics LLC'
      },
      {
        id: '2',
        name: 'Control Board',
        sku: 'PWH-PCB-001',
        category: 'Electronics',
        current_stock: 5,
        reorder_level: 8,
        unit_cost: 89.99,
        supplier: 'Circuit Solutions Inc'
      },
      {
        id: '3',
        name: 'Power Cable',
        sku: 'PWH-CAB-001',
        category: 'Cables',
        current_stock: 156,
        reorder_level: 25,
        unit_cost: 15.75,
        supplier: 'Cable Works Ltd'
      },
      {
        id: '4',
        name: 'Sensor Unit',
        sku: 'PWH-SEN-001',
        category: 'Sensors',
        current_stock: 8,
        reorder_level: 12,
        unit_cost: 67.25,
        supplier: 'Sensor Tech Corp'
      }
    ];
  }

  static async getBudgetEntries(): Promise<BudgetEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return [
      {
        id: '1',
        week_start: '2025-08-05',
        category: 'Parts & Components',
        budgeted_amount: 50000,
        actual_amount: 32450.75,
        description: 'Weekly parts procurement budget'
      },
      {
        id: '2',
        week_start: '2025-08-05',
        category: 'Labor Costs',
        budgeted_amount: 25000,
        actual_amount: 18250.50,
        description: 'Technician labor costs'
      },
      {
        id: '3',
        week_start: '2025-08-05',
        category: 'Shipping & Logistics',
        budgeted_amount: 15000,
        actual_amount: 12100.25,
        description: 'Inbound and outbound shipping'
      }
    ];
  }

  static async updateReturnStatus(id: string, status: string): Promise<Return> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // TODO: update - in prod this would update the database
    return {
      id,
      return_id: 'RET-2025-001',
      company_name: 'TechCorp Inc.',
      return_date: '2025-08-07',
      total_items: 5,
      total_value: 1250.50,
      status
    };
  }
}

interface TabContentProps {
  activeTab: string;
}

const DatabaseManagementPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'returns', label: '🔄 Returns', icon: '🔄' },
    { id: 'repairs', label: '🔧 Repairs', icon: '🔧' },
    { id: 'shipments', label: '📦 Shipments', icon: '📦' },
    { id: 'inventory', label: '📋 Inventory', icon: '📋' },
    { id: 'budget', label: '💰 Budget', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600">
      {/* Header */}
      <header className="bg-white bg-opacity-95 backdrop-blur-sm p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-15 h-10 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full relative flex items-center justify-center">
              <span className="text-white text-2xl">🐋</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                Pentwheel Database Manager
              </h1>
              <p className="text-gray-600 text-sm">Manage your warehouse and sales data</p>
            </div>
          </div>
          <div className="text-gray-600 text-sm text-right">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Mock Database Connected</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Ready for Supabase integration</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Navigation Tabs */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span>Loading data...</span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <TabContent activeTab={activeTab} loading={loading} setLoading={setLoading} setError={setError} />
      </div>
    </div>
  );
};

const TabContent: React.FC<TabContentProps & { loading: boolean; setLoading: (loading: boolean) => void; setError: (error: string | null) => void }> = ({ 
  activeTab, loading, setLoading, setError 
}) => {
  switch (activeTab) {
    case 'overview':
      return <OverviewTab setLoading={setLoading} setError={setError} />;
    case 'returns':
      return <ReturnsTab setLoading={setLoading} setError={setError} />;
    case 'repairs':
      return <RepairsTab setLoading={setLoading} setError={setError} />;
    case 'shipments':
      return <ShipmentsTab setLoading={setLoading} setError={setError} />;
    case 'inventory':
      return <InventoryTab setLoading={setLoading} setError={setError} />;
    case 'budget':
      return <BudgetTab setLoading={setLoading} setError={setError} />;
    default:
      return <OverviewTab setLoading={setLoading} setError={setError} />;
  }
};

const OverviewTab: React.FC<{ setLoading: (loading: boolean) => void; setError: (error: string | null) => void }> = ({ 
  setLoading, setError 
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [lowStockItems, setLowStockItems] = useState<Component[]>([]);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        const [metricsData, lowStockData] = await Promise.all([
          MockDatabaseService.getDashboardMetrics(),
          MockDatabaseService.getLowStockComponents(),
        ]);
        setMetrics(metricsData);
        setLowStockItems(lowStockData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [setLoading, setError]);

  if (!metrics) {
    return <div className="text-center py-8 text-white">Loading overview data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center text-2xl">
              📦
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Incoming Shipments</h3>
              <p className="text-3xl font-bold text-purple-600">{metrics.incomingShipments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-yellow-400 rounded-xl flex items-center justify-center text-2xl">
              🚚
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Outgoing Shipments</h3>
              <p className="text-3xl font-bold text-purple-600">{metrics.outgoingShipments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl flex items-center justify-center text-2xl">
              💰
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Budget Used</h3>
              <p className="text-3xl font-bold text-purple-600">${(metrics.totalUsed / 1000).toFixed(0)}K</p>
              <p className="text-sm text-gray-600">of ${(metrics.totalBudget / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>

        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Low Stock Items</h3>
              <p className="text-3xl font-bold text-red-600">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-red-800 mb-4">🚨 Low Stock Alert</h3>
          <div className="space-y-2">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white rounded-lg p-3">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500 text-sm ml-2">({item.sku})</span>
                </div>
                <div className="text-right">
                  <span className="text-red-600 font-bold">{item.current_stock}</span>
                  <span className="text-gray-500 text-sm"> / {item.reorder_level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ReturnsTab: React.FC<{ setLoading: (loading: boolean) => void; setError: (error: string | null) => void }> = ({ 
  setLoading, setError 
}) => {
  const [returns, setReturns] = useState<Return[]>([]);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        setLoading(true);
        const data = await MockDatabaseService.getReturns();
        setReturns(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [setLoading, setError]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await MockDatabaseService.updateReturnStatus(id, status);
      // Update local state
      setReturns(prev => prev.map(item => 
        item.id === id ? { ...item, status } : item
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Returns Management</h2>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          + Add Return
        </button>
      </div>

      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Return ID</th>
                <th className="text-left p-4 font-semibold text-gray-700">Company</th>
                <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                <th className="text-left p-4 font-semibold text-gray-700">Items</th>
                <th className="text-left p-4 font-semibold text-gray-700">Value</th>
                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((returnItem) => (
                <tr key={returnItem.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm">{returnItem.return_id}</td>
                  <td className="p-4">{returnItem.company_name}</td>
                  <td className="p-4">{new Date(returnItem.return_date).toLocaleDateString()}</td>
                  <td className="p-4">{returnItem.total_items}</td>
                  <td className="p-4">${returnItem.total_value.toFixed(2)}</td>
                  <td className="p-4">
                    <StatusBadge status={returnItem.status} />
                  </td>
                  <td className="p-4">
                    <select
                      value={returnItem.status}
                      onChange={(e) => updateStatus(returnItem.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const RepairsTab: React.FC<{ setLoading: (loading: boolean) => void; setError: (error: string | null) => void }> = ({ 
  setLoading, setError 
}) => {
  const [repairs, setRepairs] = useState<Repair[]>([]);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        setLoading(true);
        const data = await MockDatabaseService.getRepairs();
        setRepairs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, [setLoading, setError]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Service Repairs</h2>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          + New Repair
        </button>
      </div>

      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Repair ID</th>
                <th className="text-left p-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left p-4 font-semibold text-gray-700">Device</th>
                <th className="text-left p-4 font-semibold text-gray-700">Priority</th>
                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700">Technician</th>
                <th className="text-left p-4 font-semibold text-gray-700">Cost</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map((repair) => (
                <tr key={repair.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm">{repair.repair_id}</td>
                  <td className="p-4">{repair.customer_name}</td>
                  <td className="p-4">{repair.device_model}</td>
                  <td className="p-4">
                    <PriorityBadge priority={repair.priority} />
                  </td>
                  <td className="p-4">
                    <StatusBadge status={repair.status} />
                  </td>
                  <td className="p-4">{repair.assigned_technician}</td>
                  <td className="p-4">${repair.total_cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ShipmentsTab: React.FC<{ setLoading: (loading: boolean) => void; setError: (error: string | null) => void }> = ({ 
  setLoading, setError 
}) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        const data = await MockDatabaseService.getShipments();
        setShipments(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, [setLoading, setError]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Shipments</h2>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          + Track Shipment
        </button>
      </div>

      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Shipment ID</th>
                <th className="text-left p-4 font-semibold text-gray-700">Type</th>
                <th className="text-left p-4 font-semibold text-gray-700">Origin</th>
                <th className="text-left p-4 font-semibold text-gray-700">Destination</th>
                <th className="text-left p-4 font-semibold text-gray-700">ETA</th>
                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700">Units</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm">{shipment.shipment_id}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      shipment.type === 'incoming' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {shipment.type}
                    </span>
                  </td>
                  <td className="p-4">{shipment.origin}</td>
                  <td className="p-4">{shipment.destination}</td>
                  <td className="p-4">
                    {new Date(shipment.estimated_arrival).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={shipment.status} />
                  </td>
                  <td className="p-4">{shipment.total_units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const InventoryTab: React.FC<{ setLoading: (loading: boolean) => void; setError: (error: string | null) => void }> = ({ 
  setLoading, setError 
}) => {
  const [components, setComponents] = useState<Component[]>([]);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setLoading(true);
        const data = await MockDatabaseService.getComponents();
        setComponents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, [setLoading, setError]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          + Add Component
        </button>
      </div>

      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">SKU</th>
                <th className="text-left p-4 font-semibold text-gray-700">Name</th>
                <th className="text-left p-4 font-semibold text-gray-700">Category</th>
                <th className="text-left p-4 font-semibold text-gray-700">Current Stock</th>
                <th className="text-left p-4 font-semibold text-gray-700">Reorder Level</th>
                <th className="text-left p-4 font-semibold text-gray-700">Unit Cost</th>
                <th className="text-left p-4 font-semibold text-gray-700">Supplier</th>
              </tr>
            </thead>
            <tbody>
              {components.map((component) => (
                <tr key={component.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm">{component.sku}</td>
                  <td className="p-4 font-medium">{component.name}</td>
                  <td className="p-4">{component.category}</td>
                  <td className="p-4">
                    <span className={`font-bold ${
                      component.current_stock <= component.reorder_level ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {component.current_stock}
                    </span>
                  </td>
                  <td className="p-4">{component.reorder_level}</td>
                  <td className="p-4">${component.unit_cost.toFixed(2)}</td>
                  <td className="p-4">{component.supplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const BudgetTab: React.FC<{ setLoading: (loading: boolean) => void; setError: (error: string | null) => void }> = ({ 
  setLoading, setError 
}) => {
  const [budgetEntries, setBudgetEntries] = useState<BudgetEntry[]>([]);

  useEffect(() => {
    const fetchBudgetEntries = async () => {
      try {
        setLoading(true);
        const data = await MockDatabaseService.getBudgetEntries();
        setBudgetEntries(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetEntries();
  }, [setLoading, setError]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Budget Management</h2>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          + Add Budget Entry
        </button>
      </div>

      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Week</th>
                <th className="text-left p-4 font-semibold text-gray-700">Category</th>
                <th className="text-left p-4 font-semibold text-gray-700">Budgeted</th>
                <th className="text-left p-4 font-semibold text-gray-700">Actual</th>
                <th className="text-left p-4 font-semibold text-gray-700">Remaining</th>
                <th className="text-left p-4 font-semibold text-gray-700">Usage %</th>
                <th className="text-left p-4 font-semibold text-gray-700">Description</th>
              </tr>
            </thead>
            <tbody>
              {budgetEntries.map((entry) => {
                const remaining = entry.budgeted_amount - entry.actual_amount;
                const usagePercent = (entry.actual_amount / entry.budgeted_amount) * 100;
                
                return (
                  <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4">{new Date(entry.week_start).toLocaleDateString()}</td>
                    <td className="p-4 font-medium">{entry.category}</td>
                    <td className="p-4">${entry.budgeted_amount.toLocaleString()}</td>
                    <td className="p-4">${entry.actual_amount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${remaining.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              usagePercent > 90 ? 'bg-red-500' : 
                              usagePercent > 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{usagePercent.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{entry.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(status)}`}>
      {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
};

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityClass(priority)}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

export default DatabaseManagementPlatform;
