import React, { useState } from 'react';
import { Globe, RefreshCw, ArrowLeft, ArrowRight, Lock, Search } from 'lucide-react';

export const GenericBrowserCard: React.FC<{ payload: any }> = ({ payload }) => {
  const [url, setUrl] = useState(payload.url || 'https://en.wikipedia.org/wiki/HyperCard');
  
  return (
    <div className="flex flex-col h-full text-white bg-white/5">
      {/* Browser Toolbar */}
      <div className="h-12 flex items-center gap-3 px-3 border-b border-white/10 bg-white/5 shrink-0">
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 border border-white/5 text-sm text-white/80">
          <Lock className="w-3 h-3 text-green-400" />
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-white/70"
          />
        </div>
      </div>
      
      {/* Content Area - Mocked */}
      <div className="flex-1 overflow-y-auto p-6 relative custom-scrollbar bg-white">
        <div className="max-w-2xl mx-auto text-black">
           <h1 className="text-3xl font-serif font-bold mb-4 border-b pb-4">HyperCard</h1>
           <p className="text-sm leading-relaxed text-gray-800 mb-4 font-serif">
             HyperCard is a software application and development kit for Apple Macintosh and Apple IIGS computers. It was among the first successful hypermedia systems before the World Wide Web.
           </p>
           <p className="text-sm leading-relaxed text-gray-800 mb-4 font-serif">
             HyperCard combines database capabilities with a graphical, flexible, user-modifiable interface. It also features HyperTalk, an innovative scripting language.
           </p>
           
           <div className="my-6 p-4 bg-blue-50 border-l-4 border-blue-500">
             <h3 className="font-bold text-blue-900 mb-1">Legacy</h3>
             <p className="text-sm text-blue-800">HyperCard influenced the development of the web, Wiki, and many other multimedia authoring tools.</p>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">Image: Original Stack</div>
              <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">Image: Bill Atkinson</div>
           </div>
        </div>
      </div>
    </div>
  );
};
