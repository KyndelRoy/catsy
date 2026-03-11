# Catsy Coffee Frontend Architecture

This document briefly outlines the frontend architecture of the Catsy Coffee application, specifically focusing on the home page structure and how it adheres to SOLID software engineering principles.

## Structure and Responsibilities

The application's home page (`src/app/page.tsx`) acts strictly as a composition layout, delegating rendering logic and state management to individual section components located in `src/components/home/`. 

This modular approach ensures each component has a Single Responsibility (SRP).

### Components

*   **`HeroSection`**: Renders the static hero banner and primary business logo.
*   **`GreetingSection`**: Manages the dynamic "time-of-day" greeting state and displays the primary Quick Action routing buttons (Reserve, Order, Menu, Rewards).
*   **`AboutSection`**: Displays static business information and manages the dynamic "Open/Closed" store status indicator based on current local time.
*   **`FeaturedProductsSection`**: Responsible for querying the mock datastore for featured products and rendering the horizontal product UI carousel.
*   **`LocationMap` (`src/components/location-map.tsx`)**: Handles the integration with `react-leaflet` to display the interactive map and dynamic location card.
*   **`Footer` (`src/components/footer.tsx`)**: Reusable global footer component.

## SOLID Principles Applied

1.  **Single Responsibility Principle (SRP)**:
    *   Previously, `page.tsx` handled data filtering, time-based state logic, and the UI markup for six completely different visual sections. 
    *   By isolating these into dedicated components (e.g., extracting the `useEffect` time logic entirely into `GreetingSection` and `AboutSection`), components now only have *one reason to change*.
    *   `LocationCard` was extracted from the render flow of `LocationMap` to prevent it from being unnecessarily redeclared and recreated on every parent re-render, optimizing memory and improving React tree reconciliation.

2.  **Open/Closed Principle (OCP)**:
    *   The `HomePage` component is now open for extension (adding new sections is as simple as dropping a new component into the layout) but closed for modification (you no longer need to edit the complex internal markup of the page just to change how a specific section functions).

This architecture provides a scalable, readable, and highly maintainable foundation for future feature development.
