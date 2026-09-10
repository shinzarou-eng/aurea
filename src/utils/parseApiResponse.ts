export async function parseApiResponse(res: Response): Promise<any> {
  const text = await res.text();
  const trimmed = text.trim();
  if (trimmed.startsWith("<") || trimmed.startsWith("<!DOCTYPE")) {
    throw new Error(
      "Le serveur d'analyse n'est pas accessible. Cette version en ligne (GitHub Pages) est statique. Pour utiliser l'analyse, lancez l'application en local avec `npm run dev` ou déployez l'API (server.ts)."
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Réponse invalide du serveur d'analyse.");
  }
}
