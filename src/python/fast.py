# Pentwheel FastAPI Application
# Complete CRUD operations for all database entities

from fastapi import FastAPI, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
import uuid
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean, Text, Numeric, ForeignKey, Date, func
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.sql import text

# Database configuration
DATABASE_URL = "postgresql://username:password@localhost/pentwheel_db"  # Update with your credentials
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Enums
class StatusType(str, Enum):
    completed = "completed"
    pending = "pending"
    in_progress = "in-progress"
    cancelled = "cancelled"

class ShipmentType(str, Enum):
    incoming = "incoming"
    outgoing = "outgoing"

class RepairPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class MovementType(str, Enum):
    in_ = "in"
    out = "out"
    adjustment = "adjustment"

# SQLAlchemy Models
class Company(Base):
    __tablename__ = "companies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255))
    phone = Column(String(50))
    address = Column(Text)
    contact_person = Column(String(255))
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now())

class Return(Base):
    __tablename__ = "returns"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    return_id = Column(String(50), unique=True, nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"))
    status = Column(ENUM(StatusType), default=StatusType.pending)
    return_date = Column(Date, nullable=False)
    reason = Column(Text)
    total_items = Column(Integer, default=0)
    total_value = Column(Numeric(12, 2), default=0)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now())

class Repair(Base):
    __tablename__ = "repairs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repair_id = Column(String(50), unique=True, nullable=False)
    customer_name = Column(String(255))
    device_model = Column(String(255))
    issue_description = Column(Text, nullable=False)
    status = Column(ENUM(StatusType), default=StatusType.pending)
    priority = Column(ENUM(RepairPriority), default=RepairPriority.medium)
    start_date = Column(DateTime(timezone=True))
    estimated_completion = Column(DateTime(timezone=True))
    actual_completion = Column(DateTime(timezone=True))
    assigned_technician = Column(String(255))
    labor_cost = Column(Numeric(10, 2), default=0)
    parts_cost = Column(Numeric(10, 2), default=0)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now())

class Shipment(Base):
    __tablename__ = "shipments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    shipment_id = Column(String(50), unique=True, nullable=False)
    type = Column(ENUM(ShipmentType), nullable=False)
    origin = Column(String(255))
    destination = Column(String(255))
    carrier = Column(String(255))
    tracking_number = Column(String(255))
    serial_start = Column(String(50))
    serial_end = Column(String(50))
    total_units = Column(Integer, default=0)
    weight_kg = Column(Numeric(8, 2))
    estimated_arrival = Column(DateTime(timezone=True))
    actual_arrival = Column(DateTime(timezone=True))
    status = Column(ENUM(StatusType), default=StatusType.pending)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now())

class Component(Base):
    __tablename__ = "components"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    category = Column(String(100))
    unit_cost = Column(Numeric(10, 2), default=0)
    supplier = Column(String(255))
    minimum_stock = Column(Integer, default=0)
    current_stock = Column(Integer, default=0)
    reorder_level = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now())

class RepairComponent(Base):
    __tablename__ = "repair_components"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repair_id = Column(UUID(as_uuid=True), ForeignKey("repairs.id"))
    component_id = Column(UUID(as_uuid=True), ForeignKey("components.id"))
    quantity_needed = Column(Integer, nullable=False, default=1)
    quantity_used = Column(Integer, default=0)
    cost_per_unit = Column(Numeric(10, 2), default=0)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())

class StockMovement(Base):
    __tablename__ = "stock_movements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    component_id = Column(UUID(as_uuid=True), ForeignKey("components.id"))
    movement_type = Column(String(20), nullable=False)
    quantity = Column(Integer, nullable=False)
    reference_id = Column(UUID(as_uuid=True))
    reference_type = Column(String(50))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())

class BudgetEntry(Base):
    __tablename__ = "budget_entries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    week_start = Column(Date, nullable=False)
    week_end = Column(Date, nullable=False)
    category = Column(String(100), nullable=False)
    budgeted_amount = Column(Numeric(12, 2), nullable=False, default=0)
    actual_amount = Column(Numeric(12, 2), default=0)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now())

