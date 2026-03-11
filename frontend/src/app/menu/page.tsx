"use client";

import { useState } from "react";
import { products, categories } from "@/lib/mock-data";
import { useCart } from "@/context/cart-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, ShoppingCart, X } from "lucide-react";
import Image from "next/image";

export default function MenuPage() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [cartOpen, setCartOpen] = useState(false);
    const { items, addItem, removeItem, updateQuantity, totalItems, totalPrice } =
        useCart();

    const filtered = products.filter((p) => {
        const matchCategory =
            activeCategory === "All" || p.category === activeCategory;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchSearch;
    });

    const getItemQty = (id: string) =>
        items.find((i) => i.product.id === id)?.quantity || 0;

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Find coffee, pastries..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                    <Button
                        key={cat}
                        variant={activeCategory === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveCategory(cat)}
                        className="shrink-0"
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((product) => {
                    const qty = getItemQty(product.id);
                    return (
                        <Card
                            key={product.id}
                            className="group overflow-hidden hover:shadow-md transition-all duration-200 border-border"
                        >
                            <CardContent className="p-0">
                                <div className="relative h-36 bg-muted flex items-center justify-center overflow-hidden">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        width={120}
                                        height={120}
                                        className="object-contain transition-transform duration-200 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-3 space-y-1.5">
                                    <h3 className="font-medium text-sm truncate">
                                        {product.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {product.description}
                                    </p>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="font-bold">
                                            ₱{product.price.toFixed(2)}
                                        </span>
                                        {qty === 0 ? (
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-8 w-8"
                                                onClick={() => addItem(product)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        updateQuantity(product.id, qty - 1)
                                                    }
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-6 text-center text-sm font-medium">
                                                    {qty}
                                                </span>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-7 w-7"
                                                    onClick={() => addItem(product)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No items found.
                </div>
            )}

            {/* Cart Bar */}
            {totalItems > 0 && (
                <>
                    {/* Cart Overlay */}
                    {cartOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setCartOpen(false)}
                        />
                    )}

                    {/* Cart Panel */}
                    {cartOpen && (
                        <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-background border border-border rounded-xl shadow-2xl z-50 p-4 space-y-3 max-h-[50vh] overflow-y-auto">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Your Cart</h3>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => setCartOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            {items.map((item) => (
                                <div
                                    key={item.product.id}
                                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {item.product.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            ₱{item.product.price.toFixed(2)} × {item.quantity}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-6 w-6"
                                            onClick={() =>
                                                updateQuantity(
                                                    item.product.id,
                                                    item.quantity - 1
                                                )
                                            }
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-5 text-center text-xs">
                                            {item.quantity}
                                        </span>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-6 w-6"
                                            onClick={() => addItem(item.product)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 text-muted-foreground"
                                            onClick={() => removeItem(item.product.id)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Floating Cart Bar */}
                    <div
                        className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-primary text-primary-foreground rounded-xl shadow-lg z-50 px-5 py-3.5 flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => setCartOpen(!cartOpen)}
                        style={cartOpen ? { display: "none" } : {}}
                    >
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="font-medium">
                                Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-bold">₱{totalPrice.toFixed(2)}</span>
                            <Badge
                                variant="secondary"
                                className="bg-primary-foreground text-primary"
                            >
                                Checkout
                            </Badge>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
