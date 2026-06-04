import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TERRAINS = [
    {
        id: 1, name: 'Menzah Arena 5v5', type: '5', price: 120,
        rating: 4.9, reviews: 128, city: 'Casablanca – Maârif',
        available: true,
        img: 'https://images.unsplash.com/photo-1510051640316-cee39563ddab?w=600&q=80',
    },
    {
        id: 2, name: 'Atlas Seven Park', type: '7', price: 200,
        rating: 4.8, reviews: 94, city: 'Rabat – Agdal',
        available: true,
        img: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&q=80',
    },
    {
        id: 3, name: 'Grand Stade 11', type: '11', price: 350,
        rating: 4.7, reviews: 61, city: 'Marrakech – Guéliz',
        available: false,
        img: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&q=80',
    },
    {
        id: 4, name: 'Urban Cage Casablanca', type: '5', price: 100,
        rating: 4.6, reviews: 203, city: 'Casablanca – Hay Hassani',
        available: true,
        img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80',
    },
];

const STATS = [
    { value: '1 200+', label: 'Réservations / mois' },
    { value: '48', label: 'Terrains partenaires' },
    { value: '8 500+', label: 'Joueurs actifs' },
    { value: '4.9★', label: 'Note moyenne' },
];

const HOW = [
    { step: '01', title: 'Trouvez votre terrain', desc: 'Filtrez par format (5v5, 7v7, 11v11), ville et horaire disponible au Maroc.' },
    { step: '02', title: 'Réservez en 2 clics', desc: 'Choisissez votre créneau et réglez en ligne via carte bancaire ou CIH.' },
    { step: '03', title: 'Jouez !', desc: 'Recevez votre confirmation instantanée et profitez de votre session.' },
];

const TESTIMONIALS = [
    { name: 'Youssef B.', avatar: 'YB', text: 'La plateforme est incroyable. Réservation en moins de 2 minutes, confirmation immédiate. On revient chaque week-end à Casablanca.', stars: 5 },
    { name: 'Fatima Z.', avatar: 'FZ', text: 'Super fluide ! Les terrains de Rabat sont bien référencés et les photos correspondent à la réalité. Je recommande vivement.', stars: 5 },
    { name: 'Hamza M.', avatar: 'HM', text: 'J\'ai commandé des crampons depuis Marrakech, livré en 2 jours. La boutique est top, prix compétitifs.', stars: 5 },
];

function Stars({ n }) {
    return <span style={{ color: '#ffd600', letterSpacing: 2 }}>{'★'.repeat(n)}</span>;
}

