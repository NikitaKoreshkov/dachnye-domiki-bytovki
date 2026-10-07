"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

const FavoritesCompareContext = createContext(null);

export function useFavoritesCompare() {
  return useContext(FavoritesCompareContext);
}

export function FavoritesCompareProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesList, setFavoritesList] = useState<any[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      // Добавляем cache: 'no-store' чтобы всегда получать свежие данные
      const res = await fetch("/api/profile/favorites", { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!res.ok) {
        // Если не авторизован или ошибка - просто очищаем избранное
        if (res.status === 401 || res.status === 500) {
          console.log('[FAVORITES] Error loading favorites:', res.status);
          setFavorites([]);
          setFavoritesList([]);
          return;
        }
      }
      
      const data = await res.json();
      console.log('[FAVORITES] Loaded favorites:', data.favorites);
      // API возвращает id как slug, используем id напрямую
      const validFavorites = Array.isArray(data.favorites) ? data.favorites.filter((f: any) => f && f.id) : [];
      setFavorites(validFavorites.map((x:any) => x.id || x.slug));
      setFavoritesList(validFavorites);
    } catch (error) {
      console.error('[FAVORITES] Error fetching favorites:', error);
      setFavorites([]);
      setFavoritesList([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchCompare = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile/compare/none");
      const data = await res.json();
      setCompare(Array.isArray(data.compare) ? data.compare.map((x:any) => x.slug) : []);
      setCompareList(data.compare || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchFavorites();
      fetchCompare();
    } else {
      setFavorites([]);
      setCompare([]);
      setFavoritesList([]);
      setCompareList([]);
    }
  }, [session?.user?.email]);

  const addFavorite = async (id:string) => {
    if (!session?.user?.email) { router.push('/auth/signin'); return }
    await fetch(`/api/profile/favorites/${id}`, { method: "POST" });
    await fetchFavorites();
  };
  const removeFavorite = async (id:string) => {
    if (!session?.user?.email) { router.push('/auth/signin'); return }
    await fetch(`/api/profile/favorites/${id}`, { method: "DELETE" });
    await fetchFavorites();
  };
  const addCompare = async (id:string) => {
    if (!session?.user?.email) { router.push('/auth/signin'); return }
    await fetch(`/api/profile/compare/${id}`, { method: "POST" });
    await fetchCompare();
  };
  const removeCompare = async (id:string) => {
    if (!session?.user?.email) { router.push('/auth/signin'); return }
    await fetch(`/api/profile/compare/${id}`, { method: "DELETE" });
    await fetchCompare();
  };

  return (
    <FavoritesCompareContext.Provider value={{
      favorites, compare, favoritesList, compareList, loading,
      addFavorite, removeFavorite, addCompare, removeCompare
    }}>
      {children}
    </FavoritesCompareContext.Provider>
  );
}
