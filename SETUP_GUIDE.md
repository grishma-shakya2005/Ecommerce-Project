# Getting Started with Palpali E-Commerce

## Project Overview

This is a **professional, production-ready e-commerce platform** built for Palpali Dhaka Authentic Textiles.

### Tech Stack Summary
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Zustand
- **Backend**: Node.js + Express + MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **Design**: Google Stitch MCP Integration

---

## Installation & Setup

### Prerequisites
- Node.js 16+ ([Download](https://nodejs.org/))
- MongoDB ([Local](https://docs.mongodb.com/manual/installation/) or [Atlas Cloud](https://www.mongodb.com/cloud/atlas))
- VS Code or Cursor

### Step 1: Install Dependencies

```bash
# From project root
npm run install-all
```

This installs packages for both client and server.

### Step 2: Configure Environment Variables

**Server Configuration** - Create `server/.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/palpali

# Authentication
JWT_SECRET=your-super-secret-key-change-this-in-production

# Server
PORT=5000
NODE_ENV=development

# Client
CLIENT_URL=http://localhost:5173
```

### Step 3: Start Development Servers

```bash
npm run dev
```

This runs:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

---

## Project Structure

```
palpali-ecommerce/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx          # Navigation header
│   │   │   ├── Footer.tsx          # Footer
│   │   │   └── ProductGrid.tsx     # Product listing
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Landing page
│   │   │   ├── Products.tsx        # Products page
│   │   │   ├── ProductDetail.tsx   # Single product
│   │   │   ├── Cart.tsx            # Shopping cart
│   │   │   ├── Checkout.tsx        # Checkout form
│   │   │   ├── OrderConfirmation.tsx
│   │   │   ├── About.tsx           # About page
│   │   │   └── Contact.tsx         # Contact page
│   │   ├── stores/
│   │   │   └── cartStore.ts        # Zustand cart state
│   │   ├── App.tsx                 # Main router
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.ts             # User schema + auth methods
│   │   │   ├── Product.ts          # Product schema
│   │   │   └── Order.ts            # Order schema
│   │   ├── routes/
│   │   │   ├── auth.ts             # Auth endpoints
│   │   │   ├── products.ts         # Product endpoints
│   │   │   ├── orders.ts           # Order endpoints
│   │   │   ├── cart.ts             # Cart endpoints
│   │   │   └── users.ts            # User endpoints
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT protection
│   │   │   └── errorHandler.ts     # Error handling
│   │   ├── index.ts                # Server entry point
│   │   └── tsconfig.json
│   ├── package.json
│   └── .env                        # Environment config
│
├── .vscode/
│   └── mcp.json                    # Google Stitch MCP config
│
├── .gitignore
├── package.json                    # Root monorepo config
└── README.md
```

---

## Key Features

### Frontend Features
✅ **Responsive Design** - Mobile-first Tailwind CSS  
✅ **Product Catalog** - Browse and search products  
✅ **Shopping Cart** - LocalStorage-based persistence  
✅ **Checkout Flow** - Complete order form  
✅ **User Auth** - Register, login, profile  
✅ **Order Tracking** - Order confirmation page  

### Backend Features
✅ **REST API** - RESTful endpoints  
✅ **Authentication** - JWT + password hashing  
✅ **Database** - MongoDB with Mongoose ODM  
✅ **Validation** - Input validation with express-validator  
✅ **Error Handling** - Centralized error middleware  
✅ **Security** - CORS, password hashing, JWT tokens  

---

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}

Response: { "token": "jwt_token", "user": {...} }
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: { "token": "jwt_token", "user": {...} }
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?category=sarees&search=silk&page=1&limit=12
```

#### Get Single Product
```http
GET /api/products/:id
```

#### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer token
Content-Type: application/json

{
  "name": "Silk Saree",
  "description": "...",
  "price": 99.99,
  "category": "sarees",
  "images": ["url1", "url2"],
  "stock": 50,
  "sku": "SKU-001"
}
```

### Order Endpoints

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "customer": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+970123456789",
    "address": "123 Street",
    "city": "Dhaka",
    "state": "Dhaka",
    "zipCode": "1200"
  },
  "items": [
    {
      "productId": "123",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "total": 219.98,
  "tax": 22.00,
  "shipping": 10.00
}
```

#### Get Orders
```http
GET /api/orders
```

#### Get Single Order
```http
GET /api/orders/:id
```

### User Endpoints

#### Get Current User (Protected)
```http
GET /api/users/me
Authorization: Bearer token
```

#### Update Profile (Protected)
```http
PATCH /api/users/me
Authorization: Bearer token
Content-Type: application/json

{
  "firstName": "Jane",
  "phone": "+970987654321",
  "address": "456 Avenue"
}
```

---

## Database Schema

### User
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  role: String (customer | admin),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  discountedPrice: Number,
  category: String,
  images: [String],
  stock: Number,
  sku: String (unique),
  rating: Number,
  reviews: [{
    userId: String,
    comment: String,
    rating: Number,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  customer: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  items: [{
    productId: String,
    quantity: Number,
    price: Number
  }],
  total: Number,
  tax: Number,
  shipping: Number,
  status: String (pending | confirmed | shipped | delivered | cancelled),
  paymentMethod: String (cod | esewa | khalti | mobile_banking | card),
  bankName: String (for mobile_banking orders),
  paymentStatus: String (pending | paid | failed),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Development Workflow

### Adding a New Page

1. Create component in `client/src/pages/NewPage.tsx`
2. Add route in `client/src/App.tsx`
3. Update Header navigation if needed

### Adding a New API Endpoint

1. Create route file in `server/src/routes/`
2. Import and register in `server/src/index.ts`
3. Use middleware for auth/validation

### Adding a New Product Feature

1. Update `Product` model in `server/src/models/Product.ts`
2. Update API endpoint in `server/src/routes/products.ts`
3. Update React component in `client/src/components/`

---

## Styling with Tailwind

### Color Palette
- **Primary**: `bg-primary` (#8B4513) - Brown
- **Secondary**: `bg-secondary` (#D2691E) - Chocolate
- **Accent**: `bg-accent` (#F4A460) - Sandy Brown

### Custom Classes (in `client/src/index.css`)
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-outline` - Outline button
- `.card` - Card component
- `.input-base` - Input field

---

## Google Stitch Integration

MCP server is configured in `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "google-stitch": {
      "command": "npx.cmd",
      "args": ["-y", "@_davideast/stitch-mcp", "proxy"],
      "env": {
        "STITCH_API_KEY": "your-api-key"
      }
    }
  }
}
```

Use Stitch MCP tools in VS Code with:
- `generate_screen_from_text` - Generate UI from prompts
- `get_screen_code` - Fetch HTML code
- `list_projects` - List Stitch projects

---

## Performance Optimization

- Cart stored in localStorage (no server calls)
- Product images lazy-loaded
- Code splitting with React Router
- Mongoose indexing on frequently queried fields
- CORS headers optimized

---

## Security Considerations

✅ Passwords hashed with bcryptjs (10 rounds)  
✅ JWT tokens (30-day expiration)  
✅ Protected routes with auth middleware  
✅ Input validation on all endpoints  
✅ CORS configured  
✅ Environment variables for secrets  

---

## Deployment Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Use production MongoDB URI
- [ ] Set `NODE_ENV=production`
- [ ] Build frontend: `npm run client:build`
- [ ] Serve static files from Express
- [ ] Set up HTTPS
- [ ] Configure domain CORS
- [ ] Set up error logging
- [ ] Configure email notifications

---

## Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB (Windows)
net start MongoDB
```

### Port Already in Use
```bash
# Change port in server/.env
PORT=5001
```

### CORS Errors
Update `CLIENT_URL` in `server/.env` to match your frontend URL.

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm run install-all
```

---

## Next Steps

1. ✅ Setup complete
2. 📝 Add sample products to MongoDB
3. 🎨 Customize Tailwind colors
4. 💳 Integrate payment processing
5. 📧 Setup email notifications
6. 🚀 Deploy to production

---

## Support & Resources

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Express.js](https://expressjs.com)
- [MongoDB](https://docs.mongodb.com)
- [Google Stitch](https://stitch.withgoogle.com)

---

Built with ❤️ for Palpali Dhaka Authentic Textiles
