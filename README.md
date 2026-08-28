# Ball & Bearing Hub

Basic B2B catalog for ball and bearing products. Angular frontend, Node.js/Express API, SQLite database.

## Run on your local machine

You need Node.js installed (v18 or newer). Open two terminals.

### 1. Start the API and database

```powershell
cd C:\Users\ANUPAMA\bearing-catalog\backend
npm install
npm start
```

This starts:

- API: http://localhost:3000
- Database admin UI: http://localhost:3000/admin
- SQLite file: `C:\Users\ANUPAMA\bearing-catalog\backend\data\bearings.db`

### 2. Start the website

```powershell
cd C:\Users\ANUPAMA\bearing-catalog\frontend
npm install
npm start
```

Catalog site: http://localhost:4200

The Angular app talks to the API through `/api/...`. After you add a product in the admin UI, refresh the catalog to see it.

## Database admin

Open http://localhost:3000/admin to:

- Add, edit, and delete products
- Browse `products`, `enquiries`, and `filter_options`
- Run SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`)
- Add filter values for A, B, C, D

## Add and retrieve data through API calls

### List products (what the website uses)

```powershell
curl http://localhost:3000/api/products
```

Filter:

```powershell
curl "http://localhost:3000/api/products?brand=SKF&type=Deep%20Groove%20Ball%20Bearing"
```

One product:

```powershell
curl http://localhost:3000/api/products/1
```

### Add a product

```powershell
curl -X POST http://localhost:3000/api/products -H "Content-Type: application/json" -d "{
  \"sku\": \"6206-2RS\",
  \"name\": \"Deep Groove Ball Bearing 6206-2RS\",
  \"brand\": \"SKF\",
  \"type\": \"Deep Groove Ball Bearing\",
  \"description\": \"Sealed 6206 bearing for motors.\",
  \"priceMin\": 3.2,
  \"priceMax\": 7.5,
  \"moq\": 10,
  \"material\": \"Chrome steel\",
  \"innerDiameter\": \"30 mm\",
  \"outerDiameter\": \"62 mm\",
  \"imageUrl\": \"/images/bearing-1.svg\",
  \"filterA\": \"A1\",
  \"filterB\": \"B1\",
  \"filterC\": \"C1\",
  \"filterD\": \"D1\"
}"
```

### Update / delete a product

```powershell
curl -X PUT http://localhost:3000/api/products/1 -H "Content-Type: application/json" -d "{ ...same fields as add... }"
curl -X DELETE http://localhost:3000/api/products/1
```

### Run any SQL through the API

```powershell
curl -X POST http://localhost:3000/api/db/query -H "Content-Type: application/json" -d "{\"sql\": \"SELECT sku, brand, type FROM products\"}"
```

Or from the backend folder:

```powershell
npm run query -- "SELECT * FROM products WHERE brand = 'SKF'"
```

### Filters A–D

```powershell
curl http://localhost:3000/api/filters
curl -X POST http://localhost:3000/api/filters -H "Content-Type: application/json" -d "{\"category\":\"A\",\"value\":\"A4\"}"
```

## Tables

| Table | Purpose |
| --- | --- |
| `products` | Catalog items shown on the website |
| `enquiries` | Enquire now form submissions |
| `filter_options` | Values for filters A, B, C, D |

Delete `backend\data\bearings.db` and restart the API only if you want to reset to the original sample products.
