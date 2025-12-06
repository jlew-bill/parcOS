import React from 'react';
import { Activity, Users, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

export const NILDashboard: React.FC<{ payload: any }> = ({ payload }) => {
  return (
    <div className="p-6 h-full flex flex-col gap-6 text-white">
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
           <div className="text-2xl font-bold">{payload.deals || 0}</div>
        </div>
      </div>

      <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
            <span className="text-sm font-medium">Recent Opportunities</span>
            <button className="text-xs text-indigo-300 hover:text-indigo-200">View All</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {[
                { brand: 'Nike', type: 'Apparel', value: '$15k', status: 'Negotiating' },
                { brand: 'Gatorade', type: 'Beverage', value: '$8k', status: 'Signed' },
                { brand: 'Local Ford', type: 'Auto', value: '$12k', status: 'Pending' },
                { brand: 'Chipotle', type: 'Food', value: '$500/mo', status: 'Active' },
            ].map((deal, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold">
                            {deal.brand[0]}
                        </div>
                        <div>
                            <div className="text-sm font-medium">{deal.brand}</div>
                            <div className="text-xs text-white/40">{deal.type}</div>
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
            ))}
        </div>
      </div>
    </div>
  );
};
