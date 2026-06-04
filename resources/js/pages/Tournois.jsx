import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TOURNOIS = [
    {
        id: 1, name: 'Copa Urbain Spring 2026', type: '5v5', date: '7 Juin 2026',
        teams: 16, spots: 4, prize: '500€', city: 'Paris 15e', status: 'open',
        emoji: '🏆', color: '#ffd600',
        desc: 'Le tournoi printanier incontournable de la capitale. Format poules + élimination directe.',
    },
    {
        id: 2, name: 'Ligue Elite 7v7', type: '7v7', date: '14 Juin 2026',
        teams: 8, spots: 2, prize: '1200€', city: 'Vincennes', status: 'open',
        emoji: '⚡', color: 'var(--c-blue)',
        desc: 'Compétition semi-professionnelle avec arbitrage officiel et diffusion live.',
    },
    {
        id: 3, name: 'Grand Slam 11v11', type: '11v11', date: '21 Juin 2026',
        teams: 12, spots: 0, prize: '3000€', city: 'Saint-Denis', status: 'full',
        emoji: '🥇', color: 'var(--c-green)',
        desc: 'Le plus grand tournoi amateur d\'Île-de-France. Palmarès et trophées officiels.',
    },
    {
        id: 4, name: 'Night Cup 5v5', type: '5v5', date: '28 Juin 2026',
        teams: 8, spots: 3, prize: '300€', city: 'Montreuil', status: 'open',
        emoji: '🌙', color: '#9c27b0',
        desc: 'Tournoi nocturne sous les lumières LED. Ambiance électrique garantie jusqu\'à minuit.',
    },
];

const PALMARES = [
    { year: 2025, winner: 'FC Belleville', runner: 'Paris Panthers', tournament: 'Copa Urbain' },
    { year: 2024, winner: 'Les Indomptables', runner: 'AS République', tournament: 'Copa Urbain' },
    { year: 2023, winner: 'Tigres Vincennes', runner: 'FC Belleville', tournament: 'Copa Urbain' },
];

export default function Tournois() {
    const [selected, setSelected] = useState(null);

    return (
        <div className="page-content">
            <div className="container" style={{ padding: '40px 24px 80px' }}>

                {/* Header */}
                <div style={{ marginBottom: 56 }}>
                    <p className="label">Compétitions</p>
                    <h1 style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', marginTop: 8 }}>
                        Tournois & <span className="gradient-text">Championnats</span>
                    </h1>
                    <p style={{ color: 'var(--c-text2)', marginTop: 12, fontSize: '1.05rem' }}>
                        Inscrivez votre équipe et battez-vous pour la gloire et les récompenses.
                    </p>
                </div>

                {/* Tournament cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 80 }}>
                    {TOURNOIS.map((t, i) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                background: 'var(--c-card)',
                                border: '1px solid var(--c-border)',
                                borderRadius: 'var(--r-xl)',
                                display: 'grid',
                                gridTemplateColumns: 'auto 1fr auto',
                                gap: 32,
                                padding: 32,
                                alignItems: 'center',
                                transition: 'var(--t)',
                                cursor: 'pointer',
                            }}
                            whileHover={{ borderColor: t.color, boxShadow: `0 0 40px ${t.color}18` }}
                            onClick={() => setSelected(selected === t.id ? null : t.id)}
                        >
                            {/* Icon */}
                            <div style={{
                                width: 80, height: 80, borderRadius: 20,
                                background: `${t.color}15`,
                                border: `1px solid ${t.color}40`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2.5rem', flexShrink: 0,
                            }}>
                                {t.emoji}
                            </div>

                            {/* Info */}
                            <div>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                                    <h3 style={{ fontSize: '1.3rem' }}>{t.name}</h3>
                                    <span className={`badge badge-${t.status === 'open' ? 'green' : 'orange'}`}>
                                        {t.status === 'open' ? `${t.spots} places restantes` : 'Complet'}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--c-text2)', fontSize: '0.9rem', marginBottom: 12 }}>{t.desc}</p>
                                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--c-text3)' }}>📅 {t.date}</span>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--c-text3)' }}>📍 {t.city}</span>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--c-text3)' }}>👥 {t.teams} équipes</span>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--c-text3)' }}>🎽 Format {t.type}</span>
                                </div>
                            </div>

                            {/* Prize + CTA */}
                            <div style={{ textAlign: 'center', flexShrink: 0 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--c-text3)', marginBottom: 4 }}>Prix total</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: t.color, lineHeight: 1, marginBottom: 16 }}>{t.prize}</div>
                                <button
                                    className="btn btn-primary"
                                    style={{
                                        opacity: t.status === 'open' ? 1 : 0.4,
                                        pointerEvents: t.status === 'open' ? 'auto' : 'none',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {t.status === 'open' ? 'S\'inscrire' : 'Liste d\'attente'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Palmarès */}
                <div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: 32 }}>
                        Palmarès <span className="gradient-text">Copa Urbain</span>
                    </h2>
                    <div className="glass" style={{ overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                                    {['Année', 'Tournoi', 'Vainqueur 🏆', 'Finaliste'].map(h => (
                                        <th key={h} style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PALMARES.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: i < PALMARES.length - 1 ? '1px solid var(--c-border)' : 'none', transition: 'var(--t)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--c-green)' }}>{r.year}</td>
                                        <td style={{ padding: '18px 24px', color: 'var(--c-text2)', fontSize: '0.9rem' }}>{r.tournament}</td>
                                        <td style={{ padding: '18px 24px', fontWeight: 600 }}>{r.winner}</td>
                                        <td style={{ padding: '18px 24px', color: 'var(--c-text2)' }}>{r.runner}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
