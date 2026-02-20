# F1 Resource Manager - API Documentation

## Overview

This document describes the REST API endpoints for the F1 Resource Manager application. All endpoints require proper authentication and authorization through Supabase Auth.

## Authentication

All API endpoints require authentication via Supabase Auth. Users must be logged in to access protected endpoints.

### Authentication Headers

```http
Authorization: Bearer <your-jwt-token>
```

### Error Responses

All endpoints return standard HTTP status codes:

- `200` - Success
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Server error

## Catalog Endpoints

### Drivers

#### GET /api/drivers

Retrieve all drivers from the catalog.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Driver Name",
    "rarity": 3,
    "series": 6,
    "season_id": "uuid",
    "stats_per_level": [
      {
        "speed": 10,
        "cornering": 8,
        "powerUnit": 9,
        "qualifying": 7,
        "drs": 5,
        "pitStopTime": 15,
        "cardsToUpgrade": 10,
        "softCurrencyToUpgrade": 500
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/drivers/[id]

Retrieve a specific driver by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "Driver Name",
  "rarity": 3,
  "series": 6,
  "season_id": "uuid",
  "stats_per_level": [...],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### GET /api/drivers/user

Retrieve user's driver collection with ownership data.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Driver Name",
    "rarity": 3,
    "series": 6,
    "season_id": "uuid",
    "stats_per_level": [...],
    "user_driver": {
      "level": 5,
      "card_count": 10,
      "bonus_percent": 10
    }
  }
]
```

### Car Parts

#### GET /api/car-parts

Retrieve all car parts from the catalog.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Engine Name",
    "rarity": 2,
    "series": 6,
    "season_id": "uuid",
    "car_part_type": 5,
    "stats_per_level": [
      {
        "speed": 8,
        "cornering": 9,
        "powerUnit": 10,
        "qualifying": 6,
        "drs": 4,
        "pitStopTime": 12,
        "cardsToUpgrade": 8,
        "softCurrencyToUpgrade": 300
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/car-parts/[id]

Retrieve a specific car part by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "Engine Name",
  "rarity": 2,
  "series": 6,
  "season_id": "uuid",
  "car_part_type": 5,
  "stats_per_level": [...],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### GET /api/car-parts/user

Retrieve user's car parts collection with ownership data.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Engine Name",
    "rarity": 2,
    "series": 6,
    "season_id": "uuid",
    "car_part_type": 5,
    "stats_per_level": [...],
    "user_car_part": {
      "level": 3,
      "card_count": 5,
      "bonus_percent": 5
    }
  }
]
```

### Boosts

#### GET /api/boosts

