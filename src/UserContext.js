import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const isAdmin = user?.name?.trim().toLowerCase() === 'тодор янчев' &&
        user?.email?.trim().toLowerCase() === 'admin@admin.com';

    // 🔹 Зареждаме user от localStorage при стартиране
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error('Грешка при парсване на user от localStorage:', err);
            }
        }
        setLoadingUser(false);
    }, []);

    // 🔹 Всеки път, когато user се промени — записваме го
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser, isAdmin, loadingUser }}>
            {children}
        </UserContext.Provider>
    );
};
