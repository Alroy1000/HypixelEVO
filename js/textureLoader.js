// textureLoader.js - Handles texture loading with repository priority

// Texture-Konfiguration
const TEXTURE_REPOS = [
    // Korrigierter Branch und Pfad
    'https://raw.githubusercontent.com/Faithful-Pack/Default-Java/java-latest/assets/minecraft/textures/item',
    'https://raw.githubusercontent.com/Faithful-Pack/Default-Java/java-latest/assets/minecraft/textures/block',
    'https://raw.githubusercontent.com/furfsky/Reborn/main/catharsis/item_item/assets/item_item/textures/item',
];
const FALLBACK = './assets/textures/fallback.jpg';

function _normalizeRepoBase(repoBase) {
    let normalized = repoBase.trim();
    // Wenn schon raw.githubusercontent.com, nichts tun
    if (normalized.includes('raw.githubusercontent.com')) {
        return normalized;
    }
    // Sonst normalisieren
    if (normalized.startsWith('https://github.com/')) {
        normalized = normalized.replace('https://github.com/', 'https://raw.githubusercontent.com/');
    }
    if (normalized.startsWith('http://github.com/')) {
        normalized = normalized.replace('http://github.com/', 'https://raw.githubusercontent.com/');
    }
    if (normalized.startsWith('https://raw.github.com/')) {
        normalized = normalized.replace('https://raw.github.com/', 'https://raw.githubusercontent.com/');
    }
    normalized = normalized.replace('/blob/', '/raw/');
    normalized = normalized.replace('/tree/', '/raw/');
    // Entfernen von doppelten Slashes (außer dem Protokollteil)
    normalized = normalized.replace(/([^:]\/\/)+/g, '$1');
    if (normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
    }
    return normalized;
}

// Hilfsfunktion: prüft, ob eine Remote-Datei existiert (nicht mehr verwendet, aber für zukünftige Zwecke behalten)
async function _checkRemoteTexture(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
            console.debug(`Texture OK (HEAD): ${url}`);
            return true;
        }
        console.debug(`Texture HEAD nicht OK (${response.status}): ${url}`);

        // HEAD kann bei GitHub-CORS oder Raw-Pfaden abgelehnt werden. Fallback auf GET.
        const responseGet = await fetch(url, { method: 'GET' });
        if (responseGet.ok) {
            console.debug(`Texture OK (GET): ${url}`);
            return true;
        }
        console.debug(`Texture GET nicht OK (${responseGet.status}): ${url}`);
        return false;
    } catch (error) {
        console.warn(`Texture check failed für ${url}:`, error);
        return false;
    }
}

// Funktion zum Laden von Texturen mit Priorität (Repos -> Fallback)
export function setTextureWithFallback(iconElement, itemId, textureFileName) {
    console.log(`setTextureWithFallback aufgerufen für itemId: ${itemId}`);
    console.log(`textureFileName: ${textureFileName}`);

    async function tryLoadTexture() {
        for (const repoBase of TEXTURE_REPOS) {
            const normalizedBase = _normalizeRepoBase(repoBase);
            const candidate = `${normalizedBase}/${textureFileName}.png`;
            console.debug(`Versuche Repository-Texture: ${candidate}`);

            try {
                await new Promise((resolve, reject) => {
                    iconElement.onload = () => {
                        console.info(`Texture erfolgreich geladen: ${candidate}`);
                        resolve();
                    };
                    iconElement.onerror = reject;
                    iconElement.src = candidate;
                });
                return; // Erfolgreich geladen, beende
            } catch (error) {
                console.debug(`Texture fehlgeschlagen: ${candidate}`, error);
                // Nächstes Repo versuchen
            }
        }

        // Alle Repos fehlgeschlagen, Fallback verwenden
        console.warn(`Keine Repo-Texture gefunden, verwende Fallback für ${textureFileName}`);
        iconElement.src = FALLBACK;
    }

    tryLoadTexture();
}