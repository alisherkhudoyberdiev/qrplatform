"use client";

import { createContext, useContext } from "react";

export type RestaurantInfo = {
  id: string;
  name: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  promoText?: string | null;
};

const RestaurantContext = createContext<{
  restaurantId: string;
  restaurant: RestaurantInfo | null;
} | null>(null);

export function RestaurantProvider({
  restaurantId,
  restaurant,
  children,
}: {
  restaurantId: string;
  restaurant: RestaurantInfo | null;
  children: React.ReactNode;
}) {
  return (
    <RestaurantContext.Provider value={{ restaurantId, restaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error("useRestaurant must be used within RestaurantProvider");
  return ctx;
}
