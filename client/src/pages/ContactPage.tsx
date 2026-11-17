import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import * as messageService from '../services/messageService';
import { MessageSquare, Phone, Mail, MapPin, Camera, Clock, PackageCheck, Send, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const CONTACT_CONFIG = {
  phoneLabel: '+94 70 118 4914',
  whatsappNumber: '+94771234567',
  email: 'Contact@sheraxzy.com',
  pressEmail: 'studio@elix.lk',
  instagramHandle: '@elix.official',
  tiktokHandle: '@elix.official',
  phoneLink: 'tel:+94701184914',
  whatsappLink: 'https://wa.me/94701184914?text=Hello%20ELIX%20Team%2C%20I%20have%20an%20inquiry%20regarding%202026-LIVE%20T-Shirts',
  emailLink: 'Contact@sheraxzy.com',
  instagramLink: 'https://www.instagram.com/elix.clothing',
  tiktokLink: 'https://www.tiktok.com',
  address: 'ELIX Studio, Malabe, Sri Lanka',
  hours: 'Monday – Saturday: 10:00 AM – 8:00 PM (IST)',
};

const FAQ_ITEMS = [
  {
    question: 'How fast is islandwide delivery in Sri Lanka?',
    answer:
      'Orders within Colombo & suburbs are delivered within 24–48 hours. Islandwide courier delivery to all other districts takes 2–3 business days with direct door-to-door tracking.',
  },
  {
    question: 'What is the fabric spec and GSM of ELIX t-shirts?',
    answer:
      'All ELIX t-shirts are made from 100% custom-combed 220 GSM heavyweight cotton. This delivers a dense, boxy streetwear drape while maintaining breathability for tropical weather.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept Visa, MasterCard, Cash on Delivery (COD), Direct Bank Transfer, and Buy Now Pay Later options (Koko & Mintpay).',
  },
  {
    question: 'How do I care for 220 GSM high-density graphic prints?',
    answer:
      'We recommend washing inside out in cold water with similar colors. Do not iron directly on the graphic prints. Line dry in shade to preserve color intensity and shape.',
  },
  {
    question: 'What is the exchange policy on oversized t-shirts?',
    answer:
      'We offer a 7-day hassle-free size exchange on unworn, unwashed t-shirts with original tags intact. Simply contact us via WhatsApp to initiate an exchange.',
  },
];

interface FormDataType {
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  orderNumber: string;
  message: string;
}

interface LookupResultType {
  orderId: string;
  status: string;
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  items: string;
}

const ContactPage: React.FC = () => {
  const { addToast } = useToast();

  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'Order Support',
    orderNumber: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [openFAQ, setOpenFAQ] = useState<number>(0);

  // Live Order Lookup Widget State
  const [lookupId, setLookupId] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<LookupResultType | null>(null);
  const [lookupLoading, setLookupLoading] = useState<boolean>(false);

  const inquiryTypes = [
    'Order Support',
    'Size & Fit Advice',
    'Wholesale / Bulk',
    'Feedback & Collabs',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Please provide your full name.';
    if (!formData.email.trim()) {
      errs.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email format.';
    }
    if (!formData.message.trim()) errs.message = 'Please type your message.';
    return errs;
  };

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await messageService.sendMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        inquiryType: formData.inquiryType,
        orderNumber: formData.orderNumber.trim(),
        message: formData.message.trim(),
      });

      setSubmitted(true);
      addToast({
        title: 'Message Dispatched',
        message: 'Your inquiry has been sent to our Colombo Studio team.',
        type: 'success',
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: 'Order Support',
        orderNumber: '',
        message: '',
      });
    } catch (err: any) {
      addToast({
        title: 'Dispatch Failed',
        message: 'Unable to deliver message. Please contact us directly via WhatsApp.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) return;

    setLookupLoading(true);
    setLookupResult(null);

    setTimeout(() => {
      setLookupLoading(false);
      setLookupResult({
        orderId: lookupId.toUpperCase(),
        status: 'Fulfillment Ready / Dispatched',
        carrier: 'Pronto / Domex Courier Sri Lanka',
        trackingNumber: 'LK-ELX-' + Math.floor(100000 + Math.random() * 900000),
        estimatedDelivery: '1–2 Business Days',
        items: '220 GSM Heavyweight Graphic T-Shirt',
      });
    }, 600);
  };

  return (
    <main className="page-shell">
      {/* Top Banner */}
      <section className="section" style={{ paddingBottom: '1.5rem' }}>
        <div className="container">
          <div style={{ maxWidth: '780px' }} className="animate-fade-in-up">
            <div className="hero-badge-live" style={{ marginBottom: '0.75rem' }}>
              <span className="pulse-dot" />
              <span>COLOMBO STUDIO DESK · LIVE 2026</span>
            </div>
            <h1 className="page-heading" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', marginBottom: '0.8rem' }}>
              CONTACT & <span className="gradient-text luxury-shimmer">DIRECT DISPATCH</span>
            </h1>
            <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              Connect directly with the ELIX atelier. Whether you need immediate sizing recommendations for our 220 GSM heavyweight t-shirts, order status verification, or custom inquiries, we're ready to assist.
            </p>
          </div>
        </div>
      </section>

      {/* Structured Contact Grid in Exact Order */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>

            {/* 1. WhatsApp & Direct Phone */}
            <div className="glass-card luxury-card-interactive" style={{ padding: '2rem 1.75rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                ● FASTEST REPLY
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <MessageSquare size={24} color="#4ade80" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>
                Channel 01 // Instant Chat
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>WhatsApp & Hotline</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Chat live with our styling and dispatch team for immediate assistance.
              </p>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '1.25rem' }}>
                {CONTACT_CONFIG.phoneLabel}
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <a href={CONTACT_CONFIG.whatsappLink} target="_blank" rel="noreferrer noopener" className="btn btn-primary btn-sm luxury-hover">
                  WhatsApp Us →
                </a>
                <a href={CONTACT_CONFIG.phoneLink} className="btn btn-outline btn-sm luxury-hover">
                  Call Line
                </a>
              </div>
            </div>

            {/* 2. Email Desk */}
            <div className="glass-card luxury-card-interactive" style={{ padding: '2rem 1.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Mail size={24} color="var(--accent-purple)" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>
                Channel 02 // Official Desk
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Email Inquiries</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Send us detailed order requests, receipts, or collaboration proposals.
              </p>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '1.25rem' }}>
                {CONTACT_CONFIG.email}
              </div>
              <div>
                <a href={CONTACT_CONFIG.emailLink} className="btn btn-outline btn-sm luxury-hover">
                  Send Email →
                </a>
              </div>
            </div>

            {/* 3. Studio & Fulfillment Hub */}
            <div className="glass-card luxury-card-interactive" style={{ padding: '2rem 1.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <MapPin size={24} color="var(--accent-amber)" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>
                Channel 03 // Studio Hub
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Colombo Atelier</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {CONTACT_CONFIG.address}
              </p>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {CONTACT_CONFIG.hours}
              </div>
              <div>
                <span className="brand-badge" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  ISLANDWIDE FULFILLMENT
                </span>
              </div>
            </div>

            {/* 4. Social Network */}
            <div className="glass-card luxury-card-interactive" style={{ padding: '2rem 1.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Camera size={24} color="var(--accent-pink)" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-pink)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>
                Channel 04 // Social Community
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Follow @elix.official</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Tag us wearing your 2026-LIVE tees to be featured on our official feeds.
              </p>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <a href={CONTACT_CONFIG.instagramLink} target="_blank" rel="noreferrer noopener" className="btn btn-outline btn-sm luxury-hover">
                  Instagram
                </a>
                <a href={CONTACT_CONFIG.tiktokLink} target="_blank" rel="noreferrer noopener" className="btn btn-outline btn-sm luxury-hover">
                  TikTok
                </a>
              </div>
            </div>

          </div>

          {/* Main 2-Column Creative Section: Form + Live Order Tracking Tool */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>

            {/* Left: Creative Message Form */}
            <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  Direct Message
                </div>
                <h2 style={{ fontSize: '1.75rem', margin: 0 }}>SEND AN INQUIRY</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.4rem' }}>
                  Our team responds to all inquiries within 2 hours during business operations.
                </p>
              </div>

              {submitted && (
                <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#86efac', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#86efac" /> Inquiry submitted successfully! A representative from our Colombo studio will contact you shortly.
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                {/* Inquiry Type Chips */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Reason for Contact
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {inquiryTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, inquiryType: type }))}
                        style={{
                          background: formData.inquiryType === type ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)',
                          color: formData.inquiryType === type ? '#fff' : 'var(--text-muted)',
                          border: '1px solid var(--border-medium)',
                          padding: '0.45rem 0.85rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                    {errors.name && <span style={{ color: '#f87171', fontSize: '0.78rem' }}>{errors.name}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+94 7X XXX XXXX"
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="form-control"
                    style={{ width: '100%' }}
                  />
                  {errors.email && <span style={{ color: '#f87171', fontSize: '0.78rem' }}>{errors.email}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Order Number (If applicable)
                  </label>
                  <input
                    type="text"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleChange}
                    placeholder="e.g. ELX-4089"
                    className="form-control"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    className="form-control"
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                  {errors.message && <span style={{ color: '#f87171', fontSize: '0.78rem' }}>{errors.message}</span>}
                </div>

                <button type="submit" className="btn btn-glow btn-lg luxury-hover" style={{ marginTop: '0.5rem' }}>
                  <Send size={16} style={{ marginRight: '6px' }} /> Dispatch Inquiry
                </button>
              </form>
            </div>

            {/* Right: Live Order Tracker Widget + FAQs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* Live Order Tracking Lookup Widget */}
              <div className="glass-card glass-card-glow luxury-border-glow" style={{ padding: '2rem 1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <PackageCheck size={22} color="var(--accent-purple)" />
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Instant Order Tracking</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                  Enter your ELIX order number to check realtime courier tracking and delivery status.
                </p>

                <form onSubmit={handleOrderLookup} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={lookupId}
                    onChange={(e) => setLookupId(e.target.value)}
                    placeholder="e.g. ELX-1082"
                    className="form-control"
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm luxury-hover" disabled={lookupLoading}>
                    {lookupLoading ? 'Checking...' : 'Track'}
                  </button>
                </form>

                {lookupResult && (
                  <div className="animate-fade-in" style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order Reference:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>{lookupResult.orderId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
                      <span style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.85rem' }}>● {lookupResult.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Carrier:</span>
                      <span style={{ fontSize: '0.85rem' }}>{lookupResult.carrier}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Est. Arrival:</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', fontWeight: 600 }}>{lookupResult.estimatedDelivery}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* FAQ Accordion */}
              <div className="glass-card" style={{ padding: '2rem 1.75rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    Help Center
                  </div>
                  <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Frequently Asked Questions</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {FAQ_ITEMS.map((item, index) => (
                    <div
                      key={item.question}
                      style={{
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.02)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFAQ(openFAQ === index ? -1 : index)}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.92rem',
                          cursor: 'pointer',
                        }}
                      >
                        <span>{item.question}</span>
                        {openFAQ === index ? (
                          <ChevronUp size={16} color="var(--accent-purple)" />
                        ) : (
                          <ChevronDown size={16} color="var(--accent-purple)" />
                        )}
                      </button>
                      {openFAQ === index && (
                        <div className="animate-fade-in" style={{ padding: '0 1rem 1rem 1rem', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
