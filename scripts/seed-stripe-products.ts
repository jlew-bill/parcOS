import { getUncachableStripeClient } from '../server/stripeClient';
import * as fs from 'fs';
import * as yaml from 'yaml';
import * as path from 'path';

interface PricingTier {
  name: string;
  price: number;
  billing_cycle: 'none' | 'one_time' | 'monthly';
  description: string;
  includes: string[];
  limits?: Record<string, any>;
}

interface PricingConfig {
  pricing: {
    version: string;
    currency: string;
    tiers: Record<string, PricingTier>;
  };
}

interface StripeProductResult {
  tierKey: string;
  name: string;
  productId: string;
  priceId: string;
  paymentLinkId: string;
  paymentLinkUrl: string;
  priceAmount: number;
  billingCycle: string;
}

async function seedStripeProducts() {
  console.log('🚀 Starting Stripe product seeding...\n');

  const stripe = await getUncachableStripeClient();
  console.log('✅ Connected to Stripe\n');

  const pricingPath = path.join(process.cwd(), 'pricing.yml');
  const pricingData: PricingConfig = yaml.parse(fs.readFileSync(pricingPath, 'utf8'));
  const tiers = pricingData.pricing.tiers;

  console.log('📋 Found pricing tiers:', Object.keys(tiers).join(', '), '\n');

  const results: Record<string, StripeProductResult> = {};

  for (const [tierKey, tier] of Object.entries(tiers)) {
    if (tierKey === 'free' || tier.price === 0) {
      console.log(`⏭️  Skipping "${tier.name}" (free tier)\n`);
      continue;
    }

    console.log(`📦 Creating product for "${tier.name}"...`);

    const product = await stripe.products.create({
      name: tier.name,
      description: tier.description,
      metadata: { 
        tier: tierKey,
        ecosystem: 'parcRI',
        includes: tier.includes.join(' | ')
      }
    });
    console.log(`   Product ID: ${product.id}`);

    const priceOptions: any = {
      product: product.id,
      unit_amount: Math.round(tier.price * 100),
      currency: 'usd',
    };

    if (tier.billing_cycle === 'monthly') {
      priceOptions.recurring = { interval: 'month' };
    }

    const price = await stripe.prices.create(priceOptions);
    console.log(`   Price ID: ${price.id} ($${tier.price}${tier.billing_cycle === 'monthly' ? '/mo' : ' one-time'})`);

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: {
        tier: tierKey,
        ecosystem: 'parcRI'
      }
    });
    console.log(`   Payment Link: ${paymentLink.url}\n`);

    results[tierKey] = {
      tierKey,
      name: tier.name,
      productId: product.id,
      priceId: price.id,
      paymentLinkId: paymentLink.id,
      paymentLinkUrl: paymentLink.url,
      priceAmount: tier.price,
      billingCycle: tier.billing_cycle
    };
  }

  const configPath = path.join(process.cwd(), 'config', 'stripe.auto.json');
  fs.writeFileSync(configPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Saved configuration to ${configPath}`);

  console.log('\n✨ Stripe product seeding complete!\n');
  console.log('Summary:');
  console.log('─'.repeat(60));
  for (const [tierKey, result] of Object.entries(results)) {
    console.log(`${result.name}:`);
    console.log(`  Price: $${result.priceAmount}${result.billingCycle === 'monthly' ? '/mo' : ' one-time'}`);
    console.log(`  Link: ${result.paymentLinkUrl}`);
    console.log('');
  }

  return results;
}

seedStripeProducts()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
