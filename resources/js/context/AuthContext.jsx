import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [authType, setAuthType] = useState(localStorage.getItem('authType')); // 'client' or 'partner'

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const endpoint = authType === 'partner' ? '/api/partner' : '/api/user';

            axios.get(endpoint)
                .then(res => setUser(res.data))
                .catch(() => logout());
        }
    }, [token]);

    const login = async (email, password, type = 'client', extraPayload = {}) => {
        const endpoint = type === 'partner' ? '/api/partner/login' : '/api/login';
        const res = await axios.post(endpoint, { email, password, ...extraPayload });

        const userData = res.data.user || res.data.partner;
        const userToken = res.data.token;

        setUser(userData);
        setToken(userToken);
        setAuthType(type);

        localStorage.setItem('token', userToken);
        localStorage.setItem('authType', type);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    };

    const logout = async () => {
        try {
            const endpoint = authType === 'partner' ? '/api/partner/logout' : '/api/logout';
            await axios.post(endpoint);
        } catch (e) { }

        setUser(null);
        setToken(null);
        setAuthType(null);
        localStorage.removeItem('token');
        localStorage.removeItem('authType');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, authType, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
