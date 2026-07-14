## Listings Feature (Create, Edit, Delete)

Users can create "Offer" or "Request" listings, view their own listings,
and edit or delete only the listings they created.

### Pages (client)
- `/create-listing` — form to create a new offer/request listing
- `/my-listings` — view your own listings, with Edit and Delete actions

### API Endpoints (server)
| Method | Endpoint              | Access     | Description                        |
|--------|------------------------|------------|-------------------------------------|
| GET    | `/api/listings`        | Public     | Browse all active listings          |
| GET    | `/api/listings/mine`   | Protected  | Get the logged-in user's listings   |
| POST   | `/api/listings`        | Protected  | Create a new listing                |
| PUT    | `/api/listings/:id`    | Protected  | Edit a listing (owner only)         |
| DELETE | `/api/listings/:id`    | Protected  | Delete a listing (owner only)       |

"Protected" routes require a valid JWT in the request header:
```
Authorization: Bearer <token>
```

Edit and delete both check that `listing.userId` matches the logged-in
user (`req.userId`) before allowing the action — if someone tries to
edit/delete a listing that isn't theirs, they get a `403 Forbidden`
response.

### Listing model fields
- `userId` — who created the listing (ref to User)
- `type` — `"offer"` or `"request"`
- `title`, `category`, `description`
- `availability` — free text, e.g. "Weekends, 4-6 PM"
- `radiusKm` — default 5
- `status` — `"active"`, `"matched"`, or `"closed"`
- `createdAt`

### Try it locally
1. Sign up / log in (`/signup`, `/login`)
2. Create a listing at `/create-listing`
3. View, edit, or delete it at `/my-listings`## Listings Feature (Create, Edit, Delete)

Users can create "Offer" or "Request" listings, view their own listings,
and edit or delete only the listings they created.

### Pages (client)
- `/create-listing` — form to create a new offer/request listing
- `/my-listings` — view your own listings, with Edit and Delete actions

### API Endpoints (server)
| Method | Endpoint              | Access     | Description                        |
|--------|------------------------|------------|-------------------------------------|
| GET    | `/api/listings`        | Public     | Browse all active listings          |
| GET    | `/api/listings/mine`   | Protected  | Get the logged-in user's listings   |
| POST   | `/api/listings`        | Protected  | Create a new listing                |
| PUT    | `/api/listings/:id`    | Protected  | Edit a listing (owner only)         |
| DELETE | `/api/listings/:id`    | Protected  | Delete a listing (owner only)       |

"Protected" routes require a valid JWT in the request header:
```
Authorization: Bearer <token>
```

Edit and delete both check that `listing.userId` matches the logged-in
user (`req.userId`) before allowing the action — if someone tries to
edit/delete a listing that isn't theirs, they get a `403 Forbidden`
response.

### Listing model fields
- `userId` — who created the listing (ref to User)
- `type` — `"offer"` or `"request"`
- `title`, `category`, `description`
- `availability` — free text, e.g. "Weekends, 4-6 PM"
- `radiusKm` — default 5
- `status` — `"active"`, `"matched"`, or `"closed"`
- `createdAt`

### Try it locally
1. Sign up / log in (`/signup`, `/login`)
2. Create a listing at `/create-listing`
3. View, edit, or delete it at `/my-listings`