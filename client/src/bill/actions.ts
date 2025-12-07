import { useWindowStore } from "@/state/windowStore";
import { useParcOSStore } from "@/state/store";

export const BillActions = {
  openApp: (appId: string) => {
    const wm = useWindowStore.getState();
    wm.openWindow(appId);
  },

  arrangeGrid: () => {
    const wm = useWindowStore.getState();
    wm.arrangeGrid();
  },

  arrangeCascade: () => {
    const wm = useWindowStore.getState();
    wm.arrangeCascade();
  },

  setWorkspace: (workspace: string, stack?: string) => {
    const os = useParcOSStore.getState();
    os.setActiveWorkspace(workspace, stack || workspace.toLowerCase());
  },

  focusApp: (appId: string) => {
    const wm = useWindowStore.getState();
    wm.focusWindow(appId);
  },

  unknown: () => {
    console.warn("BILL: Intent unknown");
  }
};
