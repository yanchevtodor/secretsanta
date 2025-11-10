import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // проверка дали потребителят е админ
    const isAdmin = user?.name?.trim().toLowerCase() === 'тодор янчев' &&
        user?.email?.trim().toLowerCase() === 'admin@admin.com';

    return (
        <UserContext.Provider value={{ user, setUser, isAdmin }}>
            {children}
        </UserContext.Provider>
    );
};
