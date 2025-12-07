import React from 'react';
import { TrendingUp, Link2, X } from 'lucide-react';
import { useParcOSStore } from '@/state/store';

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
    <div className="p-6 h-full flex flex-col gap-6 text-white">
      {highlightedTeam && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 animate-pulse">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-indigo-300" />
            <span className="text-sm text-indigo-200">Linked to: <strong>{highlightedTeam}</strong></span>
            <span className="text-xs text-indigo-300/70">({filteredDeals.length} deals)</span>
          </div>
          <button 
            onClick={() => setHighlightedTeam(null)}
            className="p-1 hover:bg-indigo-500/30 rounded-full transition-colors"
            data-testid="button-clear-highlight"
          >
            <X className="w-4 h-4 text-indigo-300" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
           <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Total Valuation</div>
           <div className="text-2xl font-bold flex items-baseline gap-2">
             ${payload.totalValue?.toLocaleString() || '0'}
             <span className="text-xs font-normal text-green-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +12%</span>
           </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
           <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Active Deals</div>
           <div className="text-2xl font-bold">{highlightedTeam ? filteredDeals.length : (payload.deals || 0)}</div>
        </div>
      </div>

      <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
            <span className="text-sm font-medium">
              {highlightedTeam ? `${highlightedTeam} Athletes` : 'Recent Opportunities'}
            </span>
            <button className="text-xs text-indigo-300 hover:text-indigo-200">View All</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {displayDeals.map((deal, i) => {
                const isHighlighted = highlightedTeam && deal.team.toLowerCase() === highlightedTeam.toLowerCase();
                return (
                  <div 
                    key={i} 
                    className={`flex items-center justify-between p-3 rounded-xl transition-all group cursor-pointer ${
                      isHighlighted 
                        ? 'bg-indigo-500/20 ring-2 ring-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                        : 'hover:bg-white/5'
                    }`}
                    data-testid={`nil-deal-${i}`}
                  >
                      <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isHighlighted 
                              ? 'bg-gradient-to-tr from-indigo-600 to-purple-600' 
                              : 'bg-gradient-to-tr from-gray-700 to-gray-600'
                          }`}>
                              {deal.brand[0]}
                          </div>
                          <div>
                              <div className="text-sm font-medium">{deal.brand}</div>
                              <div className="text-xs text-white/40">
                                {highlightedTeam ? deal.athlete : deal.type}
                              </div>
                          </div>
                      </div>
                      <div className="text-right">
                          <div className="text-sm font-mono">{deal.value}</div>
                          <div className={`text-[10px] px-1.5 py-0.5 rounded-full inline-block mt-1 ${
                              deal.status === 'Signed' || deal.status === 'Active' ? 'bg-green-500/20 text-green-300' : 
                              deal.status === 'Negotiating' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-white/10 text-white/50'
                          }`}>
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
