import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import stripeConfig from '../../../config/stripe.auto.json';

interface StripeProduct {
  tierKey: string;
  name: string;
  productId: string;
  priceId: string;
  paymentLinkUrl: string;
  priceAmount: number;
  billingCycle: string;
}

export function Pricing() {
  const [products, setProducts] = useState<StripeProduct[]>([]);

  useEffect(() => {
    const productList = Object.values(stripeConfig) as StripeProduct[];
    setProducts(productList);
  }, []);

  const formatPrice = (amount: number, billingCycle: string) => {
    if (billingCycle === 'one_time') {
      return `$${amount.toFixed(2)}`;
    }
    return `$${amount.toFixed(2)}/mo`;
  };

  const formatBillingLabel = (billingCycle: string) => {
    if (billingCycle === 'one_time') {
      return 'One-time purchase';
    }
    return 'Billed monthly';
  };

  const getPricingDescription = (tierKey: string) => {
    const descriptions: { [key: string]: string } = {
      early_access: 'Perfect for early adopters who want priority access and future upgrades.',
      athlete_pro: 'Advanced tools designed specifically for student-athletes.',
      creator_pro: 'Full creative suite powered by parcRI for content creators.',
      team_suite: 'Professional tools for coaching staffs, teams, and programs.',
      district_suite: 'Enterprise solution for school districts and large organizations.'
    };
    return descriptions[tierKey] || '';
  };

  return (
    <div className="w-full flex flex-col items-center bg-[#f7f7f7] min-h-screen">
      <style>{`
        .pricing-header {
          width: 100%;
          padding: 60px 20px;
          text-align: center;
        }

        .pricing-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background: #fff;
          border-bottom: 1px solid #e5e5e5;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .pricing-nav-logo {
          font-size: 1.1rem;
          font-weight: 700;
          color: #111;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .pricing-nav-logo:hover {
          color: #555;
        }

        .pricing-nav-links {
          display: flex;
          gap: 30px;
          align-items: center;
        }

        .pricing-nav-links a {
          color: #666;
          text-decoration: none;
          font-size: 1rem;
          transition: 0.2s ease;
        }

        .pricing-nav-links a:hover {
          color: #111;
        }

        .pricing-title {
          font-size: 2.8rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #111;
        }

        .pricing-subtitle {
          font-size: 1.25rem;
          color: #666;
          margin-bottom: 48px;
          font-weight: 400;
        }

        .pricing-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 80px;
        }

        .pricing-card {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          border: 2px solid transparent;
        }

        .pricing-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
          border-color: #111;
        }

        .pricing-card-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111;
          margin-bottom: 12px;
        }

        .pricing-card-description {
          font-size: 0.95rem;
          color: #666;
          margin-bottom: 24px;
          line-height: 1.5;
          flex-grow: 1;
        }

        .pricing-card-price {
          font-size: 2.5rem;
          font-weight: 700;
          color: #111;
          margin-bottom: 4px;
        }

        .pricing-card-billing {
          font-size: 0.85rem;
          color: #999;
          margin-bottom: 28px;
          font-weight: 500;
        }

        .pricing-card-cta {
          width: 100%;
          padding: 14px 24px;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
          display: inline-block;
          transition: 0.2s ease;
        }

        .pricing-card-cta:hover {
          background: #333;
          transform: translateY(-2px);
        }

        .pricing-footer {
          width: 100%;
          padding: 60px 20px;
          background: #fff;
          border-top: 1px solid #e5e5e5;
          text-align: center;
        }

        .pricing-footer-text {
          font-size: 0.95rem;
          color: #666;
          margin-bottom: 24px;
        }

        .pricing-footer-links {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .pricing-footer-links a {
          color: #666;
          text-decoration: none;
          font-size: 0.9rem;
          transition: 0.2s ease;
        }

        .pricing-footer-links a:hover {
          color: #111;
        }

        @media (max-width: 768px) {
          .pricing-nav {
            padding: 16px 20px;
            flex-direction: column;
            gap: 16px;
          }

          .pricing-nav-links {
            gap: 16px;
          }

          .pricing-title {
            font-size: 2rem;
          }

          .pricing-subtitle {
            font-size: 1.05rem;
            margin-bottom: 32px;
          }

          .pricing-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pricing-grid {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>

      <div className="pricing-nav">
        <Link href="/" className="pricing-nav-logo" data-testid="link-logo">
          PARC
        </Link>
        <div className="pricing-nav-links">
          <Link href="/" className="pricing-nav-links" data-testid="link-home">
            Home
          </Link>
          <a href="/app" className="pricing-nav-links" data-testid="link-app">
            App
          </a>
          <a href="https://buy.stripe.com/test_4gM00j98qdLw5mA6bD9ws00" target="_blank" rel="noopener noreferrer" data-testid="link-early-access-nav">
            Get Started
          </a>
        </div>
      </div>

      <div className="pricing-header">
        <h1 className="pricing-title" data-testid="heading-pricing-title">Simple, Transparent Pricing</h1>
        <p className="pricing-subtitle" data-testid="text-pricing-subtitle">Choose the plan that fits your needs. All plans include access to core features.</p>
      </div>

      <div className="pricing-container">
        <div className="pricing-grid">
          {products.map((product) => (
            <div key={product.tierKey} className="pricing-card" data-testid={`card-pricing-${product.tierKey}`}>
              <h3 className="pricing-card-name" data-testid={`heading-product-${product.tierKey}`}>
                {product.name}
              </h3>
              <p className="pricing-card-description" data-testid={`text-description-${product.tierKey}`}>
                {getPricingDescription(product.tierKey)}
              </p>
              <div className="pricing-card-price" data-testid={`text-price-${product.tierKey}`}>
                {formatPrice(product.priceAmount, product.billingCycle)}
              </div>
              <div className="pricing-card-billing" data-testid={`text-billing-${product.tierKey}`}>
                {formatBillingLabel(product.billingCycle)}
              </div>
              <a
                href={product.paymentLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pricing-card-cta"
                data-testid={`button-buy-${product.tierKey}`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="pricing-footer">
        <p className="pricing-footer-text" data-testid="text-footer-notice">
          All plans include free tier capabilities. Need a custom solution? Contact us for enterprise pricing.
        </p>
        <div className="pricing-footer-links">
          <a href="https://mynil.parcri.net" target="_blank" rel="noopener noreferrer" data-testid="link-footer-mynil">
            myNIL
          </a>
          <a href="https://station.parcri.net/app" target="_blank" rel="noopener noreferrer" data-testid="link-footer-parcstation">
            parcStation
          </a>
          <a href="https://board.parcri.net" target="_blank" rel="noopener noreferrer" data-testid="link-footer-parcboard">
            parcBoard
          </a>
          <a href="https://creator.parcri.net" target="_blank" rel="noopener noreferrer" data-testid="link-footer-creatorflow">
            CreatorFlow
          </a>
        </div>
      </div>
    </div>
  );
}
