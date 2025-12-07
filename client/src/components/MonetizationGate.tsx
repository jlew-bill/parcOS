import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap } from 'lucide-react';
import stripeConfig from '../../../config/stripe.auto.json';

export type TierKey = 'early_access' | 'athlete_pro' | 'creator_pro' | 'team_suite' | 'district_suite';

interface MonetizationGateProps {
  requiredTier: TierKey;
  userTier?: TierKey | null;
  featureName: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * MonetizationGate - Wraps features that require specific tiers
 * Shows upgrade prompt if user doesn't have required tier
 */
export const MonetizationGate: React.FC<MonetizationGateProps> = ({
  requiredTier,
  userTier = null,
  featureName,
  children,
  className = '',
}) => {
  const tierConfig = stripeConfig[requiredTier as keyof typeof stripeConfig];
  const hasAccess = userTier === requiredTier || (userTier && isHigherTier(userTier, requiredTier));

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative group ${className}`}
    >
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 pointer-events-none" />

      <div className="relative p-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <div className="p-3 rounded-full bg-indigo-500/20 border border-indigo-500/30">
            <Lock className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <h3 className="font-semibold text-white mb-2">
          {featureName} is a {tierConfig?.name} feature
        </h3>

        <p className="text-sm text-white/60 mb-4">
          Unlock this feature and more by upgrading your plan.
        </p>

        <a
          href={tierConfig?.paymentLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
          data-testid={`button-upgrade-to-${requiredTier}`}
        >
          <Zap className="w-4 h-4" />
          Upgrade to {tierConfig?.name}
        </a>
      </div>
    </motion.div>
  );
};

/**
 * Tier hierarchy for access validation
 */
function isHigherTier(userTier: TierKey, requiredTier: TierKey): boolean {
  const hierarchy: Record<TierKey, number> = {
    'early_access': 1,
    'athlete_pro': 2,
    'creator_pro': 2,
    'team_suite': 3,
    'district_suite': 4,
  };

  return hierarchy[userTier] > hierarchy[requiredTier];
}

/**
 * NIL Monetization Upsell - Athlete-specific upgrade prompt
 */
export const NILUpgradeBanner: React.FC = () => {
  const tierConfig = stripeConfig.athlete_pro;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 p-4 mb-4"
      data-testid="banner-nil-upgrade"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/30">
          <Zap className="w-4 h-4 text-indigo-300" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">Unlock Athlete Pro</h4>
          <p className="text-sm text-white/70 mb-3">
            Get advanced media kit generation, AI brand matching, and detailed analytics.
          </p>
          <a
            href={tierConfig?.paymentLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-colors"
            data-testid="link-nil-upgrade-upsell"
          >
            Learn More →
          </a>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * CreatorFlow Monetization Upsell - Creator-specific upgrade prompt
 */
export const CreatorUpgradeBanner: React.FC = () => {
  const tierConfig = stripeConfig.creator_pro;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 p-4 mb-4"
      data-testid="banner-creator-upgrade"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-purple-500/30">
          <Zap className="w-4 h-4 text-purple-300" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">Unlock CreatorFlow Pro</h4>
          <p className="text-sm text-white/70 mb-3">
            Access advanced templates, auto-captions, AI suggestions, and unlimited exports.
          </p>
          <a
            href={tierConfig?.paymentLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-300 hover:text-purple-200 transition-colors"
            data-testid="link-creator-upgrade-upsell"
          >
            Learn More →
          </a>
        </div>
      </div>
    </motion.div>
  );
};