export default function Home() {
    return (
        <div className="page-content">

            {/* ====== HERO ====== */}
            <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                {/* Hero background image */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    backgroundImage: 'url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1400&q=80)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    filter: 'brightness(0.2)',
                }} />

                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ maxWidth: 780 }}>
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
                            <span className="badge badge-green" style={{ marginBottom: 24, display: 'inline-flex' }}>
                                <span className="notif-dot" />Plateforme N°1 au Maroc
                            </span>
                            <h1 style={{ fontSize: 'clamp(3rem,7vw,6rem)', lineHeight: 1.02, marginBottom: 28 }}>
                                Réservez.<br /><span className="gradient-text">Jouez.</span><br />Régnez.
                            </h1>
                            <p style={{ fontSize: '1.2rem', color: 'var(--c-text2)', maxWidth: 520, marginBottom: 40, lineHeight: 1.7 }}>
                                La plateforme N°1 au Maroc pour réserver vos terrains de football, organiser des tournois et vous équiper avec les meilleures marques sportives.
                            </p>
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <Link to="/terrains" className="btn btn-primary" style={{ fontSize: '1rem', padding: '16px 32px' }}>Trouver un terrain →</Link>
                                <Link to="/boutique" className="btn btn-outline" style={{ fontSize: '1rem', padding: '16px 32px' }}>Notre boutique</Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ====== STATS BANNER ====== */}
            <section style={{ padding: '0 0 80px 0' }}>
                <div className="container">
                    <div className="glass" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '40px 0' }}>
                        {STATS.map((s, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '0 24px', borderRight: i < 3 ? '1px solid var(--c-border)' : 'none' }}>
                                <div className="stat-value gradient-text">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== FEATURED TERRAINS ====== */}
            <section className="section">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
                        <div>
                            <p className="label">Disponibles maintenant</p>
                            <h2 style={{ fontSize: '2.8rem', marginTop: 8 }}>Terrains <span className="gradient-text">en vedette</span></h2>
                        </div>
                        <Link to="/terrains" className="btn btn-outline">Voir tout →</Link>
                    </div>

                    <div className="grid-auto">
                        {TERRAINS.map((t, i) => (
                            <motion.div key={t.id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .1, duration: .6 }} className="card-terrain">
                                <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                                    <img src={t.img} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s ease' }}
                                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                    />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,8,16,.8) 0%, transparent 60%)' }} />
                                    <div style={{ position: 'absolute', top: 12, left: 12 }}>
                                        <span className={`badge badge-${t.available ? 'green' : 'orange'}`}>
                                            {t.available ? <><span className="notif-dot" />Disponible</> : 'Complet'}
                                        </span>
                                    </div>
                                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                                        <span className="badge badge-blue">Foot {t.type}v{t.type}</span>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.15rem', marginBottom: 4 }}>{t.name}</h3>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--c-text3)' }}>📍 {t.city}</span>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--c-green)', lineHeight: 1 }}>{t.price} MAD</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--c-text3)' }}>/ heure</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
                                        <Stars n={Math.floor(t.rating)} /><span style={{ fontSize: '0.82rem', color: 'var(--c-text2)' }}>{t.rating} ({t.reviews} avis)</span>
                                    </div>
                                    <Link to={`/terrains/${t.id}`} className="btn btn-primary"
                                        style={{ width: '100%', justifyContent: 'center', opacity: t.available ? 1 : .4, pointerEvents: t.available ? 'all' : 'none' }}>
                                        {t.available ? 'Réserver maintenant' : 'Voir disponibilités'}
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== HOW IT WORKS ====== */}
            <section className="section" style={{ background: 'var(--c-bg2)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <p className="label">Simple & rapide</p>
                        <h2 style={{ fontSize: '2.8rem', marginTop: 8 }}>Comment ça <span className="gradient-text">marche ?</span></h2>
                    </div>
                    <div className="grid-3">
                        {HOW.map((h, i) => (
                            <div key={i} className="glass" style={{ padding: '40px 32px' }}>
                                <div style={{ fontSize: '3rem', fontFamily: 'Rajdhani,sans-serif', fontWeight: 900, color: 'var(--c-green)', opacity: .3, lineHeight: 1, marginBottom: 16 }}>{h.step}</div>
                                <h3 style={{ fontSize: '1.4rem', marginBottom: 12 }}>{h.title}</h3>
                                <p style={{ color: 'var(--c-text2)', lineHeight: 1.7 }}>{h.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== BOUTIQUE PROMO ====== */}
            <section className="section">
                <div className="container">
                    <div className="glass" style={{ overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'stretch' }}>
                        <div style={{ padding: 56 }}>
                            <p className="label">Notre boutique</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '12px 0 20px' }}>Équipez-vous <span className="gradient-text">comme un pro</span></h2>
                            <p style={{ color: 'var(--c-text2)', lineHeight: 1.8, marginBottom: 32 }}>
                                Chaussures premium, maillots, ballons certifiés — livraison rapide partout au Maroc depuis Casablanca, Rabat et Marrakech.
                            </p>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                                {['Nike', 'Adidas', 'Puma', 'New Balance'].map(m => <span key={m} className="badge badge-blue">{m}</span>)}
                            </div>
                            <Link to="/boutique" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 28px' }}>Découvrir la boutique</Link>
                        </div>
                        <div style={{ height: 400, overflow: 'hidden' }}>
                            <img
                                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
                                alt="équipement sportif"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== TESTIMONIALS ====== */}
            <section className="section" style={{ background: 'var(--c-bg2)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <p className="label">Ils nous font confiance</p>
                        <h2 style={{ fontSize: '2.8rem', marginTop: 8 }}>Ce que disent <span className="gradient-text">nos joueurs</span></h2>
                    </div>
                    <div className="grid-3">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="glass" style={{ padding: 32 }}>
                                <Stars n={t.stars} />
                                <p style={{ color: 'var(--c-text2)', margin: '16px 0 24px', lineHeight: 1.7, fontSize: '0.95rem' }}>"{t.text}"</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>{t.avatar}</div>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== CTA ====== */}
            <section className="section">
                <div className="container">
                    <div style={{
                        textAlign: 'center', padding: '80px 40px',
                        background: 'radial-gradient(ellipse at center, rgba(0,230,118,0.08) 0%, transparent 70%)',
                        border: '1px solid rgba(0,230,118,0.15)', borderRadius: 28,
                    }}>
                        <h2 style={{ fontSize: '3rem', marginBottom: 12 }}>Prêt à jouer ?</h2>
                        <p style={{ color: 'var(--c-text2)', fontSize: '1.1rem', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
                            Rejoignez plus de 8 500 joueurs actifs sur la plateforme N°1 du football urbain au Maroc.
                        </p>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                            <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '16px 36px' }}>Créer mon compte gratuitement</Link>
                            <Link to="/terrains" className="btn btn-outline" style={{ fontSize: '1.05rem', padding: '16px 36px' }}>Voir les terrains</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== FOOTER ====== */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div>
                            <div className="logo" style={{ marginBottom: 16 }}>URBAIN<span className="gradient-text">FOOT</span></div>
                            <p style={{ color: 'var(--c-text2)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 280 }}>
                                La plateforme de référence pour la réservation de terrains et l'équipement sportif au Maroc.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ marginBottom: 16, fontSize: '0.85rem', color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Terrains</h4>
                            <div className="footer-links">
                                <a href="#">Foot 5v5</a><a href="#">Foot 7v7</a><a href="#">Foot 11v11</a>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ marginBottom: 16, fontSize: '0.85rem', color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Boutique</h4>
                            <div className="footer-links">
                                <a href="#">Chaussures</a><a href="#">Maillots</a><a href="#">Ballons</a><a href="#">Accessoires</a>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ marginBottom: 16, fontSize: '0.85rem', color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Aide</h4>
                            <div className="footer-links">
                                <a href="#">FAQ</a><a href="#">Contact</a><a href="#">Partenaires</a><a href="#">CGU</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <span>© 2026 URBAIN FOOT Maroc. Tous droits réservés.</span>
                        <span>Casablanca 🇲🇦</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
