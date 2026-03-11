# ResQHub – Emergency Assistance Platform

## System Architecture

The application follows a **three-tier full-stack architecture**:

```
           User (Browser)
                 │
                 ▼
        React Frontend (Vite)
        Hosted on Render
                 │
        REST API Requests
                 │
                 ▼
        FastAPI Backend (Python)
        Hosted on Render
                 │
          SQLAlchemy ORM
                 │
                 ▼
        PostgreSQL Database
        Hosted on Render
```

## Component Description

### Frontend

* Built using **React + Vite**
* Provides UI pages:

  * Emergency contacts
  * First aid guides
  * Map & nearby hospitals
  * Emergency profile
  * Admin panel
* Communicates with backend using **REST API requests**

### Backend

* Built using **FastAPI (Python)**
* Handles:

  * Emergency contacts API
  * SOS alert logging
  * Emergency profile storage
  * Nearby hospital lookup (OpenStreetMap)

### Database

* **PostgreSQL database**
* Stores:

  * Emergency contacts
  * User profiles
  * SOS logs
  * First aid guide data

### Deployment

* **Frontend:** Render (Static Web Service)
* **Backend:** Render (Web Service)
* **Database:** Render PostgreSQL

## Data Flow

```
User Action
     │
     ▼
React UI (Admin Panel / Forms)
     │
HTTP Request (fetch)
     │
     ▼
FastAPI REST API
     │
SQLAlchemy ORM
     │
     ▼
PostgreSQL Database
     │
     ▼
Response → Frontend UI Update
```
