"use client";
import { useEffect, useState } from 'react';
import { ShoppingBag, Plus, SlidersHorizontal, Minus, Package, ArrowLeft, User, Mail, CreditCard, CheckCircle2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast, Toaster } from 'sonner';

type Product = { id: string; name: string; category: string; price: number; image: string; description?: string };
type OrderReceipt = {
  id: string;
  createdAt: string;
  payment: { token: string; last4: string; expiry: string };
  contact: { email: string; name: string };
};

const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n / 100);

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings] = useState({ 
    name: 'SIGMA FLOW', 
    headline: 'Historical Options Data.\nBuilt for Backtesting.', 
    description: 'Access years of historical options data across Gold, NQ, Bitcoin and ES.', 
    accent: '#c9f45b' 
  });
  
  const [cart, setCart] = useState<Record<string, number>>({});
  const [view, setView] = useState<'shop' | 'checkout' | 'receipt' | 'studio'>('shop');
  const [productIdPath, setProductIdPath] = useState<string | null>(null);
  const [modal, setModal] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Checkout Input States
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [checkoutCvv, setCheckoutCvv] = useState(''); 
  const [activeReceipt, setActiveReceipt] = useState<OrderReceipt | null>(null);

  async function load() {
    try {
      const r = await fetch('/api/store');
      if (!r.ok) throw Error('Store is temporarily unavailable. Please try again.');
      const d = await r.json() as any;
      setProducts(d.products || []);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => { load() }, []);

  useEffect(() => {
    document.body.style.backgroundColor = '#000000';
    document.body.style.color = '#ffffff';
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  function add(id: string) {
    setCart(c => ({ ...c, [id]: Math.min(99, (c[id] || 0) + 1) }));
    toast.success('Added to your bag');
  }

  function updateQuantity(id: string, delta: number) {
    setCart(c => {
      const next = { ...c };
      const val = (next[id] || 0) + delta;
      if (val <= 0) delete next[id];
      else next[id] = Math.min(99, val);
      return next;
    });
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!checkoutEmail || !checkoutName || !cardNumber || !cardExpiry || !checkoutCvv) {
      toast.error('Please fulfill all checkout input requirements including CVV codes.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        op: 'checkout',
        card: cardNumber,
        expiry: cardExpiry,
        cvv: checkoutCvv, 
        details: {
          contact: { email: checkoutEmail, name: checkoutName },
          manifest: items.map(p => ({
            id: p.id,
            name: p.name,
            quantity: cart[p.id],
            unitPrice: p.price,
            totalPrice: p.price * cart[p.id]
          }))
        }
      };

      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment gateway connection error.');

      if (data.receipt) {
        setActiveReceipt({
          id: data.receipt.id || data.id,
          createdAt: data.receipt.createdAt || new Date().toISOString(),
          payment: { 
            token: data.receipt.payment?.token || 'demo_token', 
            last4: data.receipt.payment?.last4 || cardNumber.slice(-4), 
            expiry: data.receipt.payment?.expiry || cardExpiry 
          },
          contact: data.receipt.contact || { email: checkoutEmail, name: checkoutName }
        });
        
        setCart({});
        setView('receipt');
        toast.success('Download authorization tokens generated successfully!');
      } else {
        throw new Error('Invalid invoice receipt schema returned from API engine.');
      }
    } catch (err) {
      console.error("Checkout failure:", err);
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const items = products.filter(p => cart[p.id]),
        total = items.reduce((n, p) => n + p.price * cart[p.id], 0),
        count = items.reduce((n, p) => n + cart[p.id], 0);

  const currentViewedProduct = products.find(p => p.id === productIdPath);

  // --- VIEW LAYER 1: RECEIPT LAYOUT VIEW ---
  if (view === 'receipt' && activeReceipt) {
    return (
      <div style={{ background: '#000000', color: '#ffffff', minHeight: '100vh', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#121212', borderRadius: '1.25rem', border: '1px solid #262626', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={56} style={{ color: settings.accent }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '-0.02em', margin: 0 }}>Order Confirmed</h1>
            <p style={{ color: '#a3a3a3', fontSize: '0.95rem', margin: 0 }}>Your digital download parameters are authenticated.</p>
          </div>
          
          <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: '0.75rem', padding: '1.25rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#a3a3a3' }}>Invoice Token:</span><span style={{ fontFamily: 'monospace', color: '#fff' }}>{activeReceipt.id.slice(0, 18)}...</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#a3a3a3' }}>Authorized To:</span><span style={{ color: '#fff' }}>{activeReceipt.contact.name}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#a3a3a3' }}>Email Target:</span><span style={{ color: '#fff' }}>{activeReceipt.contact.email}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#a3a3a3' }}>Settlement Card:</span><span style={{ color: '#fff' }}>Visa Ending in {activeReceipt.payment.last4}</span></div>
          </div>

          <div style={{ textAlign: 'center', color: '#737373', fontSize: '0.8rem', borderTop: '1px solid #262626', paddingTop: '1.5rem' }}>
            A transmission bundle containing your secure tick-data API paths has been directed to your email.
          </div>

          <button 
            onClick={() => setView('shop')}
            style={{ background: settings.accent, color: '#000', border: 'none', padding: '1rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Return to Core Catalog
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW LAYER 2: INTERACTIVE CHECKOUT SHEET VIEW ---
  if (view === 'checkout') {
    return (
      <div style={{ background: '#000000', color: '#ffffff', minHeight: '100vh', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <button 
            onClick={() => setView('shop')} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#a3a3a3', cursor: 'pointer', marginBottom: '2rem' }}
          >
            <ArrowLeft size={16} /> Back to Catalog
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>Secure Settlement</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#a3a3a3' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#737373' }} />
                  <input required placeholder="John Doe" value={checkoutName} onChange={e => setCheckoutName(e.target.value)} style={{ width: '100%', background: '#171717', border: '1px solid #262626', borderRadius: '0.5rem', padding: '0.75rem 1rem 0.75rem 2.5rem', color: '#fff' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#a3a3a3' }}>Corporate Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#737373' }} />
                  <input required type="email" placeholder="quant@firm.com" value={checkoutEmail} onChange={e => setCheckoutEmail(e.target.value)} style={{ width: '100%', background: '#171717', border: '1px solid #262626', borderRadius: '0.5rem', padding: '0.75rem 1rem 0.75rem 2.5rem', color: '#fff' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#a3a3a3' }}>Test Card Configuration</label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#737373' }} />
                    <input required placeholder="4242 4242 4242 4242" value={cardNumber} onChange={e => setCardNumber(e.target.value)} style={{ width: '100%', background: '#171717', border: '1px solid #262626', borderRadius: '0.5rem', padding: '0.75rem 1rem 0.75rem 2.5rem', color: '#fff' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#a3a3a3' }}>Expiration</label>
                  <input required placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} style={{ width: '100%', background: '#171717', border: '1px solid #262626', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#fff', textAlign: 'center' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#a3a3a3' }}>CVV / CVC</label>
                  <input required type="password" maxLength={4} placeholder="000" value={checkoutCvv} onChange={e => setCheckoutCvv(e.target.value)} style={{ width: '100%', background: '#171717', border: '1px solid #262626', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#fff', textAlign: 'center' }} />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} style={{ width: '100%', background: settings.accent, color: '#000', border: 'none', padding: '1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '1rem' }}>
                {isSubmitting ? 'Processing Token Settlement...' : `Authorize Digital Capture - ${money(total)}`}
              </button>
            </form>

            <div style={{ background: '#121212', border: '1px solid #262626', borderRadius: '1.25rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: 0 }}>Pipeline Matrix Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {items.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ color: '#d4d4d4' }}>{p.name} <b style={{ color: settings.accent }}>x{cart[p.id]}</b></span>
                    <span>{money(p.price * cart[p.id])}</span>
                  </div>
                ))}
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #262626' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 'bold' }}>
                <span>Final Settlement</span>
                <span style={{ color: settings.accent }}>{money(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW LAYER 3: SINGLE PRODUCT DETAILS VIEW ---
  if (currentViewedProduct) {
    return (
      <div style={{ '--lime': settings.accent, background: '#000000', color: '#ffffff', minHeight: '100vh' } as React.CSSProperties}>
        <div className="announcement" style={{ background: '#171717', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '0.6rem', textAlign: 'center', fontWeight: '500' }}>
          QUANTITATIVE SYSTEMS PLATFORM <span style={{ opacity: 0.6, marginLeft: '0.5rem' }}>INSTITUTIONAL GRADE RELEASES</span>
        </div>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid #171717' }}>
          <div className="logo" style={{ color: '#ffffff', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '0.05em' }} onClick={(e) => { e.preventDefault(); setProductIdPath(null); }}>
            {settings.name}®
          </div>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <button onClick={(e) => { e.preventDefault(); setProductIdPath(null); setView('shop'); }} style={{ color: '#ffffff', background: 'transparent', border: 'none', cursor: 'pointer' }}>Shop</button>
            <button onClick={(e) => { e.preventDefault(); setProductIdPath(null); setView('studio'); }} style={{ color: '#ffffff', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>Store studio</button>
          </nav>
          <button className="bag" onClick={() => setModal('cart')} style={{ background: '#171717', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={16} /> Bag <b style={{ background: settings.accent, color: '#000', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontSize: '0.75rem', marginLeft: '0.2rem' }}>{count}</b>
          </button>
        </header>

        <main style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          <button 
            onClick={(e) => { e.preventDefault(); setProductIdPath(null); }} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#a3a3a3', fontSize: '0.9rem', marginBottom: '2rem', padding: 0 }}
          >
            <ArrowLeft size={16} /> Back to Catalog Collection
          </button>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start', marginTop: '1rem' }}>
            <div style={{ flex: '1 1 25rem', background: '#171717', borderRadius: '1.25rem', overflow: 'hidden', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', minHeight: '350px', border: '1px solid #262626' }}>
              {currentViewedProduct.image && (currentViewedProduct.image.startsWith('http') || currentViewedProduct.image.startsWith('/')) ? (
                <img src={currentViewedProduct.image} alt={currentViewedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', borderRadius: '1.25rem' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', margin: 'auto' }}>
                  <Package size={90} style={{ color: '#404040' }} />
                  <span style={{ fontSize: '0.85rem', color: '#a3a3a3' }}>Image missing or using custom placeholder.</span>
                </div>
              )}
            </div>

            <div style={{ flex: '1 1 20rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '0.5rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffffff', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', lineHeight: 1.15 }}>{currentViewedProduct.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '600', color: '#ffffff' }}>{money(currentViewedProduct.price)}</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Temporary Discount</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #262626', margin: '0.5rem 0' }} />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>Data Coverage Overview</h3>
              <p style={{ fontSize: '1rem', color: '#d4d4d4', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                {currentViewedProduct.description || 'Premium engineered tick-level financial dataset prepared for high-frequency quant research backtesting configurations.'}
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <button 
                  className="primary" 
                  style={{ width: '100%', padding: '1.15rem 1.5rem', fontSize: '1.05rem', fontWeight: '600', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: settings.accent, color: '#000', border: 'none', cursor: 'pointer' }}
                  onClick={() => add(currentViewedProduct.id)}
                >
                  Add Dataset to Bag
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- VIEW LAYER 4: FRONT CATALOG PLATFORM ---
  return (
    <div style={{ '--lime': settings.accent, background: '#000000', color: '#ffffff', minHeight: '100vh' } as React.CSSProperties}>
      <Toaster position="top-right" invert />
      <div className="announcement" style={{ background: '#171717', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '0.6rem', textAlign: 'center', fontWeight: '500' }}>
        QUANTITATIVE SYSTEMS PLATFORM <span style={{ opacity: 0.6, marginLeft: '0.5rem' }}>INSTITUTIONAL GRADE RELEASES</span>
      </div>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid #171717' }}>
        <div className="logo" style={{ color: '#ffffff', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '0.05em' }} onClick={() => setView('shop')}>
          {settings.name}®
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          <button onClick={() => setView('shop')} style={{ color: '#ffffff', background: 'transparent', border: 'none', cursor: 'pointer' }}>Shop</button>
          <button onClick={() => setView('studio')} style={{ color: '#ffffff', background: 'transparent', border: 'none', cursor: 'pointer' }}>Store studio</button>
        </nav>
        <button className="bag" onClick={() => setModal('cart')} style={{ background: '#171717', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag size={16} /> Bag <b style={{ background: settings.accent, color: '#000', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontSize: '0.75rem', marginLeft: '0.2rem' }}>{count}</b>
        </button>
      </header>

      <main style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {view === 'studio' ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <SlidersHorizontal size={48} style={{ color: settings.accent, margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Store Studio Control Panel</h2>
            <p style={{ color: '#a3a3a3' }}>Configuration parameters loaded properly.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '4rem', maxWidth: '600px' }}>
              <h1 style={{ fontSize: '3rem', fontWeight: 'bold', letterSpacing: '-0.03em', lineHeight: 1.1, whiteSpace: 'pre-line', marginBottom: '1rem' }}>{settings.headline}</h1>
              <p style={{ color: '#a3a3a3', fontSize: '1.1rem', lineHeight: 1.5 }}>{settings.description}</p>
            </div>

            {loading ? (
              <div style={{ color: '#a3a3a3' }}>Loading quantitative matrix matrices...</div>
            ) : error ? (
              <div style={{ color: '#ef4444' }}>{error}</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                {products.map(product => (
                  <div key={product.id} style={{ background: '#121212', border: '1px solid #262626', borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div 
                      onClick={() => setProductIdPath(product.id)}
                      style={{ cursor: 'pointer', width: '100%', aspectRatio: '16/10', background: '#1c1c1c', borderBottom: '1px solid #262626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {product.image ? (
                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Package size={48} style={{ color: '#404040' }} />
                      )}
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: settings.accent, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category}</span>
                        <h3 onClick={() => setProductIdPath(product.id)} style={{ cursor: 'pointer', margin: 0, fontSize: '1.15rem', fontWeight: 'bold' }}>{product.name}</h3>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>{money(product.price)}</span>
                        <button 
                          onClick={() => add(product.id)}
                          style={{ background: '#fff', color: '#000', border: 'none', width: '2.25rem', height: '2.25rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Cart Dialog Modal */}
      <Dialog open={modal === 'cart'} onOpenChange={(open) => !open && setModal('')}>
        <DialogContent style={{ background: '#121212', border: '1px solid #262626', color: '#fff', maxWidth: '450px' }}>
          <DialogTitle style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Your Data Bag
          </DialogTitle>
          <DialogDescription style={{ color: '#a3a3a3' }}>
            Review your quantitative bundles before proceeding to secure settlement layers.
          </DialogDescription>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '1.5rem 0' }}>
            {items.length === 0 ? (
              <p style={{ color: '#737373', textAlign: 'center', padding: '2rem 0' }}>Your bag is empty.</p>
            ) : (
              items.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: '600' }}>{p.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: '#a3a3a3' }}>{money(p.price)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#171717', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', border: '1px solid #262626' }}>
                    <button onClick={() => updateQuantity(p.id, -1)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><Minus size={14} /></button>
                    <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{cart[p.id]}</span>
                    <button onClick={() => updateQuantity(p.id, 1)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><Plus size={14} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div style={{ borderTop: '1px solid #262626', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold' }}>
                <span>Subtotal</span>
                <span style={{ color: settings.accent }}>{money(total)}</span>
              </div>
              <button 
                onClick={() => { setModal(''); setView('checkout'); }}
                style={{ width: '100%', background: settings.accent, color: '#000', border: 'none', padding: '0.85rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
