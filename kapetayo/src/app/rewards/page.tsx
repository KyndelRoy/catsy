"use client";

import { mockRewards, userStamps } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Gift, Check } from "lucide-react";

const TOTAL_STAMPS = 9;

export default function RewardsPage() {
    const stamps = userStamps;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-1">
                <Star className="h-8 w-8 mx-auto" />
                <h1 className="text-2xl font-bold tracking-tight">Your Rewards</h1>
            </div>

            {/* Stamps Card */}
            <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">Loyalty Stamps</h2>
                        <Badge variant="secondary">
                            {stamps}/{TOTAL_STAMPS}
                        </Badge>
                    </div>

                    {/* Stamp Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: TOTAL_STAMPS }).map((_, i) => {
                            const filled = i < stamps;
                            return (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${filled
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : "border-dashed border-muted-foreground/30 text-muted-foreground/30"
                                        }`}
                                >
                                    {filled ? (
                                        <Star className="h-6 w-6 fill-current" />
                                    ) : (
                                        <Star className="h-6 w-6" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Progress Text */}
                    <p className="text-sm text-muted-foreground text-center">
                        {stamps >= TOTAL_STAMPS
                            ? "🎉 You've earned a free reward!"
                            : `${TOTAL_STAMPS - stamps} more stamps until your next reward`}
                    </p>
                </CardContent>
            </Card>

            {/* Rewards Pool */}
            <section className="space-y-3">
                <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    <h2 className="font-semibold">Rewards Pool</h2>
                </div>

                <div className="space-y-2">
                    {mockRewards.map((reward, i) => {
                        const isClaimable = stamps >= reward.stampsRequired && !reward.claimed;
                        return (
                            <Card
                                key={i}
                                className={`border-border transition-all duration-200 ${reward.claimed ? "opacity-60" : ""
                                    }`}
                            >
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-10 w-10 rounded-lg flex items-center justify-center ${reward.claimed
                                                    ? "bg-muted text-muted-foreground"
                                                    : "bg-primary text-primary-foreground"
                                                }`}
                                        >
                                            {reward.claimed ? (
                                                <Check className="h-5 w-5" />
                                            ) : (
                                                <Gift className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{reward.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {reward.stampsRequired}/{TOTAL_STAMPS} stamps
                                            </p>
                                        </div>
                                    </div>

                                    {reward.claimed ? (
                                        <Badge variant="secondary">Claimed</Badge>
                                    ) : isClaimable ? (
                                        <Button size="sm">Claim</Button>
                                    ) : (
                                        <Badge variant="outline">
                                            {reward.stampsRequired - stamps} more
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
