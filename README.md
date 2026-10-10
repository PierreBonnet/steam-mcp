# steam-mcp

Community derivative of [matheusslg/steam-mcp](https://github.com/matheusslg/steam-mcp), prepared for public source distribution. The upstream MIT license and required attribution are retained. This repository starts with a fresh Git history.

## Install and run

Requires Node.js 20 or later.

```sh
npm ci
npm run build
npm test
```

Set `STEAM_API_KEY` in your MCP client environment. Optionally set `STEAM_ID` to your own Steam ID. Configure the client command as `node` with the absolute path to `dist/index.js` as its argument. Keep these values in your local client configuration.

## Privacy

No account configuration, OAuth sessions, personal exports, or local Git history are distributed. Examples and tests use fixtures. Never commit your local credentials or session files. Runtime tools can return information from the account you connect; review outputs before sharing them.

## Changes in this derivative

Network errors omit URLs and untrusted HTTP status text. The clean/build command works on Windows, macOS and Linux. Dependencies were refreshed and regression tests cover credential-safe errors.

Only GitHub source distribution is configured; this derivative is not published to npm or PyPI.

## Claude et ChatGPT

| Client | Connexion proposée |
| --- | --- |
| Claude Desktop | Serveur local MCP sur stdio, configuration ci-dessous |
| Claude Code | Même commande locale, via `claude mcp add` |
| ChatGPT | Serveur local relié par Secure MCP Tunnel, sous réserve d'accès à cette fonction |
| Claude web / mobile | Non fourni ici : exige un serveur MCP distant accessible en HTTPS |

Le dépôt GitHub contient le code, pas un endpoint MCP hébergé. Les tests vérifient l'initialisation et la découverte des outils sur stdio ; ils ne constituent pas une connexion réelle à ton compte Claude ou ChatGPT.

### Claude Desktop

Installe d'abord le projet avec les commandes ci-dessus. Ouvre la configuration MCP de Claude Desktop (`claude_desktop_config.json`) et fusionne cette entrée avec tes serveurs existants :

```json
{
  "mcpServers": {
    "steam-mcp": {
      "command": "node",
      "args": [
        "C:/mcp/steam-mcp/dist/index.js"
      ],
      "env": {
        "STEAM_API_KEY": "REPLACE_LOCALLY",
        "STEAM_ID": "REPLACE_WITH_YOUR_STEAM_ID"
      }
    }
  }
}
```

Un [fichier exemple](examples/claude_desktop_config.example.json) est fourni. Remplace les chemins génériques et les valeurs `REPLACE_…` uniquement dans ta configuration privée. Sous macOS/Linux, utilise le chemin absolu du dépôt et `.venv/bin/python` à la place de `.venv/Scripts/python.exe`. Pour Steam, utilise le chemin absolu de Node si Claude ne le trouve pas. Aucun terminal interactif ne doit être nécessaire au démarrage. Redémarre Claude après modification.

### Claude Code

Après avoir défini les mêmes variables d'environnement dans ton terminal, enregistre la commande avec une portée utilisateur :

```sh
claude mcp add --transport stdio --scope user steam-mcp -- "node" "C:/mcp/steam-mcp/dist/index.js"
```

Adapte les chemins à ton système ; consulte `claude mcp list`, puis `/mcp` dans Claude Code pour vérifier la connexion. Les secrets du terminal doivent être disponibles lors des lancements suivants ; une configuration d'environnement privée persistante peut être nécessaire.

### ChatGPT — tunnel privé

Installe [tunnel-client](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels), crée un tunnel autorisé pour ton espace et définis localement `CONTROL_PLANE_API_KEY`, ainsi que les variables du serveur.

```sh
tunnel-client init --sample sample_mcp_stdio_local --profile steam-mcp --tunnel-id REPLACE_WITH_TUNNEL_ID --mcp-command "node C:/mcp/steam-mcp/dist/index.js"
tunnel-client doctor --profile steam-mcp --explain
tunnel-client run --profile steam-mcp
```

Garde ce processus ouvert. Dans ChatGPT : **Plugins → Ajouter un serveur MCP personnalisé → Tunnel**, sélectionne ce tunnel, puis installe le plugin. Ce serveur local ne fournit pas OAuth côté MCP : choisis « Sans authentification » pour cette connexion privée protégée par les droits du tunnel. L'authentification du service reste locale. L'accès dépend des permissions de ton organisation/espace. [Guide officiel](https://developers.openai.com/api/docs/guides/custom-mcp-server).

Les commandes ci-dessus supposent des chemins sans espaces pour la commande encapsulée par le tunnel. Adapte-les ou configure le lancement selon l'aide de `tunnel-client`. Sous macOS/Linux, conserve `node` et adapte le chemin vers `dist/index.js`. Le tunnel donne accès au compte configuré sur cette machine : réserve-le à ton espace de confiance. Il ne transforme pas ce serveur personnel en service multi-utilisateur.

### Session et authentification

Renseigne ta clé Steam Web API et ton Steam ID dans la configuration locale. Steam ne crée pas de session OAuth.

### Vérification et dépannage

Essaie : « Demande la liste de mes jeux Steam. » Les résultats des outils et ressources peuvent contenir des données de ton compte ; le client qui les consulte les reçoit. Si le serveur ne démarre pas, vérifie les chemins absolus, l'installation des dépendances et les variables d'environnement. Si ChatGPT ne propose pas ton tunnel, vérifie ses droits et son rattachement à l'espace. Ne renseigne pas l'URL GitHub comme URL de serveur MCP.

Références : [Claude local](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop), [Claude Code MCP](https://code.claude.com/docs/en/mcp), [connecteurs Claude distants](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp). Documentation vérifiée le 10 octobre 2026.
