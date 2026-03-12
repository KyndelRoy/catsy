# Catsy Coffee - Lo-Fi Character Based Design

This document represents the character-based (ASCII) lo-fi structural design of the Catsy Coffee frontend application based on the current layout in `src/app`, `src/components`, and `src/context`.

---

## 🖥️ Web View (Desktop & Tablet)

```text
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ Logo ] Catsy Coffee                        [Home]  [Order]  [Menu]  [Rewards]  [Account]       |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                                                                                                   |
|                                     [ Hero Section ]                                              |
|                           +----------------------------------+                                    |
|                           |      Welcome to Catsy Coffee     |                                    |
|                           |   Brewing passion every single   |                                    |
|                           |   day for our lovely customers.  |                                    |
|                           +----------------------------------+                                    |
|                                                                                                   |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ Greeting Section ]                                                                             |
|  Hello there! / Good morning, [User]!                                                             |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ About Section ]                                                                                |
|  +-------------------------+   +-----------------------------------------------------------+      |
|  |                         |   |  Our Story                                                |      |
|  |      [ Image ]          |   |  Catsy Coffee started with a simple idea...               |      |
|  |                         |   |                                                           |      |
|  +-------------------------+   +-----------------------------------------------------------+      |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ Featured Products Section ]                                                                    |
|                                                                                                   |
|  +-------------------+  +-------------------+  +-------------------+  +-------------------+       |
|  |     [ Image ]     |  |     [ Image ]     |  |     [ Image ]     |  |     [ Image ]     |       |
|  | Espresso        ☕ |  | Latte           ☕ |  | Cappuccino      ☕ |  | Mocha           ☕ |       |
|  | ₱ 120.00          |  | ₱ 150.00          |  | ₱ 140.00          |  | ₱ 160.00          |       |
|  +-------------------+  +-------------------+  +-------------------+  +-------------------+       |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ Location Map - Full Width ]                                                                    |
|  +---------------------------------------------------------------------------------------------+  |
|  |                                                                                             |  |
|  |                              📍 196 Bonifacio St, Tagum, Davao del Norte                    |  |
|  |                                                                                             |  |
|  |                                [ Interactive Map Container ]                                |  |
|  |                                                                                             |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                                                                                                   |
|                           © 2026 CATSY COFFEE • BREWED WITH PASSION                               |
|                                       [ Footer ]                                                  |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

---

## 📱 Mobile View

```text
+--------------------------------------+
|                                      |
|                                      |
|           [ Hero Section ]           |
|  +--------------------------------+  |
|  |    Welcome to Catsy Coffee     |  |
|  |  Brewing passion every single  |  |
|  |              day.              |  |
|  +--------------------------------+  |
|                                      |
+--------------------------------------+
|                                      |
|  [ Greeting Section ]                |
|  Hello! / Good morning, [User]!      |
|                                      |
+--------------------------------------+
|                                      |
|  [ About Section ]                   |
|  +--------------------------------+  |
|  |           [ Image ]            |  |
|  +--------------------------------+  |
|  Our Story                           |
|  Catsy Coffee started with a...      |
|                                      |
+--------------------------------------+
|                                      |
|  [ Featured Products ]               |
|                                      |
|  +--------------------------------+  |
|  | [ Img ] Espresso      ₱ 120.00 |  |
|  +--------------------------------+  |
|  +--------------------------------+  |
|  | [ Img ] Latte         ₱ 150.00 |  |
|  +--------------------------------+  |
|  ... (scrollable)                    |
|                                      |
+--------------------------------------+
|                                      |
|  [ Location Map ]                    |
|  +--------------------------------+  |
|  |  📍 196 Bonifacio St, Tagum     |  |
|  |     [ Map Container ]          |  |
|  +--------------------------------+  |
|                                      |
+--------------------------------------+
|                                      |
|            [ Footer ]                |
|  © 2026 CATSY COFFEE • BREWED WITH   |
|               PASSION                |
|                                      |
|                                      |
|                                      |
+======================================+
| [Home] [Order] [Menu] [Rewards] [Me] |
|   🏠     🛍️      📖      ⭐      👤   |
+--------------------------------------+
```

## Component Architecture Breakdown

*   **`src/app/layout.tsx`** wraps the application.
    *   `<Providers>` wraps everything (likely Context UI logic).
    *   `<Navbar>` is displayed strictly for `>= md` screens (`hidden md:flex`).
    *   `<main>` contains the specific page routes.
    *   `<MobileNav>` is anchored at the bottom for `< md` screens.
*   **`src/app/page.tsx`** is the main view containing sections sequentially ordered:
    *   `<HeroSection />`
    *   `<GreetingSection />`
    *   `<AboutSection />`
    *   `<FeaturedProductsSection />`
    *   `<LocationMap />` (Full Width parent container)
    *   `<Footer />`
*   **Context usage (`src/context/`):** Expected to manage cart and authentication state globally and feed into the views like Account, Rewards, and Order tabs in the Navbars.
