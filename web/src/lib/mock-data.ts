// Mock data for Catsy Coffee cafe app

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    image: string;
    featured?: boolean;
}

export interface Order {
    id: string;
    items: { product: Product; quantity: number }[];
    status: "preparing" | "ready" | "completed" | "cancelled";
    total: number;
    date: string;
}

export interface Reward {
    name: string;
    stampsRequired: number;
    claimed: boolean;
}

export const categories = ["All", "Coffee", "Pastries", "Meals", "Drinks"];

export const products: Product[] = [
    {
        id: "1",
        name: "Iced Latte",
        price: 150,
        category: "Coffee",
        description: "Smooth espresso with cold milk over ice",
        image: "/placeholder-coffee.svg",
        featured: true,
    },
    {
        id: "2",
        name: "Americano",
        price: 110,
        category: "Coffee",
        description: "Bold espresso diluted with hot water",
        image: "/placeholder-coffee.svg",
        featured: true,
    },
    {
        id: "3",
        name: "Espresso",
        price: 90,
        category: "Coffee",
        description: "Pure concentrated coffee shot",
        image: "/placeholder-coffee.svg",
    },
    {
        id: "4",
        name: "Cappuccino",
        price: 140,
        category: "Coffee",
        description: "Espresso topped with steamed milk foam",
        image: "/placeholder-coffee.svg",
        featured: true,
    },
    {
        id: "5",
        name: "Mocha",
        price: 160,
        category: "Coffee",
        description: "Espresso, chocolate, and steamed milk",
        image: "/placeholder-coffee.svg",
        featured: true,
    },
    {
        id: "6",
        name: "Croissant",
        price: 85,
        category: "Pastries",
        description: "Buttery, flaky French pastry",
        image: "/placeholder-pastry.svg",
        featured: true,
    },
    {
        id: "7",
        name: "Glazed Donut",
        price: 65,
        category: "Pastries",
        description: "Classic donut with sweet glaze",
        image: "/placeholder-pastry.svg",
    },
    {
        id: "8",
        name: "Banana Bread",
        price: 75,
        category: "Pastries",
        description: "Moist bread with ripe bananas",
        image: "/placeholder-pastry.svg",
    },
    {
        id: "9",
        name: "Chicken Panini",
        price: 195,
        category: "Meals",
        description: "Grilled chicken with fresh veggies on pressed ciabatta",
        image: "/placeholder-meal.svg",
    },
    {
        id: "10",
        name: "Club Sandwich",
        price: 180,
        category: "Meals",
        description: "Triple-decker with ham, turkey, bacon, and lettuce",
        image: "/placeholder-meal.svg",
    },
    {
        id: "11",
        name: "Mango Smoothie",
        price: 130,
        category: "Drinks",
        description: "Fresh mango blended with yogurt and ice",
        image: "/placeholder-drink.svg",
    },
    {
        id: "12",
        name: "Iced Tea",
        price: 80,
        category: "Drinks",
        description: "Refreshing chilled tea with a hint of lemon",
        image: "/placeholder-drink.svg",
    },
];

export const mockOrders: Order[] = [
    {
        id: "#CF-8X2Y",
        items: [
            { product: products[0], quantity: 1 },
            { product: products[6], quantity: 1 },
        ],
        status: "preparing",
        total: 215,
        date: "2026-03-11",
    },
    {
        id: "#CF-5K9Z",
        items: [
            { product: products[1], quantity: 2 },
            { product: products[5], quantity: 1 },
        ],
        status: "completed",
        total: 305,
        date: "2026-03-10",
    },
    {
        id: "#CF-3M7W",
        items: [{ product: products[4], quantity: 1 }],
        status: "completed",
        total: 160,
        date: "2026-03-09",
    },
];

export const mockRewards: Reward[] = [
    { name: "Free Coffee", stampsRequired: 9, claimed: false },
    { name: "10% Off Pastry", stampsRequired: 5, claimed: true },
    { name: "Free Upgrade", stampsRequired: 7, claimed: false },
];

export const userStamps = 5;

// Temporary dev account
export const DEV_ACCOUNT = {
    email: "dev@catsy.coffee",
    password: "catsy123",
    name: "Dev User",
};
