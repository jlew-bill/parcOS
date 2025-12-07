import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize2, 
  Settings, ChevronDown, Tv, Trophy, Clock, Users,
  GripVertical, Lock, Zap
} from 'lucide-react';
import stripeConfig from '../../../config/stripe.auto.json';

interface StreamSource {
  id: string;
  name: string;
  category: string;
  url: string;
  thumbnail?: string;
}

const defaultStreams: StreamSource[] = [
  { id: 'yt-1', name: 'NFL RedZone Highlights', category: 'YouTube Live', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1' },
  { id: 'yt-2', name: 'NBA League Pass', category: 'YouTube Live', url: 'https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1&mute=1' },
  { id: 'tw-1', name: 'ESPN Sports', category: 'Twitch Sports', url: 'https://player.twitch.tv/?channel=espn&parent=localhost' },
  { id: 'ncaa-1', name: 'College GameDay', category: 'NCAA Streams', url: 'https://www.youtube.com/embed/bEW-cyRsZ5w?autoplay=1&mute=1' },
  { id: 'hl-1', name: 'Chiefs Highlights', category: 'Team Highlights', url: 'https://www.youtube.com/embed/5VcSwejU2D0?autoplay=1&mute=1' },
  { id: 'hl-2', name: 'Lakers Highlights', category: 'Team Highlights', url: 'https://www.youtube.com/embed/jNQXAC9IVRw?autoplay=1&mute=1' },
];

const streamCategories = ['YouTube Live', 'Twitch Sports', 'NCAA Streams', 'Team Highlights', 'Local Broadcaster', 'Custom URL'];

interface VideoWindowProps {
  id: 'A' | 'B';
  stream: StreamSource;
  onChangeStream: () => void;
  teamName: string;
  teamScore: string;
  onTeamNameChange: (name: string) => void;
  onTeamScoreChange: (score: string) => void;
  showOverlay: boolean;
}

const VideoWindow: React.FC<VideoWindowProps> = ({
  id,
  stream,
  onChangeStream,
  teamName,
  teamScore,
  onTeamNameChange,
  onTeamScoreChange,
  showOverlay
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="relative flex-1 min-w-[300px] bg-black/40 rounded-xl overflow-hidden border border-white/10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      data-testid={`video-window-${id}`}
    >
      {/* Sports Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600/50 border border-indigo-400/50 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-indigo-200" />
                </div>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => onTeamNameChange(e.target.value)}
                  placeholder="Team Name"
                  className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white placeholder-white/40 w-32"
                  data-testid={`input-team-name-${id}`}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={teamScore}
                  onChange={(e) => onTeamScoreChange(e.target.value)}
                  placeholder="0"
                  className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white text-center w-12 font-mono font-bold"
                  data-testid={`input-team-score-${id}`}
                />
                <div className="flex items-center gap-1 text-white/60 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>LIVE</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Frame */}
      <div className="w-full h-full min-h-[200px] aspect-video bg-gradient-to-br from-gray-900 to-black">
        <iframe
          src={stream.url}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          data-testid={`iframe-stream-${id}`}
        />
      </div>

      {/* Controls Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              data-testid={`button-play-${id}`}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
            </button>
            
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              data-testid={`button-mute-${id}`}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              data-testid={`slider-volume-${id}`}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onChangeStream}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/50 hover:bg-indigo-600/70 border border-indigo-400/30 text-xs font-medium text-white transition-colors"
              data-testid={`button-change-stream-${id}`}
            >
              <Tv className="w-3 h-3" />
              <span>Change</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              data-testid={`button-fullscreen-${id}`}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-white" /> : <Maximize className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>

        <div className="mt-2 text-xs text-white/60 truncate" data-testid={`text-stream-name-${id}`}>
          {stream.name} • {stream.category}
        </div>
      </motion.div>
    </motion.div>
  );
};

interface StreamSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (stream: StreamSource) => void;
  currentStream: StreamSource;
}

const StreamSelectorModal: React.FC<StreamSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentStream
}) => {
  const [customUrl, setCustomUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredStreams = selectedCategory
    ? defaultStreams.filter(s => s.category === selectedCategory)
    : defaultStreams;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      data-testid="modal-stream-selector"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/20 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Choose Stream</h3>
          <p className="text-sm text-white/60">Select a stream source for this window</p>
        </div>

        {/* Category Filter */}
        <div className="p-3 border-b border-white/10 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              !selectedCategory ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            data-testid="filter-all"
          >
            All
          </button>
          {streamCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              data-testid={`filter-${cat.toLowerCase().replace(/\s/g, '-')}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stream List */}
        <div className="max-h-64 overflow-y-auto p-3 space-y-2">
          {filteredStreams.map((stream) => (
            <button
              key={stream.id}
              onClick={() => {
                onSelect(stream);
                onClose();
              }}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                currentStream.id === stream.id
                  ? 'bg-indigo-600/30 border border-indigo-400/50'
                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
              }`}
              data-testid={`stream-option-${stream.id}`}
            >
              <div className="font-medium text-white text-sm">{stream.name}</div>
              <div className="text-xs text-white/50">{stream.category}</div>
            </button>
          ))}
        </div>

        {/* Custom URL */}
        <div className="p-4 border-t border-white/10">
          <label className="block text-xs font-medium text-white/70 mb-2">Custom URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder-white/40"
              data-testid="input-custom-url"
            />
            <button
              onClick={() => {
                if (customUrl) {
                  onSelect({
                    id: 'custom-' + Date.now(),
                    name: 'Custom Stream',
                    category: 'Custom URL',
                    url: customUrl
                  });
                  onClose();
                }
              }}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              data-testid="button-load-custom"
            >
              Load
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface ParcBarGateProps {
  onUnlock: () => void;
}

const ParcBarGate: React.FC<ParcBarGateProps> = ({ onUnlock }) => {
  const earlyAccess = stripeConfig.early_access;
  const athletePro = stripeConfig.athlete_pro;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center p-8 text-center"
      data-testid="parcbar-gate"
    >
      <div className="p-4 rounded-full bg-indigo-600/20 border border-indigo-500/30 mb-6">
        <Lock className="w-8 h-8 text-indigo-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">Unlock Sports Mode</h2>
      <p className="text-white/60 mb-8 max-w-md">
        Watch two games at once — available with Early Access or Pro tiers.
      </p>

      {/* Feature Preview */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <Tv className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
          <div className="text-xs text-white/80 font-medium">Dual-Stream</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <Users className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
          <div className="text-xs text-white/80 font-medium">Team Overlays</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <Trophy className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
          <div className="text-xs text-white/80 font-medium">Scoreboard</div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={earlyAccess?.paymentLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
          data-testid="button-gate-early-access"
        >
          <Zap className="w-4 h-4" />
          Get Early Access — $0.99
        </a>
        <a
          href={athletePro?.paymentLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition-colors"
          data-testid="button-gate-upgrade-pro"
        >
          Upgrade to Pro
        </a>
      </div>

      {/* Demo Button for Development */}
      <button
        onClick={onUnlock}
        className="mt-6 text-xs text-white/40 hover:text-white/60 underline transition-colors"
        data-testid="button-demo-unlock"
      >
        Demo Mode (Skip Gate)
      </button>
    </motion.div>
  );
};

export const ParcBar: React.FC<{ payload: any; cardId: string }> = ({ payload, cardId }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSplitView, setIsSplitView] = useState(true);
  const [showOverlays, setShowOverlays] = useState(true);
  const [streamA, setStreamA] = useState<StreamSource>(defaultStreams[0]);
  const [streamB, setStreamB] = useState<StreamSource>(defaultStreams[1]);
  const [selectorTarget, setSelectorTarget] = useState<'A' | 'B' | null>(null);
  const [dividerPosition, setDividerPosition] = useState(50);
  
  const [teamNameA, setTeamNameA] = useState('Team A');
  const [teamScoreA, setTeamScoreA] = useState('0');
  const [teamNameB, setTeamNameB] = useState('Team B');
  const [teamScoreB, setTeamScoreB] = useState('0');

  const handleDividerDrag = useCallback((e: React.MouseEvent) => {
    const container = e.currentTarget.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const handleMove = (moveEvent: MouseEvent) => {
      const newPos = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setDividerPosition(Math.max(20, Math.min(80, newPos)));
    };
    
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, []);

  if (!isUnlocked) {
    return <ParcBarGate onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="h-full flex flex-col text-white" data-testid="parcbar-app">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm">parcBar</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-xs text-white/60">Dual-Stream Sports Mode</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showOverlays ? 'bg-indigo-600/50 text-white' : 'bg-white/10 text-white/60'
            }`}
            data-testid="button-toggle-overlays"
          >
            Overlays
          </button>
          <button
            onClick={() => setIsSplitView(!isSplitView)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isSplitView ? 'bg-indigo-600/50 text-white' : 'bg-white/10 text-white/60'
            }`}
            data-testid="button-split-view"
          >
            Split View
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 flex relative p-3 gap-2 overflow-hidden">
        {isSplitView ? (
          <>
            <div style={{ width: `${dividerPosition}%` }} className="flex">
              <VideoWindow
                id="A"
                stream={streamA}
                onChangeStream={() => setSelectorTarget('A')}
                teamName={teamNameA}
                teamScore={teamScoreA}
                onTeamNameChange={setTeamNameA}
                onTeamScoreChange={setTeamScoreA}
                showOverlay={showOverlays}
              />
            </div>

            {/* Draggable Divider */}
            <div
              className="w-2 flex-shrink-0 cursor-col-resize flex items-center justify-center group"
              onMouseDown={handleDividerDrag}
              data-testid="divider"
            >
              <div className="w-1 h-12 rounded-full bg-white/20 group-hover:bg-indigo-500/50 transition-colors flex items-center justify-center">
                <GripVertical className="w-3 h-3 text-white/40 group-hover:text-white/80" />
              </div>
            </div>

            <div style={{ width: `${100 - dividerPosition}%` }} className="flex">
              <VideoWindow
                id="B"
                stream={streamB}
                onChangeStream={() => setSelectorTarget('B')}
                teamName={teamNameB}
                teamScore={teamScoreB}
                onTeamNameChange={setTeamNameB}
                onTeamScoreChange={setTeamScoreB}
                showOverlay={showOverlays}
              />
            </div>
          </>
        ) : (
          <VideoWindow
            id="A"
            stream={streamA}
            onChangeStream={() => setSelectorTarget('A')}
            teamName={teamNameA}
            teamScore={teamScoreA}
            onTeamNameChange={setTeamNameA}
            onTeamScoreChange={setTeamScoreA}
            showOverlay={showOverlays}
          />
        )}
      </div>

      {/* Stream Selector Modal */}
      <AnimatePresence>
        {selectorTarget && (
          <StreamSelectorModal
            isOpen={true}
            onClose={() => setSelectorTarget(null)}
            onSelect={(stream) => {
              if (selectorTarget === 'A') setStreamA(stream);
              else setStreamB(stream);
            }}
            currentStream={selectorTarget === 'A' ? streamA : streamB}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
