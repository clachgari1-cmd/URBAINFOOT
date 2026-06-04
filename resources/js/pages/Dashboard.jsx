import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

function StatCard({ value, label, sub, color }) {
    return (
        <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{label}</div>
            <div className="stat-value" style={{ color: color || 'var(--c-text)' }}>{value}</div>
            {sub && <div className="stat-label">{sub}</div>}
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    // API loaded states
    const [orders, setOrders] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [products, setProducts] = useState([]);
    const [pitches, setPitches] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // ID of currently updating order/booking

    // Add modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [productForm, setProductForm] = useState({
        name: '',
        price: '',
        stock: '',
        category: '',
        description: ''
    });
    const [productImageFile, setProductImageFile] = useState(null);
    const [productImagePreview, setProductImagePreview] = useState(null);
    const [pitchImageFile, setPitchImageFile] = useState(null);
    const [pitchImagePreview, setPitchImagePreview] = useState(null);
    const [pitchForm, setPitchForm] = useState({
        name: '',
        price_per_hour: '',
        type: '5',
        city: '',
        description: '',
        features: 'Vestiaires, Éclairage LED, Pelouse synthétique'
    });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState(null);

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        if (user.type === 'mark') {
            Promise.all([
                axios.get('/api/partner/orders'),
                axios.get('/api/partner/products')
            ]).then(([ordersRes, productsRes]) => {
                setOrders(ordersRes.data);
                setProducts(productsRes.data);
                setLoading(false);
            }).catch(err => {
                console.error("Erreur lors de la récupération des données de marque :", err);
                setLoading(false);
            });
        } else if (user.type === 'terrain_manager') {
            Promise.all([
                axios.get('/api/partner/bookings'),
                axios.get('/api/partner/pitches')
            ]).then(([bookingsRes, pitchesRes]) => {
                setBookings(bookingsRes.data);
                setPitches(pitchesRes.data);
                setLoading(false);
            }).catch(err => {
                console.error("Erreur lors de la récupération des données de terrain :", err);
                setLoading(false);
            });
        }
    }, [user]);

    if (!user) return <Navigate to="/login" replace />;

    const isMark = user.type === 'mark';
    const isTerrain = user.type === 'terrain_manager';

    // Update status handlers
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        setActionLoading(orderId);
        try {
            const res = await axios.patch(`/api/partner/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: res.data.status } : o));
        } catch (err) {
            console.error("Erreur lors de la mise à jour de la commande :", err);
            alert("Erreur lors du changement de statut : " + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateBookingStatus = async (bookingId, newStatus) => {
        setActionLoading(bookingId);
        try {
            const res = await axios.patch(`/api/partner/bookings/${bookingId}/status`, { status: newStatus });
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: res.data.status } : b));
        } catch (err) {
            console.error("Erreur lors de la mise à jour de la réservation :", err);
            alert("Erreur lors du changement de statut : " + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    // Add Product & Terrain handlers
    const handleAddProductSubmit = async (e) => {
        e.preventDefault();
        if (!productImageFile) {
            setAddError("Veuillez sélectionner une image pour le produit.");
            return;
        }
        setAddLoading(true);
        setAddError(null);
        try {
            const formData = new FormData();
            formData.append('name', productForm.name);
            formData.append('price', parseFloat(productForm.price));
            formData.append('stock', parseInt(productForm.stock));
            formData.append('category', productForm.category || 'Standard');
            formData.append('description', productForm.description || '');
            formData.append('image', productImageFile);

            const res = await axios.post('/api/partner/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProducts(prev => [res.data, ...prev]);
            setShowAddModal(false);
            setProductForm({ name: '', price: '', stock: '', category: '', description: '' });
            setProductImageFile(null);
            setProductImagePreview(null);
        } catch (err) {
            console.error("Erreur d'ajout de produit :", err);
            setAddError(err.response?.data?.message || "Une erreur est survenue lors de l'ajout du produit.");
        } finally {
            setAddLoading(false);
        }
    };

    const handleAddPitchSubmit = async (e) => {
        e.preventDefault();
        if (!pitchImageFile) {
            setAddError("Veuillez sélectionner une photo pour le terrain.");
            return;
        }
        setAddLoading(true);
        setAddError(null);
        try {
            const featuresArray = pitchForm.features.split(',').map(f => f.trim()).filter(Boolean);
            const formData = new FormData();
            formData.append('name', pitchForm.name);
            formData.append('price_per_hour', parseFloat(pitchForm.price_per_hour));
            formData.append('type', pitchForm.type);
            formData.append('city', pitchForm.city || 'Casablanca');
            formData.append('description', pitchForm.description || '');
            featuresArray.forEach((f, i) => formData.append(`features[${i}]`, f));
            formData.append('image', pitchImageFile);

            const res = await axios.post('/api/partner/pitches', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPitches(prev => [res.data, ...prev]);
            setShowAddModal(false);
            setPitchForm({ name: '', price_per_hour: '', type: '5', city: '', description: '', features: 'Vestiaires, Éclairage LED, Pelouse synthétique' });
            setPitchImageFile(null);
            setPitchImagePreview(null);
        } catch (err) {
            console.error("Erreur d'ajout de terrain :", err);
            setAddError(err.response?.data?.message || "Une erreur est survenue lors de l'ajout du terrain.");
        } finally {
            setAddLoading(false);
        }
    };

    // Delete handlers
    const handleDeleteProduct = async (id) => {
        if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
        try {
            await axios.delete(`/api/partner/products/${id}`);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert("Erreur lors de la suppression : " + (err.response?.data?.message || err.message));
        }
    };

    const handleDeletePitch = async (id) => {
        if (!confirm("Voulez-vous vraiment supprimer ce terrain ?")) return;
        try {
            await axios.delete(`/api/partner/pitches/${id}`);
            setPitches(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert("Erreur lors de la suppression : " + (err.response?.data?.message || err.message));
        }
    };

    // Calculate stats
    const totalRevenue = isMark
        ? orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + parseFloat(o.total_amount) : sum, 0)
        : bookings.reduce((sum, b) => b.status !== 'cancelled' ? sum + parseFloat(b.total_price) : sum, 0);

    const totalVentes = isMark ? orders.length : bookings.length;
    const itemsCount = isMark ? products.length : pitches.length;

    // Badges helpers
    const renderOrderStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="badge badge-orange">En attente</span>;
            case 'paid': return <span className="badge badge-blue">Payée</span>;
            case 'delivered': return <span className="badge badge-green">Livrée</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    const renderBookingStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="badge badge-orange">En attente</span>;
            case 'confirmed': return <span className="badge badge-green">Confirmée</span>;
            case 'cancelled': return <span className="badge badge-red" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--c-red)', border: '1px solid var(--c-red)' }}>Annulée</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div className="loader" />
                    <p style={{ color: 'var(--c-text2)', fontSize: '0.9rem' }}>Chargement des données du dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <div className="container" style={{ padding: '40px 24px 80px' }}>

                {/* Top bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                    <div>
                        <p className="label">{isMark ? 'Espace Admin Marque' : 'Espace Admin Terrain'}</p>
                        <h1 style={{ fontSize: '2.5rem', marginTop: 6 }}>
                            Bonjour, <span className="gradient-text">{user.name}</span> 👋
                        </h1>
                    </div>
                    <button 
                        onClick={() => { setShowAddModal(true); setAddError(null); }}
                        className="btn btn-primary" 
                        style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                    >
                        + Ajouter {isMark ? 'un produit' : 'un terrain'}
                    </button>
                </div>

                {/* KPI Stats */}
                <div className="grid-4" style={{ marginBottom: 40 }}>
                    <StatCard value={`${totalRevenue.toLocaleString()} MAD`} label="Chiffre d'affaires" sub="Revenus cumulés" color="var(--c-green)" />
                    <StatCard value={totalVentes} label={isMark ? 'Commandes reçues' : 'Réservations reçues'} sub="Total historique" />
                    <StatCard value={itemsCount} label={isMark ? 'Produits catalogue' : 'Terrains en ligne'} />
                    <StatCard value="4.9★" label="Évaluation" sub="Moyenne clients" color="#ffd600" />
                </div>

                {/* Tabs */}
                <div className="tab-row" style={{ maxWidth: 480, marginBottom: 32 }}>
                    {['overview', 'items'].map(t => (
                        <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                            {{ overview: isMark ? '🛒 Commandes' : '⚽ Réservations', items: isMark ? '📦 Mon Catalogue' : '🏟️ Mes Terrains' }[t]}
                        </button>
                    ))}
                </div>

                {/* Overview (Orders or Bookings) tab */}
                {activeTab === 'overview' && (
                    <div className="glass" style={{ overflow: 'hidden', padding: 24, borderRadius: 16 }}>
                        <h3 style={{ marginBottom: 20 }}>{isMark ? 'Liste des Commandes Reçues' : 'Liste des Réservations Reçues'}</h3>
                        
                        {isMark ? (
                            orders.length === 0 ? (
                                <p style={{ color: 'var(--c-text3)', textAlign: 'center', padding: '40px 0' }}>Aucune commande pour le moment.</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--c-border)', color: 'var(--c-text3)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '.07em' }}>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Commande</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Client / Contact</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Articles</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Montant</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Statut</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order, i) => (
                                                <tr key={order.id} style={{ borderBottom: i < orders.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
                                                    <td style={{ padding: '16px 20px', fontWeight: 700 }}>
                                                        #{order.id}
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--c-text3)', fontWeight: 400, marginTop: 4 }}>
                                                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <div style={{ fontWeight: 600, color: '#fff' }}>{order.customer_name || order.user?.name || 'Nom non fourni'}</div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--c-green)', marginTop: 2 }}>📞 {order.customer_phone || order.user?.email || 'Non renseigné'}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--c-text2)', marginTop: 4, maxWidth: 220, whiteSpace: 'normal' }}>
                                                            📍 {order.customer_address || 'Non renseignée'}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        {order.items?.map(item => (
                                                            <div key={item.id} style={{ fontSize: '0.85rem', color: 'var(--c-text2)', marginBottom: 4 }}>
                                                                • {item.product?.name} <strong style={{ color: '#fff' }}>(x{item.quantity})</strong>
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--c-green)', fontSize: '1.05rem' }}>
                                                        {order.total_amount} MAD
                                                    </td>
                                                    <td style={{ padding: '16px 20px' }}>{renderOrderStatusBadge(order.status)}</td>
                                                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                            {order.status === 'pending' && (
                                                                <button
                                                                    className="btn btn-primary"
                                                                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                                                    disabled={actionLoading === order.id}
                                                                    onClick={() => handleUpdateOrderStatus(order.id, 'paid')}
                                                                >
                                                                    Valider Paiement
                                                                </button>
                                                            )}
                                                            {order.status === 'paid' && (
                                                                <button
                                                                    className="btn"
                                                                    style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#3b82f6', color: '#fff' }}
                                                                    disabled={actionLoading === order.id}
                                                                    onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                                                >
                                                                    Marquer Livré
                                                                </button>
                                                            )}
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--c-text3)' }}>
                                                                {order.status === 'delivered' ? 'Livraison terminée' : ''}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : (
                            bookings.length === 0 ? (
                                <p style={{ color: 'var(--c-text3)', textAlign: 'center', padding: '40px 0' }}>Aucune réservation pour le moment.</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--c-border)', color: 'var(--c-text3)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '.07em' }}>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Réservation</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Client / Contact</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Terrain</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Date & Horaires</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Tarif</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Statut</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map((booking, i) => {
                                                const start = new Date(booking.start_time);
                                                const end = new Date(booking.end_time);
                                                const duration = Math.round((end - start) / (1000 * 60 * 60) * 10) / 10;
                                                
                                                return (
                                                    <tr key={booking.id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
                                                        <td style={{ padding: '16px 20px', fontWeight: 700 }}>#{booking.id}</td>
                                                        <td style={{ padding: '16px 20px' }}>
                                                            <div style={{ fontWeight: 600, color: '#fff' }}>{booking.customer_name || booking.user?.name || 'Nom non fourni'}</div>
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--c-green)', marginTop: 2 }}>📞 {booking.customer_phone || booking.user?.email || 'Non renseigné'}</div>
                                                        </td>
                                                        <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                                                            {booking.pitch?.name}
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--c-text3)', fontWeight: 400, marginTop: 2 }}>
                                                                Type: Foot {booking.pitch?.type}v{booking.pitch?.type}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px 20px' }}>
                                                            <div style={{ fontWeight: 600 }}>
                                                                📅 {start.toLocaleDateString('fr-FR')}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--c-text2)', marginTop: 4 }}>
                                                                🕒 {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} – {end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} ({duration}h)
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--c-green)', fontSize: '1.05rem' }}>
                                                            {booking.total_price} MAD
                                                        </td>
                                                        <td style={{ padding: '16px 20px' }}>{renderBookingStatusBadge(booking.status)}</td>
                                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                                {booking.status === 'pending' && (
                                                                    <>
                                                                        <button
                                                                            className="btn btn-primary"
                                                                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                                                            disabled={actionLoading === booking.id}
                                                                            onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                                                        >
                                                                            Confirmer
                                                                        </button>
                                                                        <button
                                                                            className="btn"
                                                                            style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--c-red)', color: 'var(--c-red)' }}
                                                                            disabled={actionLoading === booking.id}
                                                                            onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                                                        >
                                                                            Refuser
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {booking.status === 'confirmed' && (
                                                                    <button
                                                                        className="btn"
                                                                        style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--c-red)', color: 'var(--c-red)' }}
                                                                        disabled={actionLoading === booking.id}
                                                                        onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                                                    >
                                                                        Annuler
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Catalogue / Terrains tab */}
                {activeTab === 'items' && (
                    <div className="glass" style={{ overflow: 'hidden', padding: 24, borderRadius: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3>{isMark ? 'Mon Catalogue de Produits' : 'Mes Terrains de Football'}</h3>
                            <button 
                                onClick={() => { setShowAddModal(true); setAddError(null); }}
                                className="btn btn-primary" 
                                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                                + Ajouter {isMark ? 'un produit' : 'un terrain'}
                            </button>
                        </div>

                        {isMark ? (
                            products.length === 0 ? (
                                <p style={{ color: 'var(--c-text3)', textAlign: 'center', padding: '40px 0' }}>Aucun produit dans le catalogue.</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--c-border)', color: 'var(--c-text3)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Produit</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Prix</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Stock</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Catégorie</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((item, i) => (
                                                <tr key={item.id} style={{ borderBottom: i < products.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
                                                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{item.name}</td>
                                                    <td style={{ padding: '16px 20px', color: 'var(--c-green)', fontWeight: 700 }}>{item.price} MAD</td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <span style={{ color: item.stock < 5 ? 'var(--c-red)' : 'var(--c-text2)' }}>{item.stock} unités</span>
                                                    </td>
                                                    <td style={{ padding: '16px 20px', color: 'var(--c-text2)' }}>{item.category || 'Standard'}</td>
                                                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                            <button 
                                                                onClick={() => handleDeleteProduct(item.id)}
                                                                className="btn" 
                                                                style={{ padding: '6px 14px', fontSize: '0.8rem', border: '1px solid var(--c-red)', borderRadius: 8, color: 'var(--c-red)' }}
                                                            >
                                                                Supprimer
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : (
                            pitches.length === 0 ? (
                                <p style={{ color: 'var(--c-text3)', textAlign: 'center', padding: '40px 0' }}>Aucun terrain répertorié.</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--c-border)', color: 'var(--c-text3)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Terrain</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Format</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Tarif Horaire</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'left' }}>Ville</th>
                                                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pitches.map((item, i) => (
                                                <tr key={item.id} style={{ borderBottom: i < pitches.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
                                                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{item.name}</td>
                                                    <td style={{ padding: '16px 20px' }}><span className="badge badge-blue">Foot {item.type}v{item.type}</span></td>
                                                    <td style={{ padding: '16px 20px', color: 'var(--c-green)', fontWeight: 700 }}>{item.price_per_hour} MAD</td>
                                                    <td style={{ padding: '16px 20px', color: 'var(--c-text2)' }}>📍 {item.city || 'Maroc'}</td>
                                                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                            <button 
                                                                onClick={() => handleDeletePitch(item.id)}
                                                                className="btn" 
                                                                style={{ padding: '6px 14px', fontSize: '0.8rem', border: '1px solid var(--c-red)', borderRadius: 8, color: 'var(--c-red)' }}
                                                            >
                                                                Supprimer
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>

            {/* Modal d'Ajout */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', padding: 20
                }}>
                    <div className="glass" style={{
                        maxWidth: 500, width: '100%', padding: 32, borderRadius: 20,
                        background: 'var(--c-bg2)', border: '1px solid var(--c-border)',
                        maxHeight: '90vh', overflowY: 'auto', position: 'relative'
                    }}>
                        <button onClick={() => setShowAddModal(false)}
                            style={{ position: 'absolute', top: 20, right: 20, color: 'var(--c-text3)', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                            ✕
                        </button>
                        
                        <h3 style={{ fontSize: '1.8rem', marginBottom: 24, fontWeight: 700 }}>
                            Ajouter un <span className="gradient-text">{isMark ? 'Produit' : 'Terrain'}</span>
                        </h3>

                        {addError && (
                            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(211,47,47,0.15)', border: '1px solid var(--c-red)', color: 'var(--c-red)', fontSize: '0.85rem', marginBottom: 16 }}>
                                ⚠️ {addError}
                            </div>
                        )}

                        {isMark ? (
                            <form onSubmit={handleAddProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Nom du produit</label>
                                    <input className="form-input" type="text" required
                                        value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})}
                                        placeholder="Ex: Nike Phantom GX Elite" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div className="form-group">
                                        <label className="form-label">Prix (MAD)</label>
                                        <input className="form-input" type="number" step="0.01" required min="0"
                                            value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})}
                                            placeholder="Ex: 1890" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stock initial</label>
                                        <input className="form-input" type="number" required min="0"
                                            value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})}
                                            placeholder="Ex: 10" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Catégorie</label>
                                    <input className="form-input" type="text"
                                        value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}
                                        placeholder="Ex: Chaussures, Ballons, Maillots" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">📷 Photo du produit <span style={{ color: 'var(--c-red)', marginLeft: 4 }}>*</span></label>
                                    <label htmlFor="product-image-upload" style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        gap: 10, padding: '20px 16px', borderRadius: 12, cursor: 'pointer',
                                        border: `2px dashed ${productImageFile ? 'var(--c-green)' : 'var(--c-border)'}`,
                                        background: productImageFile ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                                        transition: 'border-color 0.2s, background 0.2s'
                                    }}>
                                        {productImagePreview ? (
                                            <img src={productImagePreview} alt="Aperçu"
                                                style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8 }} />
                                        ) : (
                                            <>
                                                <span style={{ fontSize: '2.5rem' }}>🖼️</span>
                                                <span style={{ color: 'var(--c-text2)', fontSize: '0.88rem', textAlign: 'center' }}>
                                                    Cliquez pour choisir une image depuis votre explorateur
                                                </span>
                                                <span style={{ color: 'var(--c-text3)', fontSize: '0.75rem' }}>
                                                    JPG, PNG, WEBP — Max 4 Mo
                                                </span>
                                            </>
                                        )}
                                        {productImageFile && (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--c-green)', fontWeight: 600 }}>
                                                ✅ {productImageFile.name}
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        id="product-image-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                                        required
                                        style={{ display: 'none' }}
                                        onChange={e => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setProductImageFile(file);
                                                setProductImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-input" style={{ minHeight: 80, resize: 'vertical' }}
                                        value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})}
                                        placeholder="Description détaillée du produit..." />
                                </div>
                                
                                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                                    <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-primary" disabled={addLoading}>
                                        {addLoading ? 'Création...' : 'Ajouter le produit'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleAddPitchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Nom du terrain</label>
                                    <input className="form-input" type="text" required
                                        value={pitchForm.name} onChange={e => setPitchForm({...pitchForm, name: e.target.value})}
                                        placeholder="Ex: Menzah Arena 5v5" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div className="form-group">
                                        <label className="form-label">Tarif horaire (MAD)</label>
                                        <input className="form-input" type="number" step="0.01" required min="0"
                                            value={pitchForm.price_per_hour} onChange={e => setPitchForm({...pitchForm, price_per_hour: e.target.value})}
                                            placeholder="Ex: 120" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Format de jeu</label>
                                        <select className="form-input" required style={{ background: '#0a0d1a' }}
                                            value={pitchForm.type} onChange={e => setPitchForm({...pitchForm, type: e.target.value})}>
                                            <option value="5" style={{ background: '#0a0d1a' }}>5v5</option>
                                            <option value="7" style={{ background: '#0a0d1a' }}>7v7</option>
                                            <option value="9" style={{ background: '#0a0d1a' }}>9v9</option>
                                            <option value="11" style={{ background: '#0a0d1a' }}>11v11</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ville</label>
                                    <input className="form-input" type="text" required
                                        value={pitchForm.city} onChange={e => setPitchForm({...pitchForm, city: e.target.value})}
                                        placeholder="Ex: Casablanca – Maârif" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Caractéristiques (séparées par des virgules)</label>
                                    <input className="form-input" type="text"
                                        value={pitchForm.features} onChange={e => setPitchForm({...pitchForm, features: e.target.value})}
                                        placeholder="Vestiaires, Éclairage LED, Pelouse synthétique" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">📷 Photo du terrain <span style={{ color: 'var(--c-red)', marginLeft: 4 }}>*</span></label>
                                    <label htmlFor="pitch-image-upload" style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        gap: 10, padding: '20px 16px', borderRadius: 12, cursor: 'pointer',
                                        border: `2px dashed ${pitchImageFile ? 'var(--c-green)' : 'var(--c-border)'}`,
                                        background: pitchImageFile ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                                        transition: 'border-color 0.2s, background 0.2s'
                                    }}>
                                        {pitchImagePreview ? (
                                            <img src={pitchImagePreview} alt="Aperçu"
                                                style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8 }} />
                                        ) : (
                                            <>
                                                <span style={{ fontSize: '2.5rem' }}>🏀</span>
                                                <span style={{ color: 'var(--c-text2)', fontSize: '0.88rem', textAlign: 'center' }}>
                                                    Cliquez pour choisir une photo depuis votre explorateur
                                                </span>
                                                <span style={{ color: 'var(--c-text3)', fontSize: '0.75rem' }}>
                                                    JPG, PNG, WEBP — Max 4 Mo
                                                </span>
                                            </>
                                        )}
                                        {pitchImageFile && (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--c-green)', fontWeight: 600 }}>
                                                ✅ {pitchImageFile.name}
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        id="pitch-image-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                                        required
                                        style={{ display: 'none' }}
                                        onChange={e => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setPitchImageFile(file);
                                                setPitchImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-input" style={{ minHeight: 80, resize: 'vertical' }}
                                        value={pitchForm.description} onChange={e => setPitchForm({...pitchForm, description: e.target.value})}
                                        placeholder="Description du terrain..." />
                                </div>
                                
                                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                                    <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-primary" disabled={addLoading}>
                                        {addLoading ? 'Création...' : 'Ajouter le terrain'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
