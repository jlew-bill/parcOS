import React from 'react';
import { Link } from 'wouter';
import stripeConfig from '../../../config/stripe.auto.json';

export function Landing() {
  const earlyAccessLink = (stripeConfig as any).early_access?.paymentLinkUrl || 'https://buy.stripe.com/test_placeholder';

  return (
    <div className="w-full flex flex-col items-center bg-[#f7f7f7]">
      <style>{`
        .landing-hero {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .landing-container {
          max-width: 620px;
          text-align: center;
          animation: fadeIn 0.8s ease-out;
        }

        .landing-container h1 {
          font-size: 2.8rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #111;
        }

        .landing-tagline {
          font-size: 1.25rem;
          font-weight: 400;
          margin-bottom: 30px;
          color: #333;
          line-height: 1.45;
        }

        .landing-badge {
          display: inline-block;
          background: #000;
          color: #fff;
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 0.9rem;
          margin-bottom: 18px;
          letter-spacing: 0.4px;
        }

        .landing-cta {
          margin-top: 35px;
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .landing-cta-button {
          text-decoration: none;
          display: inline-block;
          background: #111;
          color: #fff;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 1.05rem;
          font-weight: 600;
          transition: 0.2s ease;
        }

        .landing-cta-button:hover {
          background: #333;
          transform: translateY(-2px);
        }

        .landing-cta-button-secondary {
          background: #333;
        }

        .landing-links {
          margin-top: 28px;
          font-size: 0.95rem;
          color: #444;
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .landing-links a {
          color: #444;
          text-decoration: underline;
        }

        .landing-links a:hover {
          color: #111;
        }

        .preview-strip-section {
          width: 100%;
          padding: 64px 20px 48px 20px;
          background: #f7f7f7;
        }

        @media (max-width: 640px) {
          .preview-strip-section {
            padding: 32px 20px 32px 20px;
          }
        }

        .preview-strip-container {
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .preview-strip-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: #111;
        }

        .preview-strip-subtext {
          font-size: 1.125rem;
          color: #666;
          margin-bottom: 32px;
          font-weight: 400;
        }

        .preview-strip-frame {
          background: #f8f8f8cc;
          border-radius: 18px;
          padding: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          margin-bottom: 20px;
        }

        .preview-strip-image {
          width: 100%;
          height: auto;
          border-radius: 12px;
          display: block;
        }

        .preview-strip-note {
          font-size: 0.9rem;
          color: #999;
          margin-top: 16px;
          font-weight: 400;
        }

        .preview-section {
          width: 100%;
          padding: 60px 20px;
          background: #f7f7f7;
        }

        .preview-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .preview-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 40px;
          color: #111;
        }

        .preview-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .preview-frame {
          background: #fff;
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease;
        }

        .preview-frame:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .preview-image {
          width: 100%;
          height: 240px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 8px;
          object-fit: cover;
          filter: blur(3px);
        }

        .preview-label {
          text-align: center;
          margin-top: 12px;
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .preview-cta {
          text-align: center;
          margin-top: 20px;
        }

        .preview-cta a {
          text-decoration: none;
          display: inline-block;
          background: #111;
          color: #fff;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          transition: 0.2s ease;
        }

        .preview-cta a:hover {
          background: #333;
          transform: translateY(-2px);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="landing-hero">
        <div className="landing-container">
          <div className="landing-badge">NEW • PARCOS v1</div>

          <h1>PARC Real Intelligence</h1>

          <div className="landing-tagline">
            The world's first <b>state-based cognitive OS</b>.<br />
            Powered by shape vectors.  
            Syncs up to <b>20×–200× faster</b> than traditional AI.
          </div>

          <div className="landing-cta">
            <a 
              href={earlyAccessLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="landing-cta-button"
              data-testid="cta-early-access"
            >
              Get Early Access — $0.99
            </a>
            <Link 
              href="/app"
              className="landing-cta-button landing-cta-button-secondary"
              data-testid="button-enter-app"
            >
              Enter App
            </Link>
          </div>

          <div className="landing-links">
            <Link href="/pricing" data-testid="link-pricing">Pricing</Link>
            <Link href="/nil" data-testid="link-mynil">myNIL</Link>
            <Link href="/app" data-testid="link-parcstation">parcStation</Link>
            <Link href="/board" data-testid="link-parcboard">parcBoard</Link>
            <Link href="/creator" data-testid="link-creatorflow">CreatorFlow</Link>
          </div>
        </div>
      </div>

      <section className="preview-strip-section">
        <div className="preview-strip-container">
          <h2 className="preview-strip-title">A new kind of operating system.</h2>
          <p className="preview-strip-subtext">Built on meaning. Powered by parcRI.</p>
          
          <div className="preview-strip-frame">
            <img 
              src="/preview/hyperbar.png" 
              alt="HyperBar OS Preview" 
              className="preview-strip-image"
              data-testid="preview-hyperbar-image"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          
          <p className="preview-strip-note">This is an early preview. Your experience will update automatically.</p>
        </div>
      </section>

      <div className="preview-section">
        <div className="preview-container">
          <h2 className="preview-title">See HyperBar OS in action</h2>
          
          <div className="preview-gallery">
            <div className="preview-frame">
              <div className="preview-image" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }} />
              <div className="preview-label">Spatial Workspace</div>
            </div>

            <div className="preview-frame">
              <div className="preview-image" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }} />
              <div className="preview-label">Card Stack Interface</div>
            </div>

            <div className="preview-frame">
              <div className="preview-image" style={{ background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)' }} />
              <div className="preview-label">Knowledge Management</div>
            </div>

            <div className="preview-frame">
              <div className="preview-image" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }} />
              <div className="preview-label">Real-time Sync</div>
            </div>

            <div className="preview-frame">
              <div className="preview-image" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }} />
              <div className="preview-label">Adaptive UI</div>
            </div>

            <div className="preview-frame">
              <div className="preview-image" style={{ background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)' }} />
              <div className="preview-label">Cognitive Engine</div>
            </div>
          </div>

          <div className="preview-cta">
            <Link href="/app" data-testid="button-explore-full">
              Explore Full Interface →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
