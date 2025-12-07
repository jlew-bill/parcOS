import React from 'react';
import { Link } from 'wouter';
import previewImg1 from '@assets/generated_images/hyperbar_os_workspace_interface.png';
import previewImg2 from '@assets/generated_images/hyperbar_os_dashboard_view.png';
import previewImg3 from '@assets/generated_images/hyperbar_os_knowledge_system.png';
import previewImg4 from '@assets/generated_images/hyperbar_os_workspace_cards.png';

export function Landing() {
  return (
    <div className="w-full min-h-screen flex justify-center items-center p-5 bg-[#f7f7f7]">
      <style>{`
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
        }

        .landing-cta a {
          text-decoration: none;
          display: inline-block;
          background: #111;
          color: #fff;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 1.05rem;
          font-weight: 600;
          transition: 0.2s ease;
          margin-right: 12px;
        }

        .landing-cta a:hover {
          background: #333;
          transform: translateY(-2px);
        }

        .landing-links {
          margin-top: 28px;
          font-size: 0.95rem;
          color: #444;
        }

        .landing-links a {
          color: #444;
          text-decoration: underline;
          margin: 0 10px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="landing-container">
        <div className="landing-badge">NEW • PARCOS v1</div>

        <h1>PARC Real Intelligence</h1>

        <div className="landing-tagline">
          The world's first <b>state-based cognitive OS</b>.<br />
          Powered by shape vectors.  
          Syncs up to <b>20×–200× faster</b> than traditional AI.
        </div>

        <div className="landing-cta">
          <a href="https://buy.stripe.com/test_placeholder" target="_blank" data-testid="cta-early-access">
            Get Early Access — $0.99
          </a>
          <a href="https://station.parcri.net/app" target="_blank" data-testid="button-enter-app" style={{ background: '#333' }}>
            Enter App
          </a>
        </div>

        <div className="landing-links">
          <a href="https://mynil.parcri.net" target="_blank" data-testid="link-mynil">myNIL</a>
          <a href="https://station.parcri.net/app" target="_blank" data-testid="link-parcstation">parcStation</a>
          <a href="https://board.parcri.net" target="_blank" data-testid="link-parcboard">parcBoard</a>
          <a href="https://creator.parcri.net" target="_blank" data-testid="link-creatorflow">CreatorFlow</a>
        </div>
      </div>
    </div>
  );
}
