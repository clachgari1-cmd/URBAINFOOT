import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const CATEGORIES = ['Tous', 'Chaussures', 'Maillots', 'Ballons', 'Gardien', 'Accessoires'];

const PRODUCTS = [
    {
        id: 1, name: 'Nike Phantom GX Elite', cat: 'Chaussures', price: 1890, oldPrice: 2290, brand: 'Nike',
        img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
        rating: 4.9, reviews: 312, badge: 'Bestseller',
        desc: 'Chaussures de pointe pour terrain synthétique. Technologie Ghost Lace invisible.',
    },
    {
        id: 2, name: 'Adidas Predator Edge', cat: 'Chaussures', price: 1490, oldPrice: null, brand: 'Adidas',
        img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80',
        rating: 4.8, reviews: 198, badge: 'Nouveau',
        desc: 'Tige texturée pour une précision maximale. Semelle SG adaptée aux terrains lourds.',
    },
    {
        id: 3, name: 'Ballon FIFA Pro UCL', cat: 'Ballons', price: 590, oldPrice: 790, brand: 'Adidas',
        img: 'https://images.unsplash.com/photo-1614632537239-e1258259c651?w=500&q=80',
        rating: 4.8, reviews: 445, badge: 'Officiel',
        desc: 'Ballon certifié FIFA Quality Pro. Utilisé dans les compétitions officelles.',
    },
    {
        id: 4, name: 'Maillot Squad Pro 2026', cat: 'Maillots', price: 790, oldPrice: null, brand: 'Nike',
        img: 'https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?w=500&q=80',
        rating: 4.7, reviews: 223, badge: null,
        desc: 'Maillot Dri-FIT léger et respirant. Personnalisable avec nom et numéro.',
    },
    {
        id: 5, name: 'Gants Reusch Attrakt', cat: 'Gardien', price: 850, oldPrice: 1100, brand: 'Reusch',
        img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&q=80',
        rating: 4.9, reviews: 87, badge: 'Pro',
        desc: 'Gants de gardien latex allemand, grip exceptionnel par tous les temps.',
    },
    {
        id: 6, name: 'Puma King Premium', cat: 'Chaussures', price: 990, oldPrice: null, brand: 'Puma',
        img: 'https://images.unsplash.com/photo-1556906781-9a412961a28b?w=500&q=80',
        rating: 4.6, reviews: 132, badge: null,
        desc: 'Chaussures en cuir véritable pour une touche de balle incomparable.',
    },
    {
        id: 7, name: 'Sac de Sport Adidas', cat: 'Accessoires', price: 490, oldPrice: 650, brand: 'Adidas',
        img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
        rating: 4.7, reviews: 178, badge: 'Solde',
        desc: 'Grande capacité 50L, compartiment chaussures séparé, bandoulière ajustable.',
    },
    {
        id: 8, name: 'Protège-tibias Elite', cat: 'Accessoires', price: 240, oldPrice: null, brand: 'Nike',
        img: 'https://images.unsplash.com/photo-1589987607627-616cca389d44?w=500&q=80',
        rating: 4.5, reviews: 267, badge: null,
        desc: 'Protection légère et anatomique, ultra-confort en match.',
    },
    {
        id: 9, name: 'New Balance Furon v7', cat: 'Chaussures', price: 1350, oldPrice: null, brand: 'New Balance',
        img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&q=80',
        rating: 4.7, reviews: 89, badge: 'Nouveau',
        desc: 'Chaussures légères pour les milieux de terrain. Semelle FG polyvalente.',
    },
];

function Stars({ n }) {
    return <span style={{ color: '#ffd600', letterSpacing: 2, fontSize: '0.85rem' }}>{'★'.repeat(n)}</span>;
}

export default function Boutique() {
    const [cat, setCat] = useState('Tous');
    const [added, setAdded] = useState({});
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/products')
            .then(res => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors de la récupération des produits :", err);
                setLoading(false);
            });
    }, []);

    const displayed = cat === 'Tous' ? products : products.filter(p => p.category === cat);

    const handleAdd = (product) => {
        addToCart(product);
        setAdded(prev => ({ ...prev, [product.id]: true }));
        setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1500);
    };

    return (
        <div className="page-content">
            <div className="container" style={{ padding: '40px 24px 80px' }}>

                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'flex-end', marginBottom: 48 }}>
                    <div>
                        <p className="label">Équipement sportif · Maroc</p>
                        <h1 style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', marginTop: 8 }}>La <span className="gradient-text">Boutique</span></h1>
                        <p style={{ color: 'var(--c-text2)', marginTop: 12, fontSize: '1.05rem' }}>
                            {PRODUCTS.length} produits • Livraison partout au Maroc sous 48h
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="badge badge-green">✓ Retours gratuits 30j</span>
                        <span className="badge badge-blue">📦 Livraison 48h Maroc</span>
                    </div>
                </div>

                {/* Category filters */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
                    {CATEGORIES.map(c => (
                        <button key={c} onClick={() => setCat(c)} className="btn"
                            style={{
                                padding: '8px 20px', fontSize: '0.85rem', fontWeight: 600,
                                background: cat === c ? 'var(--c-green)' : 'rgba(255,255,255,0.04)',
                                color: cat === c ? '#030806' : 'var(--c-text2)',
                                border: `1px solid ${cat === c ? 'var(--c-green)' : 'var(--c-border)'}`,
                                borderRadius: 99,
                            }}
                        >{c}</button>
                    ))}
                </div>

                {/* Product grid */}
                <div className="grid-auto">
                    {loading ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                            <div className="loader" style={{ margin: '0 auto 16px' }}></div>
                            <p style={{ color: 'var(--c-text2)' }}>Chargement de la boutique...</p>
                        </div>
                    ) : displayed.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                            <p style={{ color: 'var(--c-text2)' }}>Aucun produit disponible dans cette catégorie.</p>
                        </div>
                    ) : (
                        displayed.map((p, i) => (
                            <motion.div key={p.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }}
                                style={{
                                    background: 'var(--c-card)', border: '1px solid var(--c-border)',
                                    borderRadius: 'var(--r-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                                    transition: 'var(--t)',
                                }}
                                whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(0,0,0,.6)', borderColor: 'var(--c-border-hover)' }}
                            >
                                <div style={{ height: 220, overflow: 'hidden', position: 'relative', background: 'rgba(255,255,255,0.03)' }}>
                                    <img src={p.image_path || p.img} alt={p.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s ease' }}
                                        onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                    />
                                    {p.badge && (
                                        <span style={{ position: 'absolute', top: 12, left: 12 }}
                                            className={`badge badge-${p.badge === 'Bestseller' ? 'green' : p.badge === 'Solde' ? 'orange' : 'blue'}`}>
                                            {p.badge}
                                        </span>
                                    )}
                                </div>
                                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--c-green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                                        {p.partner?.name || p.brand || 'Marque'}
                                    </span>
                                    <h3 style={{ margin: '6px 0 8px', fontSize: '1.05rem' }}>{p.name}</h3>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--c-text2)', lineHeight: 1.6, marginBottom: 10 }}>{p.description || p.desc}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                                        <Stars n={Math.floor(p.rating || 5)} />
                                        <span style={{ fontSize: '0.78rem', color: 'var(--c-text3)' }}>{p.rating || 4.8} ({p.reviews || 120})</span>
                                    </div>
                                    <div style={{ marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
                                            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--c-green)' }}>{Number(p.price).toLocaleString()} MAD</span>
                                            {p.oldPrice && <span style={{ fontSize: '0.85rem', color: 'var(--c-text3)', textDecoration: 'line-through' }}>{p.oldPrice.toLocaleString()} MAD</span>}
                                        </div>
                                        <button onClick={() => handleAdd(p)} className="btn btn-primary"
                                            style={{ width: '100%', justifyContent: 'center', background: added[p.id] ? '#1a6e3c' : 'var(--c-green)', transition: 'background .3s' }}
                                            disabled={p.stock <= 0}
                                        >
                                            {p.stock <= 0 ? 'Rupture de stock' : added[p.id] ? '✓ Ajouté au panier!' : 'Ajouter au panier'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
