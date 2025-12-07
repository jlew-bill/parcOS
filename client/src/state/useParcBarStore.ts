import { create } from "zustand";

interface ParcBarApp {
  id: string;
  name: string;
  icon: string;
}

interface ParcBarState {
  apps: ParcBarApp[];
}

export const useParcBarStore = create<ParcBarState>((set) => ({
  apps: [
    { id: "classroom", name: "Classroom", icon: "/icons/classroom.png" },
    { id: "creator", name: "Creator", icon: "/icons/creator.png" },
    { id: "sports", name: "Sports", icon: "/icons/sports.png" },
    { id: "board", name: "Board", icon: "/icons/board.png" },
  ],
}));
