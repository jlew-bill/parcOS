import { BillIntent } from "./types";
import { BillActions } from "./actions";

export function runOsAction(intent: BillIntent) {

  switch (intent.intent) {

    case "open_app":
      return BillActions.openApp(intent.target!);

    case "arrange_windows":
      if (intent.layout === "grid") return BillActions.arrangeGrid();
      if (intent.layout === "cascade") return BillActions.arrangeCascade();
      break;

    case "set_workspace":
      return BillActions.setWorkspace(intent.target!, intent.payload?.stack);

    case "focus_app":
      return BillActions.focusApp(intent.target!);

    default:
      return BillActions.unknown();
  }
}
