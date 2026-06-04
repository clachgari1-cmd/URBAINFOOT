import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TYPE_LABELS = { all: 'Tous', '5': '5v5', '7': '7v7', '11': '11v11' };

function Stars({ n }) {
    return <span style={{ color: '#ffd600', letterSpacing: 2 }}>{'★'.repeat(n)}</span>;
}

// Returns an array of HH:MM strings for every 30min from 08:00 to 22:00
function generateTimeSlots() {
    const slots = [];
    for (let h = 8; h <= 22; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
        if (h < 22) slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
}

// Given a slot "HH:MM" and duration hours, check if it overlaps any booked range
function isSlotTaken(slotStr, durationHours, bookedSlots) {
    const [h, m] = slotStr.split(':').map(Number);
    const slotStart = h * 60 + m;
    const slotEnd = slotStart + durationHours * 60;

    return bookedSlots.some(b => {
        const bStart = new Date(b.start_time);
        const bEnd = new Date(b.end_time);
        const bStartMin = bStart.getHours() * 60 + bStart.getMinutes();
        const bEndMin = bEnd.getHours() * 60 + bEnd.getMinutes();
        // Overlap check
        return slotStart < bEndMin && slotEnd > bStartMin;
    });
}

const ALL_SLOTS = generateTimeSlots();

export default function Terrains() {
    const { user } = useAuth();
    const [filter, setFilter] = useState('all');
    const [avail, setAvail] = useState(false);
    const [pitches, setPitches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & booking states
    const [selectedPitch, setSelectedPitch] = useState(null);
    const [bookingDate, setBookingDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });
    const [bookingStart, setBookingStart] = useState('18:00');
    const [bookingDuration, setBookingDuration] = useState('1.5');
    const [bookingError, setBookingError] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    // Slots availability state
    const [bookedSlots, setBookedSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    useEffect(() => {
        axios.get('/api/pitches')
            .then(res => { setPitches(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    // Load booked slots whenever pitch or date changes
    const loadBookedSlots = useCallback(async (pitchId, date) => {
        if (!pitchId || !date) return;
        setSlotsLoading(true);
        try {
            const res = await axios.get(`/api/pitches/${pitchId}/slots`, { params: { date } });
            setBookedSlots(res.data);
        } catch {
            setBookedSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedPitch && bookingDate) {
            loadBookedSlots(selectedPitch.id, bookingDate);
        }
    }, [selectedPitch, bookingDate, loadBookedSlots]);

    // Auto-correct start time if currently selected slot is now taken
    useEffect(() => {
        const dur = parseFloat(bookingDuration);
        if (bookedSlots.length > 0 && isSlotTaken(bookingStart, dur, bookedSlots)) {
            const free = ALL_SLOTS.find(s => !isSlotTaken(s, dur, bookedSlots));
            if (free) setBookingStart(free);
        }
    }, [bookedSlots, bookingDuration]);

    const displayed = pitches.filter(t => {
        if (filter !== 'all' && t.type !== filter) return false;
        const isAvailable = t.available !== undefined ? t.available : true;
        if (avail && !isAvailable) return false;
        return true;
    });

    const handleOpenBooking = (pitch, e) => {
        e.preventDefault();
        if (!user) { window.location.href = '/login'; return; }
        setSelectedPitch(pitch);
        setCustomerName(user?.name || '');
        setCustomerPhone('');
        setBookingError(null);
        setBookingSuccess(null);
        setBookedSlots([]);
    };

    const handleBookConfirm = async () => {
        if (!customerName.trim() || !customerPhone.trim()) {
            setBookingError("Le nom complet et le numéro de téléphone sont obligatoires.");
            return;
        }
        const dur = parseFloat(bookingDuration);
        if (isSlotTaken(bookingStart, dur, bookedSlots)) {
            setBookingError("Ce créneau est déjà réservé. Veuillez choisir un autre horaire.");
            return;
        }

        setBookingLoading(true);
        setBookingError(null);
        setBookingSuccess(null);

        const startDateTimeStr = `${bookingDate}T${bookingStart}:00`;
        const startDateTime = new Date(startDateTimeStr);
        const endDateTime = new Date(startDateTime.getTime() + dur * 60 * 60 * 1000);

        const pad = n => String(n).padStart(2, '0');
        const fmt = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

        try {
            await axios.post('/api/bookings', {
                pitch_id: selectedPitch.id,
                start_time: fmt(startDateTime),
                end_time: fmt(endDateTime),
                customer_name: customerName,
                customer_phone: customerPhone,
            });
            setBookingSuccess("✅ Votre réservation a été enregistrée avec succès !");
            // Reload slots to reflect new booking immediately
            await loadBookedSlots(selectedPitch.id, bookingDate);
            setTimeout(() => setSelectedPitch(null), 2500);
        } catch (error) {
            const apiError = error.response?.data?.errors?.start_time?.[0]
                || error.response?.data?.message
                || "Ce créneau chevauche une réservation existante.";
            setBookingError(apiError);
        } finally {
            setBookingLoading(false);
        }
    };

    const pitchImg = p => p.image_path
        ? (p.image_path.startsWith('/') ? p.image_path : `/${p.image_path}`)
        : 'https://images.unsplash.com/photo-1510051640316-cee39563ddab?w=600&q=80';

    const takenCount = ALL_SLOTS.filter(s => isSlotTaken(s, parseFloat(bookingDuration), bookedSlots)).length;

    return (
        <div className="page-content">
            <div className="container" style={{ padding: '40px 24px 80px' }}>

                {/* Header */}
                <div style={{ marginBottom: 48 }}>
                    <p className="label">Réservations · Maroc</p>
                    <h1 style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', marginTop: 8 }}>
                        Nos <span className="gradient-text">Terrains</span>
                    </h1>
                    <p style={{ color: 'var(--c-text2)', marginTop: 12, fontSize: '1.05rem' }}>
                        {loading ? 'Chargement...' : `${displayed.length} terrain(s) disponible(s) — Maroc.`}
                    </p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="tab-row" style={{ flex: 'none' }}>
                        {Object.entries(TYPE_LABELS).map(([k, v]) => (
                            <button key={k} className={`tab-btn ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>{v}</button>
                        ))}
                    </div>
                    <button
                        onClick={() => setAvail(p => !p)}
                        className="btn"
                        style={{
                            border: avail ? '1px solid var(--c-green)' : '1px solid var(--c-border)',
                            background: avail ? 'var(--c-green-dim)' : 'transparent',
                            color: avail ? 'var(--c-green)' : 'var(--c-text2)',
                        }}
                    >
                        {avail ? '✓ ' : ''}Disponibles seulement
                    </button>
                    <span style={{ marginLeft: 'auto', color: 'var(--c-text3)', fontSize: '0.85rem' }}>{displayed.length} résultat(s)</span>
                </div>

                {/* Cards */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                        <div className="loader" />
                    </div>
                ) : displayed.length === 0 ? (
                    <p style={{ color: 'var(--c-text3)', textAlign: 'center', padding: '60px 0' }}>Aucun terrain trouvé.</p>
                ) : (
                    <div className="grid-auto">
                        {displayed.map((t, i) => (
                            <motion.div key={t.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .08 }} className="card-terrain">
                                <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                                    <img src={pitchImg(t)} alt={t.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s ease' }}
                                        onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                    />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,8,16,.85) 0%, transparent 55%)' }} />
                                    <div style={{ position: 'absolute', top: 12, left: 12 }}>
                                        <span className="badge badge-green"><span className="notif-dot" />Disponible</span>
                                    </div>
                                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                                        <span className="badge badge-blue">Foot {t.type}v{t.type}</span>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.15rem', marginBottom: 4 }}>{t.name}</h3>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--c-text3)' }}>📍 {t.city || 'Maroc'}</span>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--c-green)', lineHeight: 1 }}>{t.price_per_hour} <span style={{ fontSize: '0.75rem' }}>MAD</span></div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--c-text3)' }}>par heure</div>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.88rem', color: 'var(--c-text2)', lineHeight: 1.6, marginBottom: 14 }}>{t.description}</p>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                                        {(Array.isArray(t.features) ? t.features : (t.features ? JSON.parse(t.features) : [])).map(f => (
                                            <span key={f} style={{ fontSize: '0.72rem', padding: '3px 9px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--c-border)', borderRadius: 99, color: 'var(--c-text2)' }}>✓ {f}</span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={(e) => handleOpenBooking(t, e)}
                                        className="btn btn-primary"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        Réserver ce terrain →
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {selectedPitch && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    backdropFilter: 'blur(8px)', padding: 16
                }}>
                    <div className="glass" style={{ width: '100%', maxWidth: 500, padding: 32, borderRadius: 24, position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}>
                        <button onClick={() => setSelectedPitch(null)}
                            style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--c-text3)', fontSize: '1.5rem', cursor: 'pointer' }}>
                            ✕
                        </button>

                        <h2 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Réserver <span className="gradient-text">{selectedPitch.name}</span></h2>
                        <p style={{ color: 'var(--c-text2)', fontSize: '0.9rem', marginBottom: 24 }}>📍 {selectedPitch.city || 'Maroc'}</p>

                        {bookingSuccess ? (
                            <div style={{ padding: 24, borderRadius: 12, background: 'rgba(26,110,60,0.15)', border: '1px solid var(--c-green)', color: 'var(--c-green)', textAlign: 'center', margin: '20px 0' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✓</div>
                                <p style={{ fontWeight: 600 }}>{bookingSuccess}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                {bookingError && (
                                    <div style={{ padding: 12, borderRadius: 8, background: 'rgba(211,47,47,0.15)', border: '1px solid var(--c-red)', color: 'var(--c-red)', fontSize: '0.85rem' }}>
                                        ⚠️ {bookingError}
                                    </div>
                                )}

                                {/* Contact Info */}
                                <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--c-border)' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Vos informations</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', color: 'var(--c-text2)', fontWeight: 600, marginBottom: 4, display: 'block' }}>Nom complet *</label>
                                            <input
                                                type="text"
                                                value={customerName}
                                                onChange={e => setCustomerName(e.target.value)}
                                                placeholder="Ex: Yasser Taha"
                                                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--c-border)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', color: 'var(--c-text2)', fontWeight: 600, marginBottom: 4, display: 'block' }}>Téléphone *</label>
                                            <input
                                                type="tel"
                                                value={customerPhone}
                                                onChange={e => setCustomerPhone(e.target.value)}
                                                placeholder="Ex: 0612345678"
                                                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--c-border)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--c-border)' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Date & Créneau</p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', color: 'var(--c-text2)', fontWeight: 600, marginBottom: 4, display: 'block' }}>Date de réservation</label>
                                            <input
                                                type="date"
                                                value={bookingDate}
                                                onChange={e => setBookingDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--c-border)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.82rem', color: 'var(--c-text2)', fontWeight: 600, marginBottom: 4, display: 'block' }}>
                                                Durée de la session
                                            </label>
                                            <select
                                                value={bookingDuration}
                                                onChange={e => setBookingDuration(e.target.value)}
                                                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: '#0a0d1a', border: '1px solid var(--c-border)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                            >
                                                <option value="1" style={{ background: '#0a0d1a' }}>1 Heure</option>
                                                <option value="1.5" style={{ background: '#0a0d1a' }}>1h30 (90 min)</option>
                                                <option value="2" style={{ background: '#0a0d1a' }}>2 Heures</option>
                                                <option value="3" style={{ background: '#0a0d1a' }}>3 Heures</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.82rem', color: 'var(--c-text2)', fontWeight: 600, marginBottom: 4, display: 'block' }}>
                                                Heure de début
                                                {slotsLoading && <span style={{ fontSize: '0.72rem', color: 'var(--c-text3)', marginLeft: 8 }}>⏳ Vérification...</span>}
                                                {!slotsLoading && takenCount > 0 && (
                                                    <span style={{ fontSize: '0.72rem', color: '#f59e0b', marginLeft: 8 }}>
                                                        ⚠️ {takenCount} créneau(x) déjà réservé(s)
                                                    </span>
                                                )}
                                                {!slotsLoading && takenCount === 0 && bookedSlots.length === 0 && selectedPitch && (
                                                    <span style={{ fontSize: '0.72rem', color: 'var(--c-green)', marginLeft: 8 }}>✓ Tous les créneaux libres</span>
                                                )}
                                            </label>
                                            <select
                                                value={bookingStart}
                                                onChange={e => setBookingStart(e.target.value)}
                                                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: '#0a0d1a', border: '1px solid var(--c-border)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                            >
                                                {ALL_SLOTS.map(slot => {
                                                    const taken = isSlotTaken(slot, parseFloat(bookingDuration), bookedSlots);
                                                    return (
                                                        <option
                                                            key={slot}
                                                            value={slot}
                                                            disabled={taken}
                                                            style={{ background: '#0a0d1a', color: taken ? '#666' : '#fff' }}
                                                        >
                                                            {slot}{taken ? '  ✕ Occupé' : ''}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Price summary */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 12, background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)' }}>
                                    <div>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--c-text3)' }}>Tarif : </span>
                                        <span style={{ fontWeight: 700, color: 'var(--c-green)' }}>{selectedPitch.price_per_hour} MAD/h</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--c-text3)' }}>Total : </span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--c-green)' }}>
                                            {(selectedPitch.price_per_hour * parseFloat(bookingDuration)).toFixed(0)} MAD
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleBookConfirm}
                                    className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
                                    disabled={bookingLoading || isSlotTaken(bookingStart, parseFloat(bookingDuration), bookedSlots)}
                                >
                                    {bookingLoading ? 'Enregistrement...' : 'Confirmer la réservation ⚽'}
                                </button>

                                {isSlotTaken(bookingStart, parseFloat(bookingDuration), bookedSlots) && (
                                    <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--c-red)' }}>
                                        ⛔ Ce créneau est occupé — choisissez un autre horaire.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
