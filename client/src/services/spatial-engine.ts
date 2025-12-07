import type { ParcCard, Lane } from '../state/types';
import { computePriority, convertFromCMFKVector } from './cmfk-engine';

function assignLane(priority: number): Lane {
  if (priority > 0.7) {
    return "focus";
  } else if (priority > 0.4) {
    return "work";
  } else if (priority > 0.2) {
    return "archive";
  }
  return "background";
}

function getCardLane(card: ParcCard): Lane {
  const cmfk = convertFromCMFKVector(card.cmfk);
  const priority = computePriority(cmfk);
  return assignLane(priority);
}

interface LaneConfig {
  xMin: number;
  xMax: number;
  scale: number;
  opacity: number;
  zBase: number;
}

const LANE_CONFIGS: Record<Lane, LaneConfig> = {
  focus: { xMin: 0.05, xMax: 0.25, scale: 1.1, opacity: 1.0, zBase: 100 },
  work: { xMin: 0.30, xMax: 0.60, scale: 1.0, opacity: 1.0, zBase: 50 },
  archive: { xMin: 0.65, xMax: 0.85, scale: 0.85, opacity: 0.7, zBase: 20 },
  background: { xMin: 0.88, xMax: 0.98, scale: 0.6, opacity: 0.4, zBase: 1 }
};

function layoutCards(cards: ParcCard[]): ParcCard[] {
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
  
  const cardsByLane: Record<Lane, ParcCard[]> = {
    focus: [],
    work: [],
    archive: [],
    background: []
  };
  
  cards.forEach(card => {
    const lane = getCardLane(card);
    cardsByLane[lane].push(card);
  });
  
  const updatedCards: ParcCard[] = [];
  
  (Object.keys(cardsByLane) as Lane[]).forEach(lane => {
    const laneCards = cardsByLane[lane];
    const config = LANE_CONFIGS[lane];
    
    const laneStartX = windowWidth * config.xMin;
    const laneEndX = windowWidth * config.xMax;
    const laneWidth = laneEndX - laneStartX;
    
    const baseWidth = 400;
    const baseHeight = 400;
    const scaledWidth = baseWidth * config.scale;
    const scaledHeight = baseHeight * config.scale;
    
    const verticalOffset = 60;
    const startY = 80;
    
    laneCards.forEach((card, idx) => {
      const xOffset = (laneWidth - scaledWidth) / 2;
      const x = laneStartX + xOffset + (idx * 20);
      const y = startY + (idx * verticalOffset);
      
      const updatedCard: ParcCard = {
        ...card,
        position: {
          ...card.position,
          x,
          y,
          z: config.zBase + idx
        },
        size: {
          width: scaledWidth,
          height: scaledHeight
        },
        metadata: {
          ...card.metadata,
          laneOpacity: config.opacity,
          lane: lane
        }
      };
      
      updatedCards.push(updatedCard);
    });
  });
  
  return updatedCards;
}

export const spatialEngine = {
  assignLane,
  layoutCards,
  getCardLane,
  computePriority
};

export { assignLane, layoutCards, getCardLane };
