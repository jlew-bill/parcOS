export function parseParcTalk(input: string) {
  const text = input.trim().toLowerCase();

  if (text.startsWith("open ")) {
    const target = text.replace("open ", "").trim();
    return { intent: "open_app", target };
  }

  if (text.includes("grid")) {
    return { intent: "arrange_windows", layout: "grid" };
  }

  if (text.includes("cascade")) {
    return { intent: "arrange_windows", layout: "cascade" };
  }

  return { intent: "unknown" };
}
