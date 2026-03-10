"use client";

import { useState } from "react";
import { mockOrders } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Clock, CheckCircle, XCircle, Receipt } from "lucide-react";

const statusConfig = {
    preparing: {
        label: "Preparing",
        icon: Clock,
        variant: "outline" as const,
    },
    ready: {
        label: "Ready",
        icon: CheckCircle,
        variant: "default" as const,
    },
    completed: {
        label: "Completed",
        icon: CheckCircle,
        variant: "secondary" as const,
    },
    cancelled: {
        label: "Cancelled",
        icon: XCircle,
        variant: "destructive" as const,
    },
};

export default function OrderPage() {
    const [tab, setTab] = useState<"active" | "history">("active");

    const activeOrders = mockOrders.filter(
        (o) => o.status === "preparing" || o.status === "ready"
    );
    const historyOrders = mockOrders.filter(
        (o) => o.status === "completed" || o.status === "cancelled"
    );

    const orders = tab === "active" ? activeOrders : historyOrders;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-1">
                <ShoppingBag className="h-8 w-8 mx-auto" />
                <h1 className="text-2xl font-bold tracking-tight">Your Orders</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 justify-center">
                <Button
                    variant={tab === "active" ? "default" : "outline"}
                    onClick={() => setTab("active")}
                    className="min-w-[100px]"
                >
                    Active
                </Button>
                <Button
                    variant={tab === "history" ? "default" : "outline"}
                    onClick={() => setTab("history")}
                    className="min-w-[100px]"
                >
                    History
                </Button>
            </div>

            {/* Orders */}
            <div className="space-y-4">
                {orders.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No {tab} orders</p>
                    </div>
                )}
                {orders.map((order) => {
                    const config = statusConfig[order.status];
                    const StatusIcon = config.icon;
                    return (
                        <Card
                            key={order.id}
                            className="border-border hover:shadow-md transition-shadow duration-200"
                        >
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-semibold text-sm">
                                            {order.id}
                                        </span>
                                        <Badge variant={config.variant} className="gap-1">
                                            <StatusIcon className="h-3 w-3" />
                                            {config.label}
                                        </Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {order.date}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    {order.items.map((item, i) => (
                                        <p key={i} className="text-sm text-muted-foreground">
                                            {item.quantity}× {item.product.name}
                                        </p>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                    <span className="font-bold">
                                        ₱{order.total.toFixed(2)}
                                    </span>
                                    <Button variant="outline" size="sm" className="gap-1">
                                        <Receipt className="h-3 w-3" />
                                        View Receipt
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
