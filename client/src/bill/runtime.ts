import { parseParcTalk } from "@/parcTalk/interpreter";
import { callBillIntent } from "./apiClient";
import { runOsAction } from "./intentMapper";
import { useParcOSStore } from "@/state/store";
import { BillIntent } from "./types";

export async function runBill(command: string) {

  // 1. Check local parcTalk rules first
  const localIntent: BillIntent = parseParcTalk(command);

  if (localIntent.intent !== "unknown") {
    runOsAction(localIntent);
    return localIntent;
  }

  // 2. Fetch OS state to pass to BILL
  const osState = useParcOSStore.getState();

  // 3. Ask BILL (Gemini API)
  const billIntent = await callBillIntent(command, osState);

  // 4. Execute BILL's interpreted action
  runOsAction(billIntent);

  return billIntent;
}
