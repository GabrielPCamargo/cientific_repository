import { createContext, useContext, useState, useEffect } from "react";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState(() => {
        // Carrega favoritos do localStorage na inicialização
        const stored = localStorage.getItem("favorites");
        return stored ? JSON.parse(stored) : [];
    });

    // Persiste no localStorage sempre que favorites mudar
    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites]);

    const addFavorite = (document) => {
        setFavorites((prev) => {
            // Evita duplicatas
            if (prev.some((d) => d.id === document.id)) {
                return prev;
            }
            return [...prev, document];
        });
    };

    const removeFavorite = (documentId) => {
        setFavorites((prev) => prev.filter((d) => d.id !== documentId));
    };

    const isFavorite = (documentId) => {
        return favorites.some((d) => d.id === documentId);
    };

    const toggleFavorite = (document) => {
        if (isFavorite(document.id)) {
            removeFavorite(document.id);
        } else {
            addFavorite(document);
        }
    };

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                addFavorite,
                removeFavorite,
                isFavorite,
                toggleFavorite,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
}
