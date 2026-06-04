import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const isPartner = user && (user.type === 'mark' || user.type === 'terrain_manager');

    return (
        <header className="header">
            <div className="header-inner">
                <Link to="/" className="logo">
                    URBAIN<span className="gradient-text">FOOT</span>
                </Link>

                <nav className="nav">
                    <Link to="/" className={isActive('/') ? 'active' : ''}>Accueil</Link>
                    {!isPartner && (
                        <>
                            <Link to="/terrains" className={isActive('/terrains') ? 'active' : ''}>Terrains</Link>
                            <Link to="/boutique" className={isActive('/boutique') ? 'active' : ''}>Boutique</Link>
                        </>
                    )}
                    {user?.type && (
                        <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''} style={{ color: 'var(--c-green)' }}>
                            Dashboard
                        </Link>
                    )}
                </nav>

                <div className="header-actions">
                    {user ? (
                        <>
                            {!isPartner && cartCount > 0 && (
                                <Link to="/panier" className="btn btn-outline" style={{ position: 'relative', paddingRight: 36 }}>
                                    🛒
                                    <span style={{
                                        position: 'absolute', top: -6, right: -6,
                                        background: 'var(--c-green)', color: '#030806',
                                        width: 20, height: 20, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', fontWeight: 900
                                    }}>{cartCount}</span>
                                </Link>
                            )}
                            <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--c-text2)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.name}
                            </span>
                            <button onClick={logout} className="btn btn-ghost" style={{ color: 'var(--c-red)', fontSize: '0.85rem' }}>
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost">Connexion</Link>
                            <Link to="/register" className="btn btn-primary">S'inscrire</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
