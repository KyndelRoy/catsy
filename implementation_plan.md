# Customer Web App Implementation Plan

This plan covers the initialization and initial UI development for the customer-facing web app of the Cafe Clone, built using Next.js 15+, Tailwind CSS, and Shadcn UI.

## Responsive Layout Concept

### Mobile View (Bottom Navigation)
```text
========================================
             [ CAFE LOGO ]              
========================================
... (Page Content) ...
========================================
 [ Home ] [ Order ] [ Menu ] [ Rewards ] [ Account ]
========================================
```

### Web/Desktop View (Top Navigation)
```text
========================================
 [LOGO]   [Home] [Order] [Menu] [Rewards] [Account]
========================================
... (Page Content) ...
========================================
```

## Lofi Page Designs (Common Content)

### 1. Home Page
```text
[        Good morning, User!             ]
========================================
 OUR LOCATION
 [ Map Pin Icon ] 123 Tagum City St.
 [ View on Map ]
========================================
 FEATURED PRODUCTS
 
 +------------------------+
 | [   Image: Latte   ]   |
 | Special Iced Latte     |
 | P150.00                |
 | [ VIEW MENU ]          |
 +------------------------+
```

### 2. Menu Page
```text
 SEARCH: [ Find coffee, pastries...    ]
========================================
 CATEGORIES (Scroll ->)
 ( All ) ( Coffee ) ( Pastries ) ( Meals )
========================================
 MENU ITEMS
 
 +--------------+   +--------------+   +--------------+
 | [ Image ]    |   | [ Image ]    |   | [ Image ]    |
 | Americano    |   | Croissant    |   | Espresso     |
 | P110.00      |   | P85.00       |   | P90.00       |
 | [ + ]        |   | [ + ]        |   | [ + ]        |
 +--------------+   +--------------+   +--------------+
========================================
 [ CART (2 items) - P195.00  [ CHECKOUT ] ]
```

### 3. Order Page
```text
            YOUR ORDERS                 
========================================
 [ Active ] [ History ]
 
 [ ID: #CF-8X2Y ] - Preparing
 1x Iced Latte
 1x Glazed Donut
 [ View Receipt ]
```

### 4. Rewards Page
```text
            YOUR REWARDS                
========================================
 Stamps: 5/9

   [ █ ] [ █ ] [ █ ]
   [ █ ] [ █ ] [ _ ]
   [ _ ] [ _ ] [ _ ]

 [ REWARDS POOL ]
  - [ ] Free Coffee (9/9)
  - [x] 10% Off Pastry (5/9)

 [ CLAIM REWARD ]
```

### 5. Account Page
```text
            MY ACCOUNT                  
========================================
 [ User Avatar ]
 User Name | user@email.com
========================================
 [ Edit Profile ]
 [ Payment Methods ]
 [ Notification Settings ]
 [ Help & Support ]
========================================
 [ LOGOUT ]
```

## Proposed Changes

### 1. Project Initialization
- Initialize a new Next.js 15+ project in the `/home/roy/Documents/Coding Projects/cafe-clone` directory.
- Will use `npx create-next-app@latest .` with TypeScript, Tailwind CSS, App Router, and ESLint.
- Configure `shadcn-ui`.

### 2. Implementation Steps
- **Responsive Navigation**: 
  - Implementation of a `Navbar` component that hides on mobile and shows on desktop (Top Nav).
  - Implementation of a `MobileNav` component that shows on mobile and hides on desktop (Bottom Nav).
- **Page Routing**: Standard Next.js file-based routing for `/`, `/order`, `/menu`, `/rewards`, and `/account`.
- **Styling**: Tailwind CSS media queries (`hidden md:flex`, `flex md:hidden`) to toggle navigation versions.

## User Review Required
> [!IMPORTANT]
> I will delete the existing `index.html` file before initializing the Next.js app to avoid conflicts. Confirm if this is alright.
