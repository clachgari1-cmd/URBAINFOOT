import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
    const [authType, setAuthType] = useState('client');
    const [form, setForm] = useState({ email: '', password: '', access_code: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const set = k => e => setForm(prev => ({ ...prev, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');

        try {
            // Build payload — access_code only sent for partners
            const payload = authType === 'partner'
                ? { email: form.email, password: form.password, access_code: form.access_code }
                : { email: form.email, password: form.password };

            await login(form.email, form.password, authType, payload);
            navigate(authType === 'client' ? '/' : '/dashboard');
        } catch (err) {
            const msg = err.response?.data?.errors?.email?.[0]
                || err.response?.data?.message
                || 'Identifiants invalides.';
            setError(msg);
        } finally { setLoading(false); }
    };

    return (
        <div className="page-content" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-bg)' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: 480, padding: '24px' }}>
                <div style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', padding: '48px 40px' }}>

                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <Link to="/" className="logo" style={{ display: 'inline-block', marginBottom: 16 }}>
                            URBAIN<span style={{ color: 'var(--c-green)' }}>FOOT</span>
                        </Link>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Bon retour</h1>
                        <p style={{ color: 'var(--c-text2)', fontSize: '0.9rem' }}>
                            {authType === 'client' ? 'Connectez-vous à votre espace client.' : 'Accès sécurisé espace partenaire.'}
                        </p>
                    </div>

                    {/* Type tabs */}
                    <div style={{ display: 'flex', gap: 0, marginBottom: 32, border: '1px solid var(--c-border)' }}>
                        {[['client', '👤 Client'], ['partner', '🔑 Partenaire']].map(([val, label]) => (
                            <button key={val} onClick={() => { setAuthType(val); setError(''); }}
                                style={{
                                    flex: 1, padding: '12px',
                                    background: authType === val ? 'var(--c-green)' : 'transparent',
                                    color: authType === val ? '#fff' : 'var(--c-text2)',
                                    fontWeight: 600, fontSize: '0.875rem', border: 'none',
                                    cursor: 'pointer', transition: 'var(--t)',
                                }}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', padding: '12px 16px', marginBottom: 24, fontSize: '0.875rem', color: 'var(--c-red)' }}>
                            ⚠ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" type="email" placeholder="vous@exemple.ma"
                                value={form.email} onChange={set('email')} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mot de passe</label>
                            <input className="form-input" type="password" placeholder="••••••••"
                                value={form.password} onChange={set('password')} required />
                        </div>

                        {/* EXTRA FIELD — only visible for partners */}
                        {authType === 'partner' && (
                            <motion.div className="form-group"
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}>
                                <label className="form-label">Code d'accès partenaire</label>
                                <input className="form-input" type="password" placeholder="4-8 caractères"
                                    value={form.access_code} onChange={set('access_code')} required />
                                <span style={{ fontSize: '0.75rem', color: 'var(--c-text3)', marginTop: 4 }}>
                                    Code créé lors de votre inscription partenaire.
                                </span>
                            </motion.div>
                        )}

                        <button type="submit" className="btn btn-primary"
                            style={{ justifyContent: 'center', fontSize: '1rem', padding: '14px', marginTop: 8 }}
                            disabled={loading}>
                            {loading ? 'Connexion en cours...' : 'Se connecter →'}
                        </button>
                    </form>

                    <hr className="divider" />
                    <p style={{ textAlign: 'center', color: 'var(--c-text2)', fontSize: '0.875rem' }}>
                        Pas encore de compte ?{' '}
                        <Link to="/register" style={{ color: 'var(--c-green)', fontWeight: 600 }}>S'inscrire</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
