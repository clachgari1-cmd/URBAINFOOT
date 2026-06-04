import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Boutique from './pages/Boutique';
import Terrains from './pages/Terrains';
import Dashboard from './pages/Dashboard';
import Panier from './pages/Panier';

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <Header />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/terrains" element={<Terrains />} />
                        <Route path="/boutique" element={<Boutique />} />
                        <Route path="/panier" element={<Panier />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Partner Route */}
                        <Route path="/dashboard" element={
                            <PrivateRoute allowedTypes={['partner']}>
                                <Dashboard />
                            </PrivateRoute>
                        } />

                        {/* General Catch */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

const container = document.getElementById('root');
if (container) {
    createRoot(container).render(<App />);
}
