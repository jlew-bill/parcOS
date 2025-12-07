import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CreditCard, LogOut, Zap } from 'lucide-react';

interface UserMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onToggle }) => {
  const [subscriptionStatus] = useState<'free' | 'early_access' | 'pro'>('free');

  const getStatusBadge = () => {
    switch (subscriptionStatus) {
      case 'early_access':
        return { label: 'Early Access Active', color: 'bg-amber-500/20 text-amber-200' };
      case 'pro':
        return { label: 'Pro Active', color: 'bg-indigo-500/20 text-indigo-200' };
      default:
        return { label: 'Free Plan', color: 'bg-white/10 text-white/60' };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 border border-white/20 shadow-inner flex items-center justify-center overflow-hidden hover:border-white/40 transition-colors"
        data-testid="button-user-menu"
      >
        <User className="w-5 h-5 text-gray-700" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 rounded-xl bg-black/90 border border-white/20 backdrop-blur-md shadow-xl overflow-hidden z-50"
            data-testid="menu-user-dropdown"
          >
            {/* Status Section */}
            <div className="px-4 py-3 border-b border-white/10">
              <div className="text-xs font-medium text-white/60 mb-2">SUBSCRIPTION</div>
              <div className={`px-3 py-2 rounded-lg ${badge.color} text-center text-sm font-semibold flex items-center justify-center gap-2`}>
                {subscriptionStatus !== 'free' && <Zap className="w-4 h-4" />}
                {badge.label}
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/pricing"
                className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 transition-colors group"
                data-testid="link-upgrade"
                onClick={onToggle}
              >
                <CreditCard className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                <span className="flex-1">Upgrade Plan</span>
                {subscriptionStatus === 'free' && <span className="text-xs font-semibold text-indigo-400">NEW</span>}
              </Link>

              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 transition-colors"
                data-testid="link-account-settings"
                onClick={(e) => {
                  e.preventDefault();
                  onToggle();
                }}
              >
                <User className="w-4 h-4 text-white/60" />
                <span>Account Settings</span>
              </a>

              <div className="border-t border-white/10 my-2" />

              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-red-400/80 hover:bg-red-500/10 transition-colors"
                data-testid="link-logout"
                onClick={(e) => {
                  e.preventDefault();
                  onToggle();
                }}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </a>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/10 bg-white/5">
              <p className="text-xs text-white/40">
                Powered by <span className="text-white/60">parcRI</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
