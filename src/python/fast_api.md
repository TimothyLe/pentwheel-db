# Fast API

```
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
```

## Features:

Complete CRUD Operations for All Tables:  

- **Companies** - Customer/supplier management  
- **Returns** - Product return tracking  
- **Repairs** - Service repair management  
- **Shipments** - Incoming/outgoing shipment tracking  
- **Components** - Parts inventory management  
- **Repair Components** - Junction table for repair-part relationships  
- **Stock Movements** - Inventory transaction tracking  
- **Budget Entries** - Weekly budget tracking  

## Advanced Features:

- **Query Parameters** - Filter by status, priority, dates, etc.  
- **Analytics Endpoints** - Summary reports and insights  
- **Low Stock Alerts** - Components below reorder levels  
- **Budget Analysis** - Weekly variance reporting  
- **Proper Error Handling** - 404s and validation errors  
- **Type Safety** - Full Pydantic model validation  

## Special Endpoints:

- `GET /components/sku/{sku}` - Find components by SKU  
- `GET /analytics/repairs/status-summary` - Repair status breakdown  
- `GET /analytics/components/low-stock` - Stock alerts  
- `GET /analytics/budget/weekly-summary` - Budget variance analysis  

## Key Implementation Details:

1. Database Integration - Uses SQLAlchemy ORM with proper relationships  
2. UUID Support - All primary keys use UUIDs as in your schema  
3. Enum Handling - Properly maps your PostgreSQL ENUMs  
4. Computed Fields - Handles generated columns like `total_cost`  
5. Auto-timestamps - Supports `updated_at` triggers  
6. Stock Management - Stock movements automatically update inventory  

## Run Application:

1. Install dependencies:  
```
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-multipart
```
2. Update the DATABASE_URL in the code with your PostgreSQL connection string  
3. Run the application:  
```
uvicorn main:app --reload
```
4. Access the interactive docs at http://localhost:8000/docs

The API follows REST conventions and includes comprehensive filtering, pagination, and analytics capabilities. All endpoints include proper error handling and return structured JSON responses.
