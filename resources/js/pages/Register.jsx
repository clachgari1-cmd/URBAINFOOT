import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TYPES = [
    {
        value: 'client',
        icon: '👤',
        label: 'Client',
        desc: 'Réservez des terrains et faites vos achats au Maroc.',
    },
    {
        value: 'mark',
        icon: '🏷️',
        label: 'Marque / Vendeur',
        desc: 'Mettez vos produits en vente dans la boutique.',
    },
    {
        value: 'terrain_manager',
        icon: '🏟️',
        label: 'Responsable Terrain',
        desc: 'Gérez votre terrain et vos créneaux de réservation.',
    },
];

export default function Register() {
    const [step, setStep] = useState(1);
    const [type, setType] = useState('client');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const isPartner = type !== 'client';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        if (password !== confirm) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (isPartner && accessCode.length < 4) {
            setError('Le code d\'accès doit contenir au moins 4 caractères.');
            return;
        }

        setLoading(true);
        try {
            const endpoint = isPartner ? '/api/partner/register' : '/api/register';
            const payload = { name, email, password, password_confirmation: confirm, type };
            if (isPartner) payload.access_code = accessCode;

            await axios.post(endpoint, payload);

            const loginExtra = isPartner ? { access_code: accessCode } : {};
            await login(email, password, isPartner ? 'partner' : 'client', loginExtra);

            navigate(isPartner ? '/dashboard' : '/');
        } catch (err) {
            console.error("Détails de l'erreur d'inscription :", err);
            const data = err.response?.data;
            if (data?.errors) {
                setError(Object.values(data.errors).flat()[0]);
            } else if (data?.message) {
                setError(data.message);
            } else if (err.message) {
                setError(err.message === "Network Error" 
                    ? "Impossible de se connecter au serveur. Veuillez vous assurer que le serveur de développement ('php artisan serve') est démarré et accessible."
                    : err.message
                );
            } else {
                setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content" style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--c-bg)',
        }}>
            <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: 560, padding: '24px' }}
            >
                <div style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', padding: '48px 40px' }}>

                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <Link to="/" className="logo" style={{ display: 'inline-block', marginBottom: 12 }}>
                            URBAIN<span style={{ color: 'var(--c-green)' }}>FOOT</span>
                        </Link>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>
                            {step === 1 ? 'Créer un compte' : (
                                type === 'client' ? 'Compte Client' : (
                                    type === 'mark' ? 'Compte Vendeur' : 'Compte Responsable'
                                )
                            )}
                        </h1>
                        <p style={{ color: 'var(--c-text2)', fontSize: '0.9rem' }}>
                            {step === 1 ? 'Rejoignez 8 500+ joueurs au Maroc.' : `Configuration de votre espace ${type === 'client' ? 'personnel' : 'professionnel'}.`}
                        </p>
                    </div>

                    {/* Progress bar */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
                        {[1, 2].map(s => (
                            <div key={s} style={{
                                flex: 1, height: 3,
                                background: step >= s ? 'var(--c-green)' : 'var(--c-border)',
                                transition: 'background .3s',
                            }} />
                        ))}
                    </div>

                    {/* ── STEP 1 : Role picker ── */}
                    {step === 1 && (
                        <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-text2)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>
                                Je suis un(e)…
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                                {TYPES.map(t => (
                                    <button
                                        key={t.value} type="button"
                                        onClick={() => setType(t.value)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 16,
                                            padding: '14px 18px', textAlign: 'left',
                                            border: `1px solid ${type === t.value ? 'var(--c-green)' : 'var(--c-border)'}`,
                                            background: type === t.value ? 'var(--c-green-dim)' : 'var(--c-card)',
                                            cursor: 'pointer', transition: 'var(--t)',
                                        }}
                                    >
                                        <div style={{
                                            width: 44, height: 44, flexShrink: 0,
                                            background: 'rgba(255,255,255,.05)', border: '1px solid var(--c-border)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                                        }}>{t.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, marginBottom: 2 }}>{t.label}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--c-text2)' }}>{t.desc}</div>
                                        </div>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                            border: `2px solid ${type === t.value ? 'var(--c-green)' : 'var(--c-border)'}`,
                                            background: type === t.value ? 'var(--c-green)' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {type === t.value && <span style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 900 }}>✓</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
                                onClick={() => setStep(2)}
                            >
                                Continuer →
                            </button>
                        </div>
                    )}

                    {/* ── STEP 2 : Form ── */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                            <button type="button" onClick={() => { setStep(1); setError(''); }}
                                style={{ alignSelf: 'flex-start', fontSize: '0.85rem', color: 'var(--c-text2)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 4 }}>
                                ← Retour
                            </button>

                            {/* Error banner */}
                            {error && (
                                <div style={{
                                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                                    padding: '12px 16px', fontSize: '0.875rem', color: 'var(--c-red)',
                                }}>
                                    ⚠ {error}
                                </div>
                            )}

                            {/* Name */}
                            <div className="form-group">
                                <label className="form-label">Nom complet</label>
                                <input className="form-input" type="text" placeholder="Ex: Youssef El Amrani"
                                    value={name} onChange={e => setName(e.target.value)} required />
                            </div>

                            {/* Email */}
                            <div className="form-group">
                                <label className="form-label">Adresse email</label>
                                <input className="form-input" type="email" placeholder="vous@exemple.ma"
                                    value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>

                            {/* Passwords */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Mot de passe</label>
                                    <input className="form-input" type="password" placeholder="8+ caractères"
                                        value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirmer</label>
                                    <input className="form-input" type="password" placeholder="Répéter"
                                        value={confirm} onChange={e => setConfirm(e.target.value)} required />
                                </div>
                            </div>

                            {/* ── ACCESS CODE — partners only ── */}
                            {console.log('Rendering Step 2. Type:', type, 'isPartner:', isPartner)}
                            {(type === 'mark' || type === 'terrain_manager') && (
                                <div className="form-group" style={{
                                    borderTop: '1px solid var(--c-border)',
                                    paddingTop: 16, marginTop: 4,
                                }}>
                                    <label className="form-label" style={{ color: 'var(--c-green)' }}>
                                        🔑 Code d'accès partenaire
                                    </label>
                                    <input
                                        className="form-input"
                                        type="password"
                                        placeholder="Choisissez un code secret (4-8 caractères)"
                                        value={accessCode}
                                        onChange={e => setAccessCode(e.target.value)}
                                        required
                                        minLength={4}
                                        maxLength={8}
                                    />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--c-text3)', display: 'block', marginTop: 6 }}>
                                        Ce code vous protège : il vous sera demandé à chaque connexion au tableau de bord partenaire.
                                    </span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ justifyContent: 'center', fontSize: '1rem', padding: '14px', marginTop: 4 }}
                            >
                                {loading ? 'Création du compte...' : 'Créer mon compte →'}
                            </button>
                        </form>
                    )}

                    <hr className="divider" />
                    <p style={{ textAlign: 'center', color: 'var(--c-text2)', fontSize: '0.875rem' }}>
                        Déjà un compte ?{' '}
                        <Link to="/login" style={{ color: 'var(--c-green)', fontWeight: 600 }}>Se connecter</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