# Pydantic Models for API
class CompanyBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None

class CompanyResponse(CompanyBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReturnBase(BaseModel):
    return_id: str
    company_id: Optional[uuid.UUID] = None
    status: Optional[StatusType] = StatusType.pending
    return_date: date
    reason: Optional[str] = None
    total_items: Optional[int] = 0
    total_value: Optional[Decimal] = Decimal(0)
    notes: Optional[str] = None

class ReturnCreate(ReturnBase):
    pass

class ReturnUpdate(BaseModel):
    return_id: Optional[str] = None
    company_id: Optional[uuid.UUID] = None
    status: Optional[StatusType] = None
    return_date: Optional[date] = None
    reason: Optional[str] = None
    total_items: Optional[int] = None
    total_value: Optional[Decimal] = None
    notes: Optional[str] = None

class ReturnResponse(ReturnBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RepairBase(BaseModel):
    repair_id: str
    customer_name: Optional[str] = None
    device_model: Optional[str] = None
    issue_description: str
    status: Optional[StatusType] = StatusType.pending
    priority: Optional[RepairPriority] = RepairPriority.medium
    start_date: Optional[datetime] = None
    estimated_completion: Optional[datetime] = None
    actual_completion: Optional[datetime] = None
    assigned_technician: Optional[str] = None
    labor_cost: Optional[Decimal] = Decimal(0)
    parts_cost: Optional[Decimal] = Decimal(0)
    notes: Optional[str] = None

class RepairCreate(RepairBase):
    pass

class RepairUpdate(BaseModel):
    repair_id: Optional[str] = None
    customer_name: Optional[str] = None
    device_model: Optional[str] = None
    issue_description: Optional[str] = None
    status: Optional[StatusType] = None
    priority: Optional[RepairPriority] = None
    start_date: Optional[datetime] = None
    estimated_completion: Optional[datetime] = None
    actual_completion: Optional[datetime] = None
    assigned_technician: Optional[str] = None
    labor_cost: Optional[Decimal] = None
    parts_cost: Optional[Decimal] = None
    notes: Optional[str] = None

class RepairResponse(RepairBase):
    id: uuid.UUID
    total_cost: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ShipmentBase(BaseModel):
    shipment_id: str
    type: ShipmentType
    origin: Optional[str] = None
    destination: Optional[str] = None
    carrier: Optional[str] = None
    tracking_number: Optional[str] = None
    serial_start: Optional[str] = None
    serial_end: Optional[str] = None
    total_units: Optional[int] = 0
    weight_kg: Optional[Decimal] = None
    estimated_arrival: Optional[datetime] = None
    actual_arrival: Optional[datetime] = None
    status: Optional[StatusType] = StatusType.pending
    notes: Optional[str] = None

class ShipmentCreate(ShipmentBase):
    pass

class ShipmentUpdate(BaseModel):
    shipment_id: Optional[str] = None
    type: Optional[ShipmentType] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    carrier: Optional[str] = None
    tracking_number: Optional[str] = None
    serial_start: Optional[str] = None
    serial_end: Optional[str] = None
    total_units: Optional[int] = None
    weight_kg: Optional[Decimal] = None
    estimated_arrival: Optional[datetime] = None
    actual_arrival: Optional[datetime] = None
    status: Optional[StatusType] = None
    notes: Optional[str] = None

class ShipmentResponse(ShipmentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ComponentBase(BaseModel):
    name: str
    sku: str
    description: Optional[str] = None
    category: Optional[str] = None
    unit_cost: Optional[Decimal] = Decimal(0)
    supplier: Optional[str] = None
    minimum_stock: Optional[int] = 0
    current_stock: Optional[int] = 0
    reorder_level: Optional[int] = 0

class ComponentCreate(ComponentBase):
    pass

class ComponentUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    unit_cost: Optional[Decimal] = None
    supplier: Optional[str] = None
    minimum_stock: Optional[int] = None
    current_stock: Optional[int] = None
    reorder_level: Optional[int] = None

class ComponentResponse(ComponentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RepairComponentBase(BaseModel):
    repair_id: uuid.UUID
    component_id: uuid.UUID
    quantity_needed: int = 1
    quantity_used: int = 0
    cost_per_unit: Decimal = Decimal(0)
    notes: Optional[str] = None

class RepairComponentCreate(RepairComponentBase):
    pass

class RepairComponentUpdate(BaseModel):
    repair_id: Optional[uuid.UUID] = None
    component_id: Optional[uuid.UUID] = None
    quantity_needed: Optional[int] = None
    quantity_used: Optional[int] = None
    cost_per_unit: Optional[Decimal] = None
    notes: Optional[str] = None

class RepairComponentResponse(RepairComponentBase):
    id: uuid.UUID
    total_cost: Optional[Decimal] = None
    created_at: datetime

    class Config:
        from_attributes = True

class StockMovementBase(BaseModel):
    component_id: uuid.UUID
    movement_type: MovementType
    quantity: int
    reference_id: Optional[uuid.UUID] = None
    reference_type: Optional[str] = None
    notes: Optional[str] = None

class StockMovementCreate(StockMovementBase):
    pass

class StockMovementResponse(StockMovementBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

class BudgetEntryBase(BaseModel):
    week_start: date
    week_end: date
    category: str
    budgeted_amount: Decimal
    actual_amount: Optional[Decimal] = Decimal(0)
    description: Optional[str] = None

class BudgetEntryCreate(BudgetEntryBase):
    pass

class BudgetEntryUpdate(BaseModel):
    week_start: Optional[date] = None
    week_end: Optional[date] = None
    category: Optional[str] = None
    budgeted_amount: Optional[Decimal] = None
    actual_amount: Optional[Decimal] = None
    description: Optional[str] = None

class BudgetEntryResponse(BudgetEntryBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# FastAPI App
app = FastAPI(title="Pentwheel API", description="API for Pentwheel database operations", version="1.0.0")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Companies endpoints
@app.get("/companies/", response_model=List[CompanyResponse])
def get_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    companies = db.query(Company).offset(skip).limit(limit).all()
    return companies

@app.get("/companies/{company_id}", response_model=CompanyResponse)
def get_company(company_id: uuid.UUID, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@app.post("/companies/", response_model=CompanyResponse)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    db_company = Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@app.put("/companies/{company_id}", response_model=CompanyResponse)
def update_company(company_id: uuid.UUID, company: CompanyUpdate, db: Session = Depends(get_db)):
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    
    update_data = company.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_company, field, value)
    
    db.commit()
    db.refresh(db_company)
    return db_company

@app.delete("/companies/{company_id}")
def delete_company(company_id: uuid.UUID, db: Session = Depends(get_db)):
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db.delete(db_company)
    db.commit()
    return {"message": "Company deleted successfully"}

# Returns endpoints
@app.get("/returns/", response_model=List[ReturnResponse])
def get_returns(skip: int = 0, limit: int = 100, status: Optional[StatusType] = None, db: Session = Depends(get_db)):
    query = db.query(Return)
    if status:
        query = query.filter(Return.status == status)
    returns = query.offset(skip).limit(limit).all()
    return returns

@app.get("/returns/{return_id}", response_model=ReturnResponse)
def get_return(return_id: uuid.UUID, db: Session = Depends(get_db)):
    return_obj = db.query(Return).filter(Return.id == return_id).first()
    if return_obj is None:
        raise HTTPException(status_code=404, detail="Return not found")
    return return_obj

@app.post("/returns/", response_model=ReturnResponse)
def create_return(return_obj: ReturnCreate, db: Session = Depends(get_db)):
    db_return = Return(**return_obj.dict())
    db.add(db_return)
    db.commit()
    db.refresh(db_return)
    return db_return

@app.put("/returns/{return_id}", response_model=ReturnResponse)
def update_return(return_id: uuid.UUID, return_obj: ReturnUpdate, db: Session = Depends(get_db)):
    db_return = db.query(Return).filter(Return.id == return_id).first()
    if db_return is None:
        raise HTTPException(status_code=404, detail="Return not found")
    
    update_data = return_obj.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_return, field, value)
    
    db.commit()
    db.refresh(db_return)
    return db_return

@app.delete("/returns/{return_id}")
def delete_return(return_id: uuid.UUID, db: Session = Depends(get_db)):
    db_return = db.query(Return).filter(Return.id == return_id).first()
    if db_return is None:
        raise HTTPException(status_code=404, detail="Return not found")
    
    db.delete(db_return)
    db.commit()
    return {"message": "Return deleted successfully"}

# Repairs endpoints
@app.get("/repairs/", response_model=List[RepairResponse])
def get_repairs(skip: int = 0, limit: int = 100, status: Optional[StatusType] = None, priority: Optional[RepairPriority] = None, db: Session = Depends(get_db)):
    query = db.query(Repair)
    if status:
        query = query.filter(Repair.status == status)
    if priority:
        query = query.filter(Repair.priority == priority)
    repairs = query.offset(skip).limit(limit).all()
    return repairs

@app.get("/repairs/{repair_id}", response_model=RepairResponse)
def get_repair(repair_id: uuid.UUID, db: Session = Depends(get_db)):
    repair = db.query(Repair).filter(Repair.id == repair_id).first()
    if repair is None:
        raise HTTPException(status_code=404, detail="Repair not found")
    return repair

@app.post("/repairs/", response_model=RepairResponse)
def create_repair(repair: RepairCreate, db: Session = Depends(get_db)):
    db_repair = Repair(**repair.dict())
    db.add(db_repair)
    db.commit()
    db.refresh(db_repair)
    return db_repair

@app.put("/repairs/{repair_id}", response_model=RepairResponse)
def update_repair(repair_id: uuid.UUID, repair: RepairUpdate, db: Session = Depends(get_db)):
    db_repair = db.query(Repair).filter(Repair.id == repair_id).first()
    if db_repair is None:
        raise HTTPException(status_code=404, detail="Repair not found")
    
    update_data = repair.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_repair, field, value)
    
    db.commit()
    db.refresh(db_repair)
    return db_repair

@app.delete("/repairs/{repair_id}")
def delete_repair(repair_id: uuid.UUID, db: Session = Depends(get_db)):
    db_repair = db.query(Repair).filter(Repair.id == repair_id).first()
    if db_repair is None:
        raise HTTPException(status_code=404, detail="Repair not found")
    
    db.delete(db_repair)
    db.commit()
    return {"message": "Repair deleted successfully"}

# Shipments endpoints
@app.get("/shipments/", response_model=List[ShipmentResponse])
def get_shipments(skip: int = 0, limit: int = 100, type: Optional[ShipmentType] = None, status: Optional[StatusType] = None, db: Session = Depends(get_db)):
    query = db.query(Shipment)
    if type:
        query = query.filter(Shipment.type == type)
    if status:
        query = query.filter(Shipment.status == status)
    shipments = query.offset(skip).limit(limit).all()
    return shipments

@app.get("/shipments/{shipment_id}", response_model=ShipmentResponse)
def get_shipment(shipment_id: uuid.UUID, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment

@app.post("/shipments/", response_model=ShipmentResponse)
def create_shipment(shipment: ShipmentCreate, db: Session = Depends(get_db)):
    db_shipment = Shipment(**shipment.dict())
    db.add(db_shipment)
    db.commit()
    db.refresh(db_shipment)
    return db_shipment

@app.put("/shipments/{shipment_id}", response_model=ShipmentResponse)
def update_shipment(shipment_id: uuid.UUID, shipment: ShipmentUpdate, db: Session = Depends(get_db)):
    db_shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if db_shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    update_data = shipment.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_shipment, field, value)
    
    db.commit()
    db.refresh(db_shipment)
    return db_shipment

@app.delete("/shipments/{shipment_id}")
def delete_shipment(shipment_id: uuid.UUID, db: Session = Depends(get_db)):
    db_shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if db_shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    db.delete(db_shipment)
    db.commit()
    return {"message": "Shipment deleted successfully"}

# Components endpoints
@app.get("/components/", response_model=List[ComponentResponse])
def get_components(skip: int = 0, limit: int = 100, category: Optional[str] = None, low_stock: bool = False, db: Session = Depends(get_db)):
    query = db.query(Component)
    if category:
        query = query.filter(Component.category == category)
    if low_stock:
        query = query.filter(Component.current_stock <= Component.reorder_level)
    components = query.offset(skip).limit(limit).all()
    return components

@app.get("/components/{component_id}", response_model=ComponentResponse)
def get_component(component_id: uuid.UUID, db: Session = Depends(get_db)):
    component = db.query(Component).filter(Component.id == component_id).first()
    if component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    return component

@app.get("/components/sku/{sku}", response_model=ComponentResponse)
def get_component_by_sku(sku: str, db: Session = Depends(get_db)):
    component = db.query(Component).filter(Component.sku == sku).first()
    if component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    return component

@app.post("/components/", response_model=ComponentResponse)
def create_component(component: ComponentCreate, db: Session = Depends(get_db)):
    db_component = Component(**component.dict())
    db.add(db_component)
    db.commit()
    db.refresh(db_component)
    return db_component

@app.put("/components/{component_id}", response_model=ComponentResponse)
def update_component(component_id: uuid.UUID, component: ComponentUpdate, db: Session = Depends(get_db)):
    db_component = db.query(Component).filter(Component.id == component_id).first()
    if db_component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    
    update_data = component.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_component, field, value)
    
    db.commit()
    db.refresh(db_component)
    return db_component

@app.delete("/components/{component_id}")
def delete_component(component_id: uuid.UUID, db: Session = Depends(get_db)):
    db_component = db.query(Component).filter(Component.id == component_id).first()
    if db_component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    
    db.delete(db_component)
    db.commit()
    return {"message": "Component deleted successfully"}

# Repair Components endpoints
@app.get("/repair-components/", response_model=List[RepairComponentResponse])
def get_repair_components(skip: int = 0, limit: int = 100, repair_id: Optional[uuid.UUID] = None, db: Session = Depends(get_db)):
    query = db.query(RepairComponent)
    if repair_id:
        query = query.filter(RepairComponent.repair_id == repair_id)
    repair_components = query.offset(skip).limit(limit).all()
    return repair_components

@app.get("/repair-components/{repair_component_id}", response_model=RepairComponentResponse)
def get_repair_component(repair_component_id: uuid.UUID, db: Session = Depends(get_db)):
    repair_component = db.query(RepairComponent).filter(RepairComponent.id == repair_component_id).first()
    if repair_component is None:
        raise HTTPException(status_code=404, detail="Repair component not found")
    return repair_component

@app.post("/repair-components/", response_model=RepairComponentResponse)
def create_repair_component(repair_component: RepairComponentCreate, db: Session = Depends(get_db)):
    db_repair_component = RepairComponent(**repair_component.dict())
    db.add(db_repair_component)
    db.commit()
    db.refresh(db_repair_component)
    return db_repair_component

@app.delete("/repair-components/{repair_component_id}")
def delete_repair_component(repair_component_id: uuid.UUID, db: Session = Depends(get_db)):
    db_repair_component = db.query(RepairComponent).filter(RepairComponent.id == repair_component_id).first()
    if db_repair_component is None:
        raise HTTPException(status_code=404, detail="Repair component not found")
    
    db.delete(db_repair_component)
    db.commit()
    return {"message": "Repair component deleted successfully"}

# Stock Movements endpoints
@app.get("/stock-movements/", response_model=List[StockMovementResponse])
def get_stock_movements(skip: int = 0, limit: int = 100, component_id: Optional[uuid.UUID] = None, movement_type: Optional[MovementType] = None, db: Session = Depends(get_db)):
    query = db.query(StockMovement)
    if component_id:
        query = query.filter(StockMovement.component_id == component_id)
    if movement_type:
        query = query.filter(StockMovement.movement_type == movement_type.value)
    stock_movements = query.offset(skip).limit(limit).all()
    return stock_movements

@app.get("/stock-movements/{stock_movement_id}", response_model=StockMovementResponse)
def get_stock_movement(stock_movement_id: uuid.UUID, db: Session = Depends(get_db)):
    stock_movement = db.query(StockMovement).filter(StockMovement.id == stock_movement_id).first()
    if stock_movement is None:
        raise HTTPException(status_code=404, detail="Stock movement not found")
    return stock_movement

@app.post("/stock-movements/", response_model=StockMovementResponse)
def create_stock_movement(stock_movement: StockMovementCreate, db: Session = Depends(get_db)):
    # Verify component exists
    component = db.query(Component).filter(Component.id == stock_movement.component_id).first()
    if component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    
    db_stock_movement = StockMovement(**stock_movement.dict())
    db.add(db_stock_movement)
    db.commit()
    db.refresh(db_stock_movement)
    return db_stock_movement

# Budget Entries endpoints
@app.get("/budget-entries/", response_model=List[BudgetEntryResponse])
def get_budget_entries(skip: int = 0, limit: int = 100, category: Optional[str] = None, week_start: Optional[date] = None, db: Session = Depends(get_db)):
    query = db.query(BudgetEntry)
    if category:
        query = query.filter(BudgetEntry.category == category)
    if week_start:
        query = query.filter(BudgetEntry.week_start == week_start)
    budget_entries = query.offset(skip).limit(limit).all()
    return budget_entries

@app.get("/budget-entries/{budget_entry_id}", response_model=BudgetEntryResponse)
def get_budget_entry(budget_entry_id: uuid.UUID, db: Session = Depends(get_db)):
    budget_entry = db.query(BudgetEntry).filter(BudgetEntry.id == budget_entry_id).first()
    if budget_entry is None:
        raise HTTPException(status_code=404, detail="Budget entry not found")
    return budget_entry

@app.post("/budget-entries/", response_model=BudgetEntryResponse)
def create_budget_entry(budget_entry: BudgetEntryCreate, db: Session = Depends(get_db)):
    db_budget_entry = BudgetEntry(**budget_entry.dict())
    db.add(db_budget_entry)
    db.commit()
    db.refresh(db_budget_entry)
    return db_budget_entry

@app.put("/budget-entries/{budget_entry_id}", response_model=BudgetEntryResponse)
def update_budget_entry(budget_entry_id: uuid.UUID, budget_entry: BudgetEntryUpdate, db: Session = Depends(get_db)):
    db_budget_entry = db.query(BudgetEntry).filter(BudgetEntry.id == budget_entry_id).first()
    if db_budget_entry is None:
        raise HTTPException(status_code=404, detail="Budget entry not found")
    
    update_data = budget_entry.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_budget_entry, field, value)
    
    db.commit()
    db.refresh(db_budget_entry)
    return db_budget_entry

@app.delete("/budget-entries/{budget_entry_id}")
def delete_budget_entry(budget_entry_id: uuid.UUID, db: Session = Depends(get_db)):
    db_budget_entry = db.query(BudgetEntry).filter(BudgetEntry.id == budget_entry_id).first()
    if db_budget_entry is None:
        raise HTTPException(status_code=404, detail="Budget entry not found")
    
    db.delete(db_budget_entry)
    db.commit()
    return {"message": "Budget entry deleted successfully"}

# Analytics and reporting endpoints
@app.get("/analytics/repairs/status-summary")
def get_repair_status_summary(db: Session = Depends(get_db)):
    """Get summary of repairs by status"""
    result = db.query(
        Repair.status,
        func.count(Repair.id).label('count'),
        func.sum(Repair.labor_cost + Repair.parts_cost).label('total_cost')
    ).group_by(Repair.status).all()
    
    return [
        {
            "status": row.status,
            "count": row.count,
            "total_cost": float(row.total_cost) if row.total_cost else 0
        }
        for row in result
    ]

@app.get("/analytics/repairs/priority-summary")
def get_repair_priority_summary(db: Session = Depends(get_db)):
    """Get summary of repairs by priority"""
    result = db.query(
        Repair.priority,
        func.count(Repair.id).label('count')
    ).group_by(Repair.priority).all()
    
    return [
        {
            "priority": row.priority,
            "count": row.count
        }
        for row in result
    ]

@app.get("/analytics/components/low-stock")
def get_low_stock_components(db: Session = Depends(get_db)):
    """Get components that are at or below reorder level"""
    components = db.query(Component).filter(
        Component.current_stock <= Component.reorder_level
    ).all()
    
    return [
        {
            "id": comp.id,
            "name": comp.name,
            "sku": comp.sku,
            "current_stock": comp.current_stock,
            "reorder_level": comp.reorder_level,
            "difference": comp.reorder_level - comp.current_stock
        }
        for comp in components
    ]

@app.get("/analytics/shipments/status-summary")
def get_shipment_status_summary(db: Session = Depends(get_db)):
    """Get summary of shipments by status and type"""
    result = db.query(
        Shipment.type,
        Shipment.status,
        func.count(Shipment.id).label('count'),
        func.sum(Shipment.total_units).label('total_units')
    ).group_by(Shipment.type, Shipment.status).all()
    
    return [
        {
            "type": row.type,
            "status": row.status,
            "count": row.count,
            "total_units": row.total_units or 0
        }
        for row in result
    ]

@app.get("/analytics/budget/weekly-summary")
def get_weekly_budget_summary(week_start: date = Query(...), db: Session = Depends(get_db)):
    """Get budget summary for a specific week"""
    entries = db.query(BudgetEntry).filter(BudgetEntry.week_start == week_start).all()
    
    if not entries:
        raise HTTPException(status_code=404, detail="No budget entries found for this week")
    
    total_budgeted = sum(float(entry.budgeted_amount) for entry in entries)
    total_actual = sum(float(entry.actual_amount) for entry in entries)
    
    return {
        "week_start": week_start,
        "week_end": entries[0].week_end if entries else None,
        "total_budgeted": total_budgeted,
        "total_actual": total_actual,
        "variance": total_actual - total_budgeted,
        "variance_percentage": ((total_actual - total_budgeted) / total_budgeted * 100) if total_budgeted > 0 else 0,
        "categories": [
            {
                "category": entry.category,
                "budgeted_amount": float(entry.budgeted_amount),
                "actual_amount": float(entry.actual_amount),
                "variance": float(entry.actual_amount - entry.budgeted_amount),
                "description": entry.description
            }
            for entry in entries
        ]
    }

# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Pentwheel API is running"}

# Main function to run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

# Requirements for this application:
"""
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
python-multipart==0.0.6
"""

# To run this application:
# 1. Install the requirements: pip install -r requirements.txt
# 2. Update the DATABASE_URL with your PostgreSQL connection string
# 3. Run: python main.py or uvicorn main:app --reload
# 4. Access the interactive API docs at: http://localhost:8000/docscomponent

@app.put("/repair-components/{repair_component_id}", response_model=RepairComponentResponse)
def update_repair_component(repair_component_id: uuid.UUID, repair_component: RepairComponentUpdate, db: Session = Depends(get_db)):
    db_repair_component = db.query(RepairComponent).filter(RepairComponent.id == repair_component_id).first()
    if db_repair_component is None:
        raise HTTPException(status_code=404, detail="Repair component not found")
    
    update_data = repair_component.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_repair_component, field, value)
    
    db.commit()
    db.refresh(db_repair_component)
    return db_repair_
