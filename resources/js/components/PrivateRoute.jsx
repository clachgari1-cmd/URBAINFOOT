import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute — protects routes by auth type.
 *
 * allowedTypes: array of allowed types:
 *   'client'          → only logged-in clients
 *   'mark'            → only mark partners
 *   'terrain_manager' → only terrain managers
 *   'partner'         → any partner (mark OR terrain_manager)
 *   'any'             → any authenticated user
 *
 * redirectTo: where to send unauthenticated / unauthorized users
 */
export default function PrivateRoute({ children, allowedTypes = ['any'], redirectTo = '/login' }) {
    const { user, authType, token } = useAuth();

    // Not logged in at all
    if (!token || !user) {
        return <Navigate to={redirectTo} replace />;
    }

    // Determine the effective type
    const userType = user.type || authType;

    const isAllowed = allowedTypes.includes('any') ||
        allowedTypes.includes(userType) ||
        (allowedTypes.includes('partner') && (userType === 'mark' || userType === 'terrain_manager'));

    if (!isAllowed) {
        // Logged in but wrong role — redirect to their own home
        const fallback = (authType === 'partner') ? '/dashboard' : '/';
        return <Navigate to={fallback} replace />;
    }

    return children;
}
