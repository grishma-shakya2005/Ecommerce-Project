# Palpali E-Commerce Platform

Professional e-commerce platform for Palpali Dhaka Authentic Textiles built with React, Tailwind CSS, Node.js, Express, and MongoDB.

## Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand stores
│   │   └── App.tsx        # Root component
│   ├── public/            # Static assets
│   └── index.html
│
├── server/                # Express backend
│   ├── src/
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── index.ts       # Entry point
│   └── tsconfig.json
│
└── package.json           # Monorepo scripts
```

## Quick Start

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Configure Environment

**Server** - Create `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/palpali
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
```

### 3. Start Development
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Features

✅ Product catalog with filtering  
✅ Shopping cart (client-side storage)  
✅ Checkout & order management  
✅ User authentication with JWT  
✅ Responsive Tailwind design  
✅ Type-safe TypeScript  
✅ Error handling & validation  
✅ RESTful API  

## API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/orders` - Create order
- `GET /api/users/me` - Get user profile

## Design System

Palpali brand colors:
- **Primary**: #8B4513 (Brown)
- **Secondary**: #D2691E (Chocolate)
- **Accent**: #F4A460 (Sandy)

## License

MIT © Palpali
