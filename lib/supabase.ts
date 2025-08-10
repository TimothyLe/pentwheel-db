import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Types for our application
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Export specific types
export type Company = Tables<'companies'>
export type Return = Tables<'returns'>
export type Repair = Tables<'repairs'>
export type Shipment = Tables<'shipments'>
export type Component = Tables<'components'>
export type RepairComponent = Tables<'repair_components'>
export type StockMovement = Tables<'stock_movements'>
export type BudgetEntry = Tables<'budget_entries'>

export type StatusType = Enums<'status_type'>
export type ShipmentType = Enums<'shipment_type'>
export type RepairPriority = Enums<'repair_priority'>

// Database functions
export class DatabaseService {
  // Companies
  static async getCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  }

  static async createCompany(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('companies')
      .insert([company])
      .select()
    
    if (error) throw error
    return data[0]
  }

  // Returns
  static async getReturns() {
    const { data, error } = await supabase
      .from('returns')
      .select(`
        *,
        companies (
          name,
          contact_person
        )
      `)
      .order('return_date', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async createReturn(returnData: Omit<Return, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('returns')
      .insert([returnData])
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async updateReturnStatus(id: string, status: StatusType) {
    const { data, error } = await supabase
      .from('returns')
      .update({ status })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }

  // Repairs
  static async getRepairs() {
    const { data, error } = await supabase
      .from('repairs')
      .select(`
        *,
        repair_components (
          *,
          components (
            name,
            sku
          )
        )
      `)
      .order('start_date', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async createRepair(repair: Omit<Repair, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('repairs')
      .insert([repair])
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async updateRepair(id: string, updates: Partial<Repair>) {
    const { data, error } = await supabase
      .from('repairs')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }

  // Shipments
  static async getShipments() {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('estimated_arrival', { ascending: true })
    
    if (error) throw error
    return data
  }

  static async createShipment(shipment: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('shipments')
      .insert([shipment])
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async updateShipmentStatus(id: string, status: StatusType) {
    const { data, error } = await supabase
      .from('shipments')
      .update({ status })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }

  // Components
  static async getComponents() {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  }

  static async createComponent(component: Omit<Component, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('components')
      .insert([component])
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async updateComponentStock(id: string, quantity: number, movementType: 'in' | 'out' | 'adjustment') {
    // First create stock movement record
    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert([{
        component_id: id,
        movement_type: movementType,
        quantity: movementType === 'out' ? -Math.abs(quantity) : quantity,
        reference_type: 'manual_adjustment',
        notes: 'Manual stock adjustment'
      }])
    
    if (movementError) throw movementError

    // The trigger will automatically update the component stock
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('id', id)
    
    if (error) throw error
    return data[0]
  }

  // Stock movements
  static async getStockMovements(componentId?: string) {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        components (
          name,
          sku
        )
      `)
      .order('created_at', { ascending: false })

    if (componentId) {
      query = query.eq('component_id', componentId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  // Budget entries
  static async getBudgetEntries() {
    const { data, error } = await supabase
      .from('budget_entries')
      .select('*')
      .order('week_start', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async createBudgetEntry(entry: Omit<BudgetEntry, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('budget_entries')
      .insert([entry])
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async updateBudgetEntry(id: string, updates: Partial<BudgetEntry>) {
    const { data, error } = await supabase
      .from('budget_entries')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }

  // Analytics functions
  static async getDashboardMetrics() {
    // Get current week's data
    const currentWeekStart = new Date()
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay())
    
    // Incoming shipments this week
    const { count: incomingCount } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'incoming')
      .gte('estimated_arrival', currentWeekStart.toISOString())

    // Outgoing shipments this week
    const { count: outgoingCount } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'outgoing')
      .gte('created_at', currentWeekStart.toISOString())

    // Budget data for current week
    const { data: budgetData } = await supabase
      .from('budget_entries')
      .select('budgeted_amount, actual_amount')
      .gte('week_start', currentWeekStart.toISOString())

    const totalBudget = budgetData?.reduce((sum, entry) => sum + Number(entry.budgeted_amount), 0) || 0
    const totalUsed = budgetData?.reduce((sum, entry) => sum + Number(entry.actual_amount), 0) || 0

    return {
      incomingShipments: incomingCount || 0,
      outgoingShipments: outgoingCount || 0,
      totalBudget,
      totalUsed,
      budgetRemaining: totalBudget - totalUsed
    }
  }

  // Low stock alerts
  static async getLowStockComponents() {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .filter('current_stock', 'lte', 'reorder_level')
      .order('current_stock', { ascending: true })

    if (error) throw error
    return data
  }
}
