'use client';

import { useEffect, useState } from 'react';
import KrishiMitraChat from '@/components/KrishiMitraChat';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#111827' }}>
      
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.3s ease', padding: '20px 0'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: 800, color: '#1b4332' }}>
            🌾 SCAS
          </div>
          <div style={{ display: 'none', mdDisplay: 'flex', gap: '32px', fontSize: '15px', fontWeight: 500, color: '#4b5563' }} className="nav-links">
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#process">Process</a>
            <a href="#crops">Crops</a>
            <a href="#impact">Impact</a>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="/login" style={{ padding: '10px 20px', fontWeight: 600, color: '#1b4332' }}>Log In</a>
            <a href="/register" style={{
              padding: '10px 24px', backgroundColor: '#1b4332', color: '#fff', borderRadius: '30px', fontWeight: 600,
              boxShadow: '0 4px 14px rgba(27,67,50,0.3)', transition: 'transform 0.2s'
            }}>Register Farmer</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ paddingTop: '140px', paddingBottom: '0', textAlign: 'center', maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '64px', fontWeight: 800, color: '#111827', lineHeight: 1.1, maxWidth: '900px', margin: '0 auto 24px', letterSpacing: '-1px' }}>
          Empowering India's Farmers, <br />
          <span style={{ color: '#1b4332' }}>Connecting Local Fields to Global Trade</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#4b5563', maxWidth: '700px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          Smart agricultural problem resolution powered by AI. We bring expert government oversight to your fingertips, ensuring 24-48 hour solutions for rural India.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '60px' }}>
          <a href="/register" style={{ padding: '16px 36px', backgroundColor: '#1b4332', color: '#fff', borderRadius: '30px', fontWeight: 600, fontSize: '16px', boxShadow: '0 4px 20px rgba(27,67,50,0.2)' }}>
            Start Using SCAS Free
          </a>
          <a href="#process" style={{ padding: '16px 36px', border: '2px solid #e5e7eb', color: '#374151', borderRadius: '30px', fontWeight: 600, fontSize: '16px' }}>
            How it works
          </a>
        </div>
        
        {/* Massive Hero Block */}
        <div style={{ padding: '0 24px', marginTop: '20px' }}>
          <div style={{
            width: '100%', height: '500px', borderRadius: '30px', overflow: 'hidden',
            backgroundImage: "url('/images/hero.png')",
            backgroundSize: 'cover', backgroundPosition: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}></div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', textAlign: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '60px' }}>
          <div><h3 style={{ fontSize: '48px', fontWeight: 300, color: '#111827', marginBottom: '8px' }}>50+</h3><p style={{ color: '#6b7280', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Govt Districts</p></div>
          <div><h3 style={{ fontSize: '48px', fontWeight: 300, color: '#111827', marginBottom: '8px' }}>10,000+</h3><p style={{ color: '#6b7280', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Farmers Helped</p></div>
          <div><h3 style={{ fontSize: '48px', fontWeight: 300, color: '#111827', marginBottom: '8px' }}>5,000+</h3><p style={{ color: '#6b7280', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Problems Resolved</p></div>
          <div><h3 style={{ fontSize: '48px', fontWeight: 300, color: '#111827', marginBottom: '8px' }}>24h</h3><p style={{ color: '#6b7280', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Resolution Time</p></div>
        </div>
      </section>

      {/* Empowering Farmers (3 vertical cards) */}
      <section id="features" style={{ padding: '60px 24px', backgroundColor: '#fafbfc' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div style={{ maxWidth: '400px' }}>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>★ Our Mission</span>
              <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginTop: '12px', lineHeight: 1.2 }}>Empowering Farmers, Securing Yields</h2>
            </div>
            <p style={{ maxWidth: '500px', color: '#6b7280', fontSize: '15px', lineHeight: 1.6 }}>
              SCAS bridges the gap between remote agriculture and expert agronomists. Using AI and offline-first tech, we ensure no crop disease goes unnoticed.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <FeatureCard number="1" title="AI Disease Scanner" desc="Instant leaf disease identification using local neural networks." emoji="🔍" color="#bbf7d0" />
            <FeatureCard number="2" title="Voice & Hindi Support" desc="Speak naturally in Hindi with Krishi Mitra, our offline AI." emoji="🎙️" color="#bfdbfe" />
            <FeatureCard number="3" title="Guaranteed Resolution" desc="Escalation to Sub-Heads if tickets aren't solved in 24 hours." emoji="⚖️" color="#fef08a" />
          </div>
        </div>
      </section>

      {/* India's Agricultural Powerhouse (3 Crop Cards) */}
      <section id="crops" style={{ padding: '100px 24px', backgroundColor: '#ffffff', textAlign: 'center' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <span style={{ color: '#1b4332', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>★ Top Crops</span>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', margin: '16px auto 24px', maxWidth: '600px', lineHeight: 1.2 }}>
            India's Agricultural Powerhouse for the World
          </h2>
          <p style={{ color: '#6b7280', fontSize: '15px', maxWidth: '600px', margin: '0 auto 60px' }}>
            Tailored advisory modules pre-trained on the most critical Indian export and domestic staples.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'left' }}>
            <CropCard title="Wheat" desc="Early rust detection and optimal fertilizer scheduling for superior grain quality." img="/images/wheat.png" />
            <CropCard title="Paddy (Rice)" desc="Water level management tracking and pest identification for high-yield harvests." img="/images/hero.png" />
            <CropCard title="Cotton" desc="Bollworm prevention alerts and exact spray timing algorithms." img="/images/cotton.png" />
          </div>
          <a href="/register" style={{ display: 'inline-block', marginTop: '40px', padding: '14px 32px', backgroundColor: '#1b4332', color: '#fff', borderRadius: '30px', fontWeight: 600, fontSize: '14px' }}>View All Crops Supported</a>
        </div>
      </section>

      {/* Process (4 grid squares) */}
      <section id="process" style={{ padding: '80px 24px', backgroundColor: '#fafbfc' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' }}>
             <div style={{ maxWidth: '400px' }}>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>★ The Process</span>
              <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginTop: '12px', lineHeight: 1.2 }}>From Local Farm to Global Trade</h2>
            </div>
            <p style={{ maxWidth: '400px', color: '#6b7280', fontSize: '15px', lineHeight: 1.6 }}>
              A seamless, offline-first workflow that ensures every farmer's voice is heard exactly when it matters most.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <ProcessCard number="1" title="Capture & Classify" desc="Farmer takes a photo of the affected crop. AI instantly identifies the anomaly even without internet." emoji="📸" />
            <ProcessCard number="2" title="Background Sync" desc="The moment 4G connectivity is restored, the ticket is securely transmitted to the nearest government block." emoji="☁️" />
            <ProcessCard number="3" title="Expert Ground Truthing" desc="District workers verify the AI's assessment and provide targeted, localized chemical advisory scripts." emoji="👨‍🔬" />
            <ProcessCard number="4" title="Growth & Harvesting" desc="The crop recovers, pushing local farmers' yields into standard global compliance brackets." emoji="📈" />
          </div>
        </div>
      </section>

      {/* Testimonial / Trust Grid */}
      <section style={{ padding: '100px 24px', backgroundColor: '#ffffff', textAlign: 'center' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <span style={{ color: '#1b4332', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>★ Wall of Trust</span>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', margin: '16px auto 40px', maxWidth: '600px', lineHeight: 1.2 }}>
            Trusted by Farmers & Officials Worldwide
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'left' }}>
            <TrustCard text="SCAS caught a massive blight infection in my potato crop 3 days before it spread to my 10 acre neighbor. Saved my season." name="Ramesh Kumar" role="Farmer, UP" />
            <TrustCard text="As a district officer, the automated SLA escalation means I don't have to micromanage. If a ticket breaches 24 hours, I know about it instantly." name="Govind Singh" role="Sub-Head, MP" />
            <TrustCard text="The Hindi voice assistant is incredible. I just speak my problem into the phone and it logs the ticket perfectly every time." name="Sunita Devi" role="Farmer, Haryana" />
            <TrustCard text="It actually works offline. I created 3 tickets in the middle of nowhere and they all synced perfectly when I got back to the village." name="Rajesh P" role="Worker, Punjab" />
          </div>
        </div>
      </section>

      {/* Massive Dark CTA Footer */}
      <section style={{ padding: '0 24px 60px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: '#1b4332', borderRadius: '30px', padding: '100px 60px', 
          backgroundImage: "linear-gradient(rgba(27,67,50,0.8), rgba(27,67,50,0.9)), url('/images/hero.png')",
          backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff', textAlign: 'left',
          boxShadow: '0 20px 40px rgba(27,67,50,0.2)'
        }}>
          <h2 style={{ fontSize: '48px', fontWeight: 700, marginBottom: '24px', maxWidth: '600px', lineHeight: 1.1 }}>
            Ready to Take Indian Agriculture Global?
          </h2>
          <p style={{ fontSize: '18px', color: '#d1fae5', marginBottom: '40px', maxWidth: '500px', lineHeight: 1.6 }}>
            Join 10,000+ farmers securing their harvests with SCAS's AI and expert advisory network.
          </p>
          <a href="/register" style={{ padding: '18px 40px', backgroundColor: '#fff', color: '#1b4332', borderRadius: '40px', fontWeight: 700, fontSize: '16px', display: 'inline-block' }}>
            Register as a Farmer Now
          </a>
        </div>
      </section>

      {/* Simple Footer */}
      <footer style={{ padding: '40px 24px', borderTop: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, color: '#1b4332', fontSize: '20px' }}>🌾 SCAS</div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>© 2026 Smart Crop Advisory System. All rights reserved.</div>
        </div>
      </footer>

      {/* Global AI Chatbot Available on Homepage */}
      <div style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 9999 }}>
        <KrishiMitraChat />
      </div>
    </div>
  );
}

// Subcomponents for the clean look

function FeatureCard({ number, title, desc, emoji, color }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', overflow: 'hidden', padding: '32px', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '40px', flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#6b7280', marginBottom: '16px' }}>0{number}</div>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{desc}</p>
      </div>
      <div style={{
        marginTop: 'auto', borderRadius: '16px', height: '180px',
        backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '72px'
      }}>
        {emoji}
      </div>
    </div>
  );
}

function CropCard({ title, desc, img }) {
  return (
    <div style={{ borderRadius: '24px', overflow: 'hidden', backgroundColor: '#fafbfc' }}>
      <img src={img} alt={title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
      <div style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1b4332', margin: '0 0 8px 0' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{desc}</p>
      </div>
    </div>
  );
}

function ProcessCard({ number, title, desc, emoji }) {
  return (
    <div style={{ display: 'flex', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
      <div style={{ padding: '40px', flex: 1 }}>
        <div style={{ fontSize: '24px', fontWeight: 300, color: '#1b4332', marginBottom: '16px' }}>{number}</div>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{desc}</p>
      </div>
      <div style={{ width: '40%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>
        {emoji}
      </div>
    </div>
  );
}

function TrustCard({ text, name, role }) {
  return (
    <div style={{ backgroundColor: '#fafbfc', borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column', border: '1px solid #f3f4f6' }}>
      <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6, flex: 1, marginBottom: '24px', fontStyle: 'italic' }}>"{text}"</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#1b4332' }}>
          {name.charAt(0)}
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{role}</div>
        </div>
      </div>
    </div>
  );
}
