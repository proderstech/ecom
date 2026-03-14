# Belgravia Spirits - Frontend Application

## Overview
This is the frontend application for **Belgravia Spirits**, a premium React-based e-commerce platform offering high-end drinks, groceries, and fast delivery services. The application provides an elegant, modern shopping experience with features such as persistent carts, context-based state management, age verification, and promotional banners. The UI is built entirely using React, CSS Modules, and Vite, prioritizing sleek performance.

## Tech Stack
* **Framework:** [React v18]
* **Build Tool:** [Vite]
* **Styling:** CSS Modules (Standard Vanilla CSS for granular component isolation and design tokens)
* **Routing:** React Router v6
* **Icons:** Lucide React

## Project Architecture and Folder Structure

The frontend is structured systematically for high scalability and maintainability.

```text
frontend/
├── scripts/              # Housekeeping and maintenance scripts (e.g theme migration tools)
├── public/               # Static assets that don't pass through Webpack/Vite build
├── src/
│   ├── assets/           # Directly imported assets (images, SVGs)
│   ├── components/       # Reusable components categorised by domain
│   │   ├── Layout/       # Core layout parts (Header, Footer, Nav)
│   │   └── UI/           # General UI elements (Product Cards, Modals, Buttons)
│   ├── context/          # Global State Management via React Context API (StoreContext.jsx)
│   ├── data/             # Static configurations, constants, and mock database info (products.js)
│   ├── pages/            # Page-level components corresponding and isolated Page CSS Modules
│   ├── App.css           # Global app structure
│   ├── App.jsx           # Root application component and routing hub
│   ├── index.css         # Global CSS Custom Properties (Theme Design Tokens)
│   └── main.jsx          # Entry point and Context/Router Providers
├── index.html            # Main HTML template
├── package.json          # Node dependencies and scripts
└── vite.config.js        # Vite bundler configuration
```

## Key State Management (Context API)
The application avoids third-party stores like Redux in favor of React Context (`src/context/StoreContext.jsx`).
This handles:
- Cart Management (add, remove, clear items)
- Total calculations and shipping logic
- User State (Guest vs Logged In Authentication states)
- Delivery Slot selection

## Global Design System (`src/index.css`)
To maintain consistency and provide a centralized location for theming (such as Light / Dark Mode toggles), the application uses native CSS Variables / Custom Properties declared in `index.css`. This includes properties for brand colors (`--gold`, `--charcoal`, `--white`), gradients, typography (Playfair Display for headings and Inter for body text), rounded corners (`--radius`), shadow profiles and dynamic alpha channels.

## Available Scripts

In the `frontend` directory, you can run:

### `npm run dev`
Runs the app in the development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in your browser. The page will reload when you make changes.

### `npm run build`
Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run lint`
Lints the React source code natively using ESLint configurations to catch potential bugs and maintain code consistency.

## Environment Variables
(If applicable) Any `.env` files should be placed at the root of the `frontend` directory and prefixed with `VITE_` to be exposed to the application.