Retrieve all boosts from the catalog.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Boost Name",
    "icon": "boost_icon_name",
    "boost_stats": {
      "overtake": 1,
      "block": 2,
      "corners": 1,
      "tyreUse": 1,
      "powerUnit": 1,
      "speed": 1,
      "pitStop": 1,
      "raceStart": 1
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/boosts/[id]

Retrieve a specific boost by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "Boost Name",
  "icon": "boost_icon_name",
  "boost_stats": {...},
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### GET /api/boosts/custom-names

Retrieve custom boost names (admin only).

**Response:**
```json
[
  {
    "boost_id": "uuid",
    "custom_name": "Custom Boost Name",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### PUT /api/boosts/[id]/custom-name

Update custom boost name (admin only).

**Request Body:**
```json
{
  "custom_name": "New Custom Name"
}
```

**Response:**
```json
{
  "message": "Custom name updated successfully"
}
```

### Seasons

#### GET /api/seasons

Retrieve all seasons.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Season 6",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/seasons/[id]

Retrieve a specific season by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "Season 6",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## User Data Endpoints

### User Assets

#### GET /api/user-assets

Retrieve all user assets (catalog items with user ownership data).

**Query Parameters:**
- `season_id` (optional): Filter by season
- `rarity` (optional): Filter by rarity
- `card_type` (optional): Filter by card type
- `owned` (optional): Filter by ownership status
- `search` (optional): Search by name
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 100)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Item Name",
      "rarity": 3,
      "series": 6,
      "season_id": "uuid",
      "user_level": 5,
      "user_card_count": 10,
      "user_bonus_percent": 10
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 50,
    "total_pages": 1
  }
}
```

### User Items

#### GET /api/user-items

Retrieve user's owned items.

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "catalog_item_id": "uuid",
    "level": 5,
    "card_count": 10,
    "bonus_percent": 10,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/user-items

Add an item to user's collection.

**Request Body:**
```json
{
  "catalog_item_id": "uuid",
  "level": 5,
  "card_count": 10,
  "bonus_percent": 10
}
```

**Response:**
```json
{
  "message": "Item added to collection successfully"
}
```

#### PUT /api/user-items/[id]

Update user's item data.

**Request Body:**
```json
{
  "level": 6,
  "card_count": 5,
  "bonus_percent": 15
}
```

**Response:**
```json
{
  "message": "Item updated successfully"
}
```

#### DELETE /api/user-items/[id]

Remove item from user's collection.

**Response:**
```json
{
  "message": "Item removed from collection successfully"
}
```

### User Boosts

#### GET /api/user-boosts

Retrieve user's owned boosts.

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "boost_id": "uuid",
    "count": 5,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/user-boosts

Add boost to user's collection.

**Request Body:**
```json
{
  "boost_id": "uuid",
  "count": 5
}
```

**Response:**
```json
{
  "message": "Boost added to collection successfully"
}
```

#### PUT /api/user-boosts/[id]

Update user's boost count.

**Request Body:**
```json
{
  "count": 10
}
```

**Response:**
```json
{
  "message": "Boost count updated successfully"
}
```

#### DELETE /api/user-boosts/[id]

Remove boost from user's collection.

**Response:**
```json
{
  "message": "Boost removed from collection successfully"
}
```

## Advanced Feature Endpoints

### Car Setups

#### GET /api/setups

Retrieve user's saved car setups.

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Race Setup",
    "notes": "Optimal setup for race conditions",
    "max_series": 6,
    "bonus_percent": 10,
    "brake_id": "uuid",
    "gearbox_id": "uuid",
    "rear_wing_id": "uuid",
    "front_wing_id": "uuid",
    "suspension_id": "uuid",
    "engine_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/setups

Create a new car setup.

**Request Body:**
```json
{
  "name": "Race Setup",
  "notes": "Optimal setup for race conditions",
  "max_series": 6,
  "bonus_percent": 10,
  "brake_id": "uuid",
  "gearbox_id": "uuid",
  "rear_wing_id": "uuid",
  "front_wing_id": "uuid",
  "suspension_id": "uuid",
  "engine_id": "uuid"
}
```

**Response:**
```json
{
  "message": "Setup created successfully",
  "setup_id": "uuid"
}
```

#### PUT /api/setups/[id]

Update a car setup.

**Request Body:**
```json
{
  "name": "Updated Race Setup",
  "notes": "Updated optimal setup",
  "max_series": 7,
  "bonus_percent": 15
}
```

**Response:**
```json
{
  "message": "Setup updated successfully"
}
```

#### DELETE /api/setups/[id]

Delete a car setup.

**Response:**
```json
{
  "message": "Setup deleted successfully"
}
```

### Track Guides

#### GET /api/track-guides

Retrieve user's track guides.

**Query Parameters:**
- `track_id` (optional): Filter by track
- `gp_level` (optional): Filter by GP level

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "track_id": "uuid",
    "gp_level": 1,
    "driver_ids": ["uuid", "uuid"],
    "boost_recommendations": {
      "primary_boost": "uuid",
      "alternate_boosts": ["uuid", "uuid"]
    },
    "car_setup_id": "uuid",
    "dry_tire_strategy": "3m3m2s",
    "wet_tire_strategy": "10w",
    "notes": "Track strategy notes",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/track-guides

Create a new track guide.

**Request Body:**
```json
{
  "track_id": "uuid",
  "gp_level": 1,
  "driver_ids": ["uuid", "uuid"],
  "boost_recommendations": {
    "primary_boost": "uuid",
    "alternate_boosts": ["uuid", "uuid"]
  },
  "car_setup_id": "uuid",
  "dry_tire_strategy": "3m3m2s",
  "wet_tire_strategy": "10w",
  "notes": "Track strategy notes"
}
```

**Response:**
```json
{
  "message": "Track guide created successfully",
  "guide_id": "uuid"
}
```

#### PUT /api/track-guides/[id]

Update a track guide.

**Request Body:**
```json
{
  "driver_ids": ["uuid", "uuid", "uuid"],
  "dry_tire_strategy": "4m2m2s",
  "notes": "Updated strategy"
}
```

**Response:**
```json
{
  "message": "Track guide updated successfully"
}
```

#### DELETE /api/track-guides/[id]

Delete a track guide.

**Response:**
```json
{
  "message": "Track guide deleted successfully"
}
```

### Tracks

#### GET /api/tracks

Retrieve all tracks.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Monza",
    "alt_name": "Temple of Speed",
    "laps": 53,
    "driver_track_stat": "defending",
    "car_track_stat": "speed",
    "season_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/tracks/[id]

Retrieve a specific track by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "Monza",
  "alt_name": "Temple of Speed",
  "laps": 53,
  "driver_track_stat": "defending",
  "car_track_stat": "speed",
  "season_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Admin Endpoints

### Data Import/Export

#### POST /api/admin/import

Import data from external sources (admin only).

**Request Body:**
```json
{
  "data_type": "drivers|car_parts|boosts",
  "data": [...]
}
```

**Response:**
```json
{
  "message": "Data imported successfully",
  "imported_count": 50
}
```

#### GET /api/export-collection

Export user's collection data.

**Response:**
```json
{
  "exportedAt": "2024-01-01T00:00:00Z",
  "userItems": [
    {
      "catalog_item_id": "uuid",
      "level": 5,
      "card_count": 10,
      "bonus_percent": 10
    }
  ],
  "userBoosts": [
    {
      "boost_id": "uuid",
      "count": 5
    }
  ]
}
```

#### POST /api/import-collection

Import collection data.

**Request Body:**
```json
{
  "userItems": [...],
  "userBoosts": [...]
}
```

**Response:**
```json
{
  "message": "Collection imported successfully"
}
```

#### GET /api/export-admin-data

Export admin data (custom boost names, free boost flags).

**Response:**
```json
{
  "exportedAt": "2024-01-01T00:00:00Z",
  "boostCustomNames": [
    {
      "boost_id": "uuid",
      "custom_name": "Custom Name"
    }
  ]
}
```

#### POST /api/import-admin-data

Import admin data (admin only).

**Request Body:**
```json
{
  "boostCustomNames": [...]
}
```

**Response:**
```json
{
  "message": "Admin data imported successfully"
}
```

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

#### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

#### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

#### 500 Server Error
```json
{
  "error": "Internal server error"
}
```

### Validation Errors

```json
{
  "error": "Validation failed",
  "details": {
    "field_name": "Error message"
  }
}
```

## Rate Limiting

All endpoints are subject to rate limiting:

- **Standard endpoints**: 100 requests per minute
- **Admin endpoints**: 50 requests per minute
- **Import/Export endpoints**: 10 requests per minute

## CORS

All API endpoints support CORS for the following origins:
- `https://your-app.vercel.app`
- `http://localhost:3000`

## Versioning

This API follows semantic versioning. Breaking changes will result in a new major version.

Current version: `v1`