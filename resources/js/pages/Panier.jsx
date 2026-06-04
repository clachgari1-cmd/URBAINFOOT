import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Panier() {
    const { cart, removeFromCart, addToCart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [checkingOut, setCheckingOut] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    // KEY FIX: separate success state so empty-cart screen doesn't override it
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderTotal, setOrderTotal] = useState(0);
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: user?.name || '',
        customer_phone: '',
        customer_address: '',
    });

    const openCheckoutForm = () => {
        setFormData({
            customer_name: user?.name || '',
            customer_phone: '',
            customer_address: '',
        });
        setErrorMsg(null);
        setShowCheckoutForm(true);
    };

    const handleCheckout = async (e) => {
        if (e) e.preventDefault();
        setCheckingOut(true);
        setErrorMsg(null);

        try {
            // Group items by partner_id (brand admin)
            const groups = {};
            cart.forEach(item => {
                const partnerId = item.partner_id;
                if (!partnerId) {
                    throw new Error(
                        `Le produit "${item.name}" n'est pas lié à une marque. Veuillez recharger la boutique.`
                    );
                }
                if (!groups[partnerId]) groups[partnerId] = [];
                groups[partnerId].push({
                    product_id: item.id,
                    quantity: item.quantity,
                });
            });

            // Send checkout requests for each brand in parallel
            const promises = Object.entries(groups).map(([partnerId, items]) =>
                axios.post('/api/orders', {
                    partner_id: parseInt(partnerId),
                    items,
                    customer_name: formData.customer_name,
                    customer_phone: formData.customer_phone,
                    customer_address: formData.customer_address,
                })
            );

            const total = cartTotal; // save total before clearing
            await Promise.all(promises);

            // SUCCESS: set success state BEFORE clearing cart
            setOrderTotal(total);
            setOrderSuccess(true);
            setShowCheckoutForm(false);
            clearCart();

        } catch (error) {
            console.error(error);
            if (error.message && !error.response) {
                setErrorMsg(error.message);
            } else {
                const apiError =
                    error.response?.data?.errors?.items?.[0] ||
                    error.response?.data?.errors?.items ||
                    error.response?.data?.errors?.customer_name?.[0] ||
                    error.response?.data?.errors?.customer_phone?.[0] ||
                    error.response?.data?.errors?.customer_address?.[0] ||
                    error.response?.data?.message ||
                    'Une erreur est survenue lors du passage de la commande.';
                setErrorMsg(typeof apiError === 'object' ? JSON.stringify(apiError) : apiError);
            }
        } finally {
            setCheckingOut(false);
        }
    };

    // --- ORDER SUCCESS SCREEN ---
    // Must be checked BEFORE cart.length === 0
    if (orderSuccess) {
        return (
            <div className="page-content">
                <div className="container" style={{ padding: '80px 24px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
                    <div style={{
                        width: 100, height: 100, borderRadius: '50%',
                        background: 'rgba(26,110,60,0.15)', border: '2px solid var(--c-green)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '3rem', margin: '0 auto 32px',
                    }}>
                        ✓
                    </div>
                    <h2 style={{ fontSize: '2.2rem', marginBottom: 12 }}>
                        Commande <span className="gradient-text">confirmée !</span>
                    </h2>
                    <p style={{ color: 'var(--c-text2)', fontSize: '1.05rem', marginBottom: 8 }}>
                        Merci pour votre commande. L'administrateur de la marque a été notifié.
                    </p>
                    <p style={{ color: 'var(--c-text3)', fontSize: '0.9rem', marginBottom: 40 }}>
                        Montant total payé : <strong style={{ color: 'var(--c-green)' }}>{orderTotal} MAD</strong>
                    </p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/boutique" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                            Continuer les achats →
                        </Link>
                        <Link to="/" className="btn" style={{ fontSize: '1rem', padding: '14px 32px', border: '1px solid var(--c-border)' }}>
                            Retour à l'accueil
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // --- EMPTY CART SCREEN ---
    if (cart.length === 0) {
        return (
            <div className="page-content">
                <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '5rem', marginBottom: 24 }}>🛒</div>
                    <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>Votre panier est vide</h2>
                    <p style={{ color: 'var(--c-text2)', marginBottom: 32 }}>
                        Parcourez notre boutique pour trouver votre équipement.
                    </p>
                    <Link to="/boutique" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                        Aller à la boutique →
                    </Link>
                </div>
            </div>
        );
    }

    // --- CART SCREEN ---
    return (
        <div className="page-content">
            <div className="container" style={{ padding: '40px 24px 80px' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: 48 }}>Mon <span className="gradient-text">Panier</span></h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'flex-start' }}>

                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {cart.map(item => (
                            <div key={item.id} className="glass" style={{ display: 'flex', gap: 20, padding: 20, alignItems: 'center' }}>
                                <div style={{
                                    width: 80, height: 80, borderRadius: 12, flexShrink: 0,
                                    overflow: 'hidden', background: 'rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {item.image_path || item.img ? (
                                        <img
                                            src={item.image_path || item.img}
                                            alt={item.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '2.5rem' }}>📦</span>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--c-green)', fontWeight: 700, marginBottom: 4 }}>
                                        {item.partner?.name || item.brand || 'Marque'}
                                    </div>
                                    <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{item.name}</h3>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--c-text3)' }}>
                                        {item.category || item.cat || ''}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--c-border)', color: 'var(--c-text2)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        −
                                    </button>
                                    <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                                    <button
                                        onClick={() => addToCart(item)}
                                        style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--c-border)', color: 'var(--c-text2)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        +
                                    </button>
                                </div>
                                <div style={{ textAlign: 'right', minWidth: 80 }}>
                                    <div style={{ fontWeight: 800, color: 'var(--c-green)', fontSize: '1.2rem' }}>
                                        {item.price * item.quantity} MAD
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--c-text3)' }}>{item.price} MAD / u.</div>
                                </div>
                            </div>
                        ))}
                        <button onClick={clearCart} style={{ alignSelf: 'flex-start', fontSize: '0.85rem', color: 'var(--c-red)', padding: '8px 0' }}>
                            🗑 Vider le panier
                        </button>
                    </div>

                    {/* Summary */}
                    <div style={{ position: 'sticky', top: 120 }}>
                        <div className="glass" style={{ padding: 28 }}>
                            <h3 style={{ fontSize: '1.3rem', marginBottom: 24 }}>Récapitulatif</h3>

                            {/* Error message */}
                            {errorMsg && (
                                <div style={{
                                    padding: 12, borderRadius: 8,
                                    background: 'rgba(211,47,47,0.15)', border: '1px solid var(--c-red)',
                                    color: 'var(--c-red)', fontSize: '0.85rem', marginBottom: 16
                                }}>
                                    ⚠️ {errorMsg}
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--c-text2)', fontSize: '0.9rem' }}>
                                    <span>Sous-total</span><span>{cartTotal} MAD</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--c-text2)', fontSize: '0.9rem' }}>
                                    <span>Livraison Express 24h</span>
                                    <span style={{ color: 'var(--c-green)' }}>Gratuite</span>
                                </div>
                                <hr className="divider" style={{ margin: '8px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem' }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--c-green)' }}>{cartTotal} MAD</span>
                                </div>
                            </div>

                            {user ? (
                                <button
                                    id="btn-passer-commande"
                                    onClick={openCheckoutForm}
                                    className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '14px' }}
                                    disabled={checkingOut}
                                >
                                    Passer la commande →
                                </button>
                            ) : (
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--c-text2)', marginBottom: 12, textAlign: 'center' }}>
                                        Connectez-vous pour commander.
                                    </p>
                                    <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}>
                                        Se connecter
                                    </Link>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--c-text3)' }}>🔒 Paiement sécurisé</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--c-text3)' }}>✓ Retours 30j</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de checkout */}
            {showCheckoutForm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 20
                }}>
                    <div className="glass" style={{
                        maxWidth: 500, width: '100%', padding: 32,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid var(--c-border)',
                        background: 'var(--c-bg2)'
                    }}>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: 24, fontWeight: 700 }}>
                            Informations de <span className="gradient-text">Livraison</span>
                        </h3>
                        <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="form-group">
                                <label className="form-label">Nom complet</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.customer_name}
                                    onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                                    required
                                    placeholder="Ex: Yasser Taha"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Numéro de téléphone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={formData.customer_phone}
                                    onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                                    required
                                    placeholder="Ex: +212 612 345678"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Adresse de livraison</label>
                                <textarea
                                    className="form-input"
                                    style={{ minHeight: 100, resize: 'vertical' }}
                                    value={formData.customer_address}
                                    onChange={e => setFormData({ ...formData, customer_address: e.target.value })}
                                    required
                                    placeholder="Adresse complète, Ville, Code postal"
                                />
                            </div>

                            {errorMsg && (
                                <div style={{
                                    padding: 12, borderRadius: 4,
                                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--c-red)',
                                    color: 'var(--c-red)', fontSize: '0.85rem'
                                }}>
                                    ⚠️ {errorMsg}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowCheckoutForm(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={checkingOut}
                                >
                                    {checkingOut ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span className="loader" style={{ width: 14, height: 14 }} />
                                            Traitement...
                                        </span>
                                    ) : 'Confirmer la commande'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
