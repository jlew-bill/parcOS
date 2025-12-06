import React from 'react';
import { BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const ClassroomBoard: React.FC<{ payload: any }> = ({ payload }) => {
  return (
    <div className="h-full p-6 text-white flex flex-col gap-6">
      <div className="flex items-center justify-between">
         <h2 className="text-lg font-semibold">Physics 101: Mechanics</h2>
         <span className="px-2 py-1 rounded-md bg-white/10 text-xs font-mono">Week 4</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 flex items-start gap-4">
              <div className="mt-1 p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
                  <BookOpen className="w-5 h-5" />
              </div>
              <div>
                  <h4 className="font-medium text-indigo-100">Current Topic: Newton's 2nd Law</h4>
                  <p className="text-sm text-white/60 mt-1">Understanding F=ma through real-world examples.</p>
                  <div className="mt-3 w-full bg-black/30 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-full w-[65%] rounded-full" />
                  </div>
                  <div className="text-[10px] text-white/40 mt-1 text-right">65% Mastery</div>
              </div>
          </div>
      </div>

      <div className="space-y-3">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Assignments</h3>
          {[
              { title: 'Force Vectors Worksheet', due: 'Tomorrow', status: 'pending' },
              { title: 'Lab Report: Free Fall', due: 'Friday', status: 'pending' },
              { title: 'Quiz: Kinematics', due: 'Completed', status: 'done' },
          ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                  {item.status === 'done' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                  )}
                  <div className="flex-1">
                      <div className="text-sm font-medium {item.status === 'done' ? 'line-through text-white/40' : ''}">{item.title}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-md ${item.due === 'Tomorrow' ? 'bg-red-500/20 text-red-300' : 'bg-white/5 text-white/40'}`}>
                      {item.due}
                  </div>
              </div>
          ))}
      </div>
      
      <div className="mt-auto p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3 items-center">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <div className="text-xs text-yellow-200/80">
              <strong>Misconception Alert:</strong> You seemed unsure about "Normal Force" in the last quiz. Review Card #402.
          </div>
      </div>
    </div>
  );
};
