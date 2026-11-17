import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, HelpCircle, Phone, ArrowUpRight, RotateCcw, ChevronRight } from 'lucide-react';
import soundManager from '../utils/soundManager';

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  time: string;
  category?: string;
  actionLink?: {
    label: string;
    url: string;
    isExternal?: boolean;
  };
}

interface FAQItem {
  id: string;
  category: 'orders' | 'products' | 'shipping' | 'payments' | 'returns';
  question: string;
  keywords: string[];
  answer: string;
  actionLink?: {
    label: string;
    url: string;
    isExternal?: boolean;
  };
}

const FAQ_KNOWLEDGE_BASE: FAQItem[] = [
  // A. ORDERS
  {
    id: 'orders-place',
    category: 'orders',
    question: 'How can I place an order?',
    keywords: ['place order', 'how to buy', 'how to order', 'order process', 'purchase'],
    answer: 'Ordering from ELIX is quick and straightforward:\n1. Browse our collection on the Shop page.\n2. Select your desired oversized graphic t-shirt.\n3. Choose your size (S to XXL) and color.\n4. Click "Add to Bag" or "Buy Now".\n5. Enter your delivery address and choose your payment method (Cash on Delivery, Card, or Mintpay) to confirm!',
    actionLink: { label: 'Explore Shop Drops', url: '/shop' },
  },
  {
    id: 'orders-track',
    category: 'orders',
    question: 'How can I track my order?',
    keywords: ['track order', 'where is my order', 'tracking', 'order status', 'track'],
    answer: 'Once your ELIX drop is dispatched, you will receive an SMS and email notification with your prompt courier tracking number. You can also track your live package directly on our Contact page using your Order ID, or message us on WhatsApp (+94 70 118 4914).',
    actionLink: { label: 'Live Order Tracker', url: '/contact' },
  },
  {
    id: 'orders-cancel',
    category: 'orders',
    question: 'Can I cancel my order?',
    keywords: ['cancel order', 'cancel', 'cancellation', 'stop order'],
    answer: 'Yes, you can cancel your order free of charge before it is handed over to our courier partner. Please contact our support team immediately via WhatsApp at +94 70 118 4914 with your Order ID.',
    actionLink: { label: 'WhatsApp ELIX Support', url: 'https://wa.me/94701184914', isExternal: true },
  },
  {
    id: 'orders-processing',
    category: 'orders',
    question: 'How long does order processing take?',
    keywords: ['processing time', 'how long processing', 'order dispatch', 'dispatch time'],
    answer: 'Orders are verified and packaged at our Malabe atelier within 12–24 hours on business days (Monday–Saturday). Orders placed before 1:00 PM are prioritized for same-day dispatch.',
  },

  // B. PRODUCTS
  {
    id: 'products-sizes',
    category: 'products',
    question: 'What sizes are available?',
    keywords: ['sizes available', 'what sizes', 'available sizes', 'size range', 'xxl', 'small'],
    answer: 'All ELIX signature t-shirts are available in sizes: S, M, L, XL, and XXL. Every piece is tailored with our signature boxy oversized streetwear silhouette and dropped shoulders.',
    actionLink: { label: 'View Size Chart', url: '/size-guide' },
  },
  {
    id: 'products-materials',
    category: 'products',
    question: 'What materials are used?',
    keywords: ['materials', 'fabric', 'cotton', 'gsm', 'what material', 'quality'],
    answer: 'ELIX garments are cut from 100% custom-combed 220 GSM heavyweight compact cotton. It features a dense, structured drape that maintains shape, complemented by a 1.25" thick ribbed lycra collar that resists sagging and high-density breathable graphic prints.',
  },
  {
    id: 'products-oversized',
    category: 'products',
    question: 'Are your T-shirts oversized?',
    keywords: ['oversized', 'fit', 'boxy', 'true to size', 'loose fit', 'tight'],
    answer: 'Yes! Our t-shirts feature an authentic streetwear boxy oversized drape with wide chest widths and dropped shoulders. If you prefer a classic, closer-to-body fit, we recommend sizing down one size.',
    actionLink: { label: 'Check Size Guide', url: '/size-guide' },
  },
  {
    id: 'products-choose-size',
    category: 'products',
    question: 'How do I choose my size?',
    keywords: ['choose size', 'size guide', 'measurements', 'what size should i get', 'size chart'],
    answer: 'Refer to our interactive Size Guide page for exact chest, length, shoulder, and sleeve measurements in inches and centimeters:\n• S: Chest 42", Length 28"\n• M: Chest 44", Length 29"\n• L: Chest 46", Length 30"\n• XL: Chest 48", Length 31"\n• XXL: Chest 50", Length 32"',
    actionLink: { label: 'Open Size Guide', url: '/size-guide' },
  },
  {
    id: 'products-restock',
    category: 'products',
    question: 'Will sold-out products be restocked?',
    keywords: ['restock', 'sold out', 'restocked', 'when back in stock', 'out of stock'],
    answer: 'ELIX releases limited production runs to preserve individuality and exclusivity. High-demand signature graphics may periodically receive archival restocks. Join our VIP drop newsletter at the bottom of the page to get first access.',
  },

  // C. SHIPPING
  {
    id: 'shipping-islandwide',
    category: 'shipping',
    question: 'Do you deliver islandwide in Sri Lanka?',
    keywords: ['islandwide', 'sri lanka', 'deliver islandwide', 'all districts', 'where do you deliver'],
    answer: 'Yes! We deliver islandwide across all 25 districts in Sri Lanka directly to your doorstep using trusted courier services with end-to-end package tracking.',
  },
  {
    id: 'shipping-charges',
    category: 'shipping',
    question: 'What are the delivery charges?',
    keywords: ['delivery charges', 'shipping cost', 'shipping fee', 'free delivery', 'how much for delivery'],
    answer: 'Delivery charges across Sri Lanka are:\n• Flat rate of LKR 450 islandwide.\n• FREE Delivery on all orders of LKR 8,000 or more!\nYour exact delivery charge is automatically calculated at checkout.',
    actionLink: { label: 'Go to Checkout', url: '/checkout' },
  },
  {
    id: 'shipping-duration',
    category: 'shipping',
    question: 'How long does delivery take?',
    keywords: ['delivery time', 'how long delivery', 'delivery duration', 'when will i get it', 'days'],
    answer: '• Colombo & Suburbs: Delivered within 24–48 hours (next-day delivery available).\n• Islandwide (all other districts): Delivered within 2–3 business days via prompt courier.',
  },
  {
    id: 'shipping-change-address',
    category: 'shipping',
    question: 'Can I change my delivery address?',
    keywords: ['change address', 'update address', 'wrong address', 'change delivery'],
    answer: 'Yes, if your package has not yet been dispatched from our studio. Please contact our support team immediately on WhatsApp (+94 70 118 4914) with your Order ID and updated address.',
    actionLink: { label: 'WhatsApp ELIX Team', url: 'https://wa.me/94701184914', isExternal: true },
  },

  // D. PAYMENTS
  {
    id: 'payments-methods',
    category: 'payments',
    question: 'What payment methods are accepted?',
    keywords: ['payment methods', 'how to pay', 'payment options', 'cards', 'visa', 'mastercard'],
    answer: 'We accept:\n1. Cash on Delivery (COD) — pay cash upon doorstep delivery.\n2. Credit / Debit Cards (Visa & MasterCard).\n3. Direct Bank Transfer.\n4. Mintpay (Pay in 3 interest-free monthly installments).',
  },
  {
    id: 'payments-bank',
    category: 'payments',
    question: 'Can I pay using a bank transfer?',
    keywords: ['bank transfer', 'direct bank', 'transfer', 'bank deposit'],
    answer: 'Yes! You can choose direct bank transfer at checkout. After placing the order, simply transfer the total to our bank account and send the transfer slip to our WhatsApp (+94 70 118 4914) with your Order ID for verification.',
  },
  {
    id: 'payments-cod',
    category: 'payments',
    question: 'Is cash on delivery available?',
    keywords: ['cash on delivery', 'cod', 'pay on delivery', 'pay at doorstep'],
    answer: 'Yes, Cash on Delivery (COD) is available for all deliveries across Sri Lanka. Simply select "Cash on Delivery" at checkout and pay the courier when your ELIX package arrives.',
  },
  {
    id: 'payments-secure',
    category: 'payments',
    question: 'Is online payment secure?',
    keywords: ['online payment secure', 'secure', 'safe', 'encryption', 'security'],
    answer: '100% secure. All card transactions are encrypted with bank-grade 256-bit SSL encryption. ELIX never stores your card credentials or CVV numbers on our servers.',
  },

  // E. RETURNS AND EXCHANGES
  {
    id: 'returns-exchange',
    category: 'returns',
    question: 'Can I exchange a T-shirt?',
    keywords: ['exchange t-shirt', 'exchange', 'size exchange', 'swap size', 'change size'],
    answer: 'Yes! We offer a 7-day hassle-free size exchange on all ELIX t-shirts. Items must be unworn, unwashed, and in brand-new condition with all original tags attached. Message us on WhatsApp (+94 70 118 4914) to begin your exchange.',
    actionLink: { label: 'Exchange on WhatsApp', url: 'https://wa.me/94701184914', isExternal: true },
  },
  {
    id: 'returns-damaged',
    category: 'returns',
    question: 'What if I receive a damaged product?',
    keywords: ['damaged product', 'defect', 'damaged', 'faulty', 'wrong item', 'tear'],
    answer: 'Every ELIX garment is rigorously inspected before dispatch. In the rare event you receive a defective or incorrect item, notify us on WhatsApp (+94 70 118 4914) within 48 hours of delivery with a clear photo. We will immediately dispatch a free replacement!',
    actionLink: { label: 'Report Issue on WhatsApp', url: 'https://wa.me/94701184914', isExternal: true },
  },
  {
    id: 'returns-policy',
    category: 'returns',
    question: 'What is your return policy?',
    keywords: ['return policy', 'returns', 'refund', 'money back'],
    answer: 'We provide a 7-day size exchange guarantee on unworn, unwashed garments with tags intact. If an exchange item is out of stock, store credit or an approved refund will be issued. Please contact the ELIX support team on WhatsApp (+94 70 118 4914) for confirmation.',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'payments', label: 'Payments' },
  { id: 'returns', label: 'Returns & Exchange' },
];

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [hasUnread, setHasUnread] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat history from sessionStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = sessionStorage.getItem('elix_ai_chat');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [
      {
        id: 'welcome',
        sender: 'assistant',
        text: 'Hey! Welcome to ELIX. How can I help you today?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('elix_ai_chat', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages, isTyping]);

  const findBestAnswer = (query: string): FAQItem | null => {
    const cleanQuery = query.toLowerCase().trim();

    // Exact or direct question match
    const exact = FAQ_KNOWLEDGE_BASE.find(
      (item) => item.question.toLowerCase() === cleanQuery || cleanQuery.includes(item.question.toLowerCase())
    );
    if (exact) return exact;

    // Keyword match scoring
    let bestItem: FAQItem | null = null;
    let highestScore = 0;

    for (const item of FAQ_KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of item.keywords) {
        if (cleanQuery.includes(kw)) {
          score += kw.length; // weight longer specific keywords
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestItem = item;
      }
    }

    if (highestScore > 0) {
      return bestItem;
    }

    return null;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    soundManager.playClick();

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate natural response latency
    setTimeout(() => {
      const matchedFAQ = findBestAnswer(text);

      let responseText = '';
      let actionLink: { label: string; url: string; isExternal?: boolean } | undefined;

      if (matchedFAQ) {
        responseText = matchedFAQ.answer;
        actionLink = matchedFAQ.actionLink;
      } else {
        responseText =
          "I couldn't locate that specific detail in our official guide. Please contact the ELIX support team for confirmation. Our stylists and support team are available on WhatsApp (+94 70 118 4914) or via email at Contact@sheraxzy.com.";
        actionLink = {
          label: 'Direct WhatsApp Support',
          url: 'https://wa.me/94701184914?text=Hi%20ELIX%2C%20I%20have%20an%20inquiry%20regarding%20my%20order',
          isExternal: true,
        };
      }

      const botMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLink,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      soundManager.playNotification();

      if (!isOpen) {
        setHasUnread(true);
      }
    }, 600);
  };

  const handleSelectQuestion = (faq: FAQItem) => {
    handleSendMessage(faq.question);
  };

  const handleClearChat = () => {
    soundManager.playClick();
    const initialMsg: Message = {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hey! Welcome to ELIX. How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialMsg]);
    try {
      sessionStorage.removeItem('elix_ai_chat');
    } catch {}
  };

  const filteredFAQs =
    selectedCategory === 'all'
      ? FAQ_KNOWLEDGE_BASE
      : FAQ_KNOWLEDGE_BASE.filter((item) => item.category === selectedCategory);

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="ai-widget-trigger-wrap">
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            setIsOpen(!isOpen);
          }}
          className={`ai-widget-trigger ${isOpen ? 'active' : ''}`}
          aria-label="Open ELIX AI Assistant"
          title="ELIX Assistant"
        >
          <div className="ai-trigger-icon-wrap">
            {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
          </div>
          {!isOpen && (
            <span className="ai-trigger-label">
              <Sparkles size={13} className="ai-sparkle-icon" /> ELIX Assistant
            </span>
          )}
          {hasUnread && !isOpen && <span className="ai-trigger-badge" />}
        </button>
      </div>

      {/* Animated Chat Window Modal */}
      {isOpen && (
        <div className="ai-chat-window animate-scale-up" role="dialog" aria-label="ELIX Assistant Chat">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-info">
              <div className="ai-avatar-badge">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="ai-header-title">ELIX Assistant</div>
                <div className="ai-header-status">
                  <span className="ai-status-dot" /> Online • Official Streetwear Support
                </div>
              </div>
            </div>

            <div className="ai-header-actions">
              <a
                href="https://wa.me/94701184914?text=Hello%20ELIX%20Team"
                target="_blank"
                rel="noopener noreferrer"
                className="ai-header-btn"
                title="Direct WhatsApp Support (+94 70 118 4914)"
                onClick={() => soundManager.playClick()}
              >
                <Phone size={14} />
              </a>
              <button
                type="button"
                onClick={handleClearChat}
                className="ai-header-btn"
                title="Reset conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setIsOpen(false);
                }}
                className="ai-header-btn close"
                title="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="ai-category-strip">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`ai-cat-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedCategory(cat.id);
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="ai-chat-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`ai-msg-row ${msg.sender === 'user' ? 'user-side' : 'assistant-side'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="ai-msg-avatar">
                    <Sparkles size={12} />
                  </div>
                )}
                <div className="ai-msg-bubble-wrap">
                  <div className="ai-msg-bubble">
                    <div className="ai-msg-text" style={{ whiteSpace: 'pre-line' }}>
                      {msg.text}
                    </div>

                    {msg.actionLink && (
                      <div className="ai-msg-action">
                        {msg.actionLink.isExternal ? (
                          <a
                            href={msg.actionLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ai-action-btn"
                            onClick={() => soundManager.playClick()}
                          >
                            {msg.actionLink.label} <ArrowUpRight size={13} />
                          </a>
                        ) : (
                          <a
                            href={msg.actionLink.url}
                            className="ai-action-btn"
                            onClick={() => soundManager.playClick()}
                          >
                            {msg.actionLink.label} <ChevronRight size={13} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="ai-msg-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="ai-msg-row assistant-side animate-fade-in">
                <div className="ai-msg-avatar">
                  <Sparkles size={12} />
                </div>
                <div className="ai-typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested FAQs Accordion / Chips */}
          <div className="ai-suggested-section">
            <div className="ai-suggested-title">
              <HelpCircle size={12} /> Suggested Questions
            </div>
            <div className="ai-suggested-scroll">
              {filteredFAQs.slice(0, 6).map((faq) => (
                <button
                  key={faq.id}
                  type="button"
                  className="ai-suggested-pill"
                  onClick={() => handleSelectQuestion(faq)}
                >
                  {faq.question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form
            className="ai-chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about sizes, delivery, payment..."
              className="ai-chat-input"
              maxLength={200}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="ai-send-btn luxury-hover"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIAssistant;

