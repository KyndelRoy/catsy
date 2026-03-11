# Kapetayo Frontend



## Core Technology Stack


*   **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) utilizing the latest Turbopack for optimized development cycles.
*   **Language**: [TypeScript](https://www.typescriptlang.org/) for strict type safety and enhanced developer experience.
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with PostCSS integration for high-performance, utility-first design.
*   **UI Components**: A custom implementation based on [shadcn/ui](https://ui.shadcn.com/) and [Base UI](https://base-ui.com/react/components), ensuring accessible and consistent interface patterns.
*   **Icons**: [Lucide React](https://lucide.dev/) for a consistent, lightweight SVG icon library.
*   **Maps**: [Leaflet](https://leafletjs.com/) with React integration for location-based services.

## Project Structure

The codebase follows a modular architecture within the `src` directory to maintain clear separation of concerns:

```text
src/
├── app/              # Next.js App Router pages and layouts
│   ├── account/      # User profile and settings
│   ├── menu/         # Product catalog and discovery
│   ├── order/        # Checkout and order management
│   ├── rewards/      # Loyalty program interface
│   └── (auth)/       # Authentication flows (Login/Signup)
├── components/       # UI component library
│   └── ui/           # Atomic shadcn-based components
├── context/          # React Context providers (Auth, Cart)
├── lib/              # Utility functions and shared logic
└── types/            # Global TypeScript definitions
```

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm, pnpm, or bun

### Installation
Clone the repository and install dependencies within the `frontend` directory:

```bash
npm install
```

### Development
Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Development Guidelines

- **Component Design**: Follow atomic design principles when adding new components to `src/components/ui`.
- **Type Safety**: Ensure all new features are strictly typed. Avoid the use of `any`.
- **Styling**: Prefer utility classes for layout and spacing. Complex animations should be handled via `tw-animate-css` or Framer Motion where applicable.
