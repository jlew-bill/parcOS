import React from 'react';
import { TrendingUp, Link2, X } from 'lucide-react';
import { useParcOSStore } from '@/state/store';
import { parcGlass, glassStyles } from '@/design/parcGlass';

const mockDeals = [
  { brand: 'Nike', type: 'Apparel', value: '$15k', status: 'Negotiating', team: 'Cowboys', athlete: 'CeeDee Lamb' },
  { brand: 'Gatorade', type: 'Beverage', value: '$8k', status: 'Signed', team: 'Chiefs', athlete: 'Patrick Mahomes' },
  { brand: 'Local Ford', type: 'Auto', value: '$12k', status: 'Pending', team: 'Lakers', athlete: 'LeBron James' },
  { brand: 'Chipotle', type: 'Food', value: '$500/mo', status: 'Active', team: 'Cowboys', athlete: 'Dak Prescott' },
  { brand: 'State Farm', type: 'Insurance', value: '$25k', status: 'Signed', team: 'Chiefs', athlete: 'Travis Kelce' },
  { brand: 'Beats', type: 'Electronics', value: '$10k', status: 'Negotiating', team: 'Lakers', athlete: 'Anthony Davis' },
];

export const NILDashboard: React.FC<{ payload: any }> = ({ payload }) => {
  const highlightedTeam = useParcOSStore(s => s.highlightedTeam);
  const setHighlightedTeam = useParcOSStore(s => s.setHighlightedTeam);

  const filteredDeals = highlightedTeam 
    ? mockDeals.filter(deal => deal.team.toLowerCase() === highlightedTeam.toLowerCase())
    : mockDeals;

  const displayDeals = highlightedTeam ? filteredDeals : mockDeals.slice(0, 4);

  return (
    <div 
      className="p-6 h-full flex flex-col gap-6 text-white"
      style={{ padding: parcGlass.spacing.cardPadding }}
    >
      {highlightedTeam && (
        <div 
          className="flex items-center justify-between px-3 py-2 animate-pulse"
          style={{
            borderRadius: parcGlass.radius.lg,
            background: 'hsla(245, 90%, 65%, 0.15)',
            border: parcGlass.borders.accent,
          }}
        >
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-indigo-300" />
            <span style={{ fontSize: parcGlass.typography.fontSize.sm, color: 'hsla(245, 90%, 80%, 1)' }}>
              Linked to: <strong>{highlightedTeam}</strong>
            </span>
            <span style={{ fontSize: parcGlass.typography.fontSize.xs, color: 'hsla(245, 90%, 65%, 0.7)' }}>
              ({filteredDeals.length} deals)
            </span>
          </div>
          <button 
            onClick={() => setHighlightedTeam(null)}
            className="p-1 transition-colors hover:opacity-80"
            style={{ borderRadius: parcGlass.radius.full }}
            data-testid="button-clear-highlight"
          >
            <X className="w-4 h-4 text-indigo-300" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div 
          style={{
            ...glassStyles.card,
            padding: parcGlass.spacing.cardPadding,
          }}
        >
           <div style={{ fontSize: parcGlass.typography.fontSize.xs, color: 'hsla(0, 0%, 100%, 0.5)', letterSpacing: parcGlass.typography.letterSpacing.wider, marginBottom: parcGlass.spacing[1] }}>
             TOTAL VALUATION
           </div>
           <div className="flex items-baseline gap-2" style={{ fontSize: parcGlass.typography.fontSize['2xl'], fontWeight: 700 }}>
             ${payload.totalValue?.toLocaleString() || '0'}
             <span 
               className="flex items-center gap-0.5"
               style={{
                 fontSize: parcGlass.typography.fontSize.xs,
                 fontWeight: 400,
                 color: parcGlass.colors.accent.success,
              }}
             >
               <TrendingUp className="w-3 h-3" /> +12%
             </span>
           </div>
        </div>
        <div 
          style={{
            ...glassStyles.card,
            padding: parcGlass.spacing.cardPadding,
          }}
        >
           <div style={{ fontSize: parcGlass.typography.fontSize.xs, color: 'hsla(0, 0%, 100%, 0.5)', letterSpacing: parcGlass.typography.letterSpacing.wider, marginBottom: parcGlass.spacing.1 }}>
             ACTIVE DEALS
           </div>
           <div style={{ fontSize: parcGlass.typography.fontSize['2xl'], fontWeight: 700 }}>
             {highlightedTeam ? filteredDeals.length : (payload.deals || 0)}
           </div>
        </div>
      </div>

      <div 
        className="flex-1 overflow-hidden flex flex-col"
        style={{
          ...glassStyles.card,
          borderRadius: parcGlass.radius.lg,
        }}
      >
        <div 
          className="px-4 py-3 flex justify-between items-center"
          style={{
            borderBottom: parcGlass.borders.thin,
          }}
        >
            <span style={{ fontSize: parcGlass.typography.fontSize.sm, fontWeight: 500 }}>
              {highlightedTeam ? `${highlightedTeam} Athletes` : 'Recent Opportunities'}
            </span>
            <button 
              style={{
                fontSize: parcGlass.typography.fontSize.xs,
                color: parcGlass.colors.electricIndigo[300],
              }}
              className="hover:opacity-80"
            >
              View All
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {displayDeals.map((deal, i) => {
                const isHighlighted = highlightedTeam && deal.team.toLowerCase() === highlightedTeam.toLowerCase();
                return (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-3 transition-all group cursor-pointer"
                    style={{
                      borderRadius: parcGlass.radius.lg,
                      background: isHighlighted ? 'hsla(245, 90%, 65%, 0.15)' : 'transparent',
                      border: isHighlighted ? parcGlass.borders.accent : 'none',
                      boxShadow: isHighlighted ? parcGlass.shadows.bloom.indigo : 'none',
                    }}
                    data-testid={`nil-deal-${i}`}
                  >
                      <div className="flex items-center gap-3">
                          <div 
                            className="flex items-center justify-center"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: parcGlass.radius.full,
                              fontSize: parcGlass.typography.fontSize.xs,
                              fontWeight: 700,
                              background: isHighlighted 
                                ? 'linear-gradient(to top right, hsla(250, 72%, 48%, 1), hsla(252, 68%, 40%, 1))'
                                : 'linear-gradient(to top right, hsla(0, 0%, 40%, 1), hsla(0, 0%, 35%, 1))',
                            }}
                          >
                              {deal.brand[0]}
                          </div>
                          <div>
                              <div style={{ fontSize: parcGlass.typography.fontSize.sm, fontWeight: 500 }}>
                                {deal.brand}
                              </div>
                              <div style={{ fontSize: parcGlass.typography.fontSize.xs, color: 'hsla(0, 0%, 100%, 0.4)' }}>
                                {highlightedTeam ? deal.athlete : deal.type}
                              </div>
                          </div>
                      </div>
                      <div className="text-right">
                          <div style={{ fontSize: parcGlass.typography.fontSize.sm, fontFamily: parcGlass.typography.fontFamily.mono }}>
                            {deal.value}
                          </div>
                          <div 
                            style={{
                              fontSize: '10px',
                              paddingLeft: '6px',
                              paddingRight: '6px',
                              paddingTop: '2px',
                              paddingBottom: '2px',
                              borderRadius: parcGlass.radius.full,
                              display: 'inline-block',
                              marginTop: '4px',
                              background: deal.status === 'Signed' || deal.status === 'Active' 
                                ? 'hsla(142, 76%, 50%, 0.15)' 
                                : deal.status === 'Negotiating' 
                                ? 'hsla(45, 93%, 58%, 0.15)' 
                                : 'hsla(0, 0%, 100%, 0.08)',
                              color: deal.status === 'Signed' || deal.status === 'Active' 
                                ? parcGlass.colors.accent.success
                                : deal.status === 'Negotiating' 
                                ? parcGlass.colors.accent.warning
                                : 'hsla(0, 0%, 100%, 0.5)',
                            }}
                          >
                              {deal.status}
                          </div>
                      </div>
                  </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};
