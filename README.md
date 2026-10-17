# steam-mcp

[![Soutenir sur Ko-fi](https://img.shields.io/badge/Ko--fi-Soutenir%20le%20projet-FF5E5B?logo=ko-fi&logoColor=white)](https://ko-fi.com/pierrobn)

Serveur MCP en lecture seule pour consulter les profils, bibliothèques, succès et informations de jeux Steam. Dérivé communautaire de [matheusslg/steam-mcp](https://github.com/matheusslg/steam-mcp), sous licence MIT ; les attributions d'origine sont conservées.

## Installation

Prérequis : **Node.js 20 ou plus récent**, npm et une clé Steam Web API.

```sh
git clone https://github.com/pierro-bn/steam-mcp.git
cd steam-mcp
npm ci
npm run build
```

Configurez le client MCP pour lancer `node` avec le chemin absolu de `dist/index.js`. Le serveur communique sur **stdio** et attend les messages du client ; il ne fournit pas de page web.

| Variable | Utilisation |
| --- | --- |
| `STEAM_API_KEY` | Clé API à définir dans l'environnement privé du serveur |
| `STEAM_ID` | Steam ID 64 bits facultatif, utilisé quand l'appel ne fournit pas `steam_id` |

## Fonctionnalités et limites

- Bibliothèque et activité : `get_owned_games`, `get_recently_played_games`, `get_wishlist`.
- Catalogue : `search_apps`, `get_featured_games`, `get_game_details`, `get_game_news`, `get_game_reviews`, `get_player_count`.
- Profil, niveau, badges, amis, groupes et succès.

`get_owned_games` retourne 50 jeux par défaut et au maximum 500 par appel, sans paramètre de pagination. Comparez `showing` à `total_games` : une réponse tronquée ne permet pas de conclure qu'un jeu absent n'est pas possédé. Les données accessibles dépendent aussi de la confidentialité du profil.

Exemple : « Consulte mes jeux les plus joués et propose des jeux à découvrir. »

## Développement

```sh
npm test
```

Cette commande reconstruit le serveur puis exécute les tests. Les tests ne valident pas l'accès à un compte Steam réel.

## Confidentialité

Ne commitez pas vos clés, jetons, fichiers de session ou exports personnels. Les outils peuvent renvoyer des données du compte connecté au client MCP ; vérifiez ces résultats avant de les partager.

## Changes in this derivative

Network errors omit URLs and untrusted HTTP status text. The clean/build command works on Windows, macOS and Linux. Dependencies were refreshed and regression tests cover credential-safe errors.

Cette version est distribuée sous forme de sources sur GitHub, sans publication npm ou PyPI.

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

Un [fichier exemple](examples/claude_desktop_config.example.json) est fourni. Remplace les chemins génériques et les valeurs `REPLACE_…` uniquement dans ta configuration privée. Sous macOS/Linux, adapte le chemin absolu vers `dist/index.js`. Utilise le chemin absolu de Node si le client ne le trouve pas. Aucun terminal interactif ne doit être nécessaire au démarrage. Redémarre Claude après modification.

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

Références : [Claude local](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop), [Claude Code MCP](https://code.claude.com/docs/en/mcp), [connecteurs Claude distants](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp). Voir ces guides pour les réglages propres à chaque client.

## Soutenir le projet

Si ce serveur MCP vous est utile, vous pouvez soutenir son développement et sa maintenance avec un don facultatif sur [Ko-fi](https://ko-fi.com/pierrobn). Merci pour votre soutien !

