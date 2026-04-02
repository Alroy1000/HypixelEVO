import { getJsonData, normalizeSacks, normalizeItemName, getTextureFileName, getBaseItemId, isEnchantedItem } from './utility.js';  // Richtiges Importieren!

const container = document.getElementById("sacksContainer");
const template = document.getElementById("sackTemplate");

// Texture-Konfiguration
const BASEDIR = './assets/textures';
const TEXTURE_PRIORITY = ['Sortex', 'FurfeSky', 'Default'];
const FALLBACK = './assets/textures/fallback.jpg';

// Funktion zum Laden von Texturen mit Priorität
function setTextureWithFallback(iconElement, itemId) {
    let textureIndex = 0;
    
    // Hole den korrekten Dateinamen für die Item-ID
    const textureFileName = getTextureFileName(itemId);
    
    function tryNextTexture() {
        if (textureIndex < TEXTURE_PRIORITY.length) {
            const texturePath = `${BASEDIR}/${TEXTURE_PRIORITY[textureIndex]}/${textureFileName}.png`;
            iconElement.src = texturePath;
            textureIndex++;
        } else {
            iconElement.src = FALLBACK;
        }
    }
    
    tryNextTexture();
    iconElement.onerror = tryNextTexture;
}

async function loadAndRenderSacks() {
    try {
        const profileData = await getJsonData();  // Holt die JSON-Daten
        if (!profileData) {
            console.error("Fehler beim Laden der Daten!");
            return;
        }

        // Normalisiert die Sacks-Daten
        const normalizedData = normalizeSacks(profileData);

        // Wandelt das normalisierte Objekt in ein Array um, um es rendern zu können
        const sacksArray = Object.entries(normalizedData).map(([itemName, playersData]) => {
            return {
                name: itemName,
                items: playersData,
            };
        });

        // Rendert die Sacks
        renderSacks(sacksArray);
    } catch (error) {
        console.error("Fehler beim Verarbeiten der Daten:", error);
    }
}

function createSackElement(sackData) {
    
    const clone = template.content.cloneNode(true);

    const icon = clone.querySelector(".Itemicon");
    const title = clone.querySelector(".Itemname");
    const amount = clone.querySelector(".Itemamount");

    // Basis-ID für Enchanted-Items bestimmen
    const baseItemId = getBaseItemId(sackData.name);

    // Itemname aus der Basis-ID generieren, dann bei Enchanted prefix dran
    let finalName = normalizeItemName(baseItemId);
    if (isEnchantedItem(sackData.name)) {
        finalName = `Enchanted ${finalName}`;
    }
    title.textContent = finalName;

    // Hier kannst du die Anzahl der Items pro Spieler einfügen
    const totalItems = Object.values(sackData.items).reduce((sum, playerData) => sum + playerData.amount, 0);
    amount.textContent = `${totalItems.toLocaleString()}`;

    // Special: ENCHANTED_ Items bekommen Glint-Effekt auf Icon-Wrapper
    const iconWrapper = clone.querySelector('.Itemicon-wrapper');
    if (iconWrapper) {
        if (isEnchantedItem(sackData.name)) {
            iconWrapper.classList.add('enchanted');
        } else {
            iconWrapper.classList.remove('enchanted');
        }
    }

    // Textur mit Priorität laden (ENCHANTED_ Items anhand Basis-ID)
    const loadItemId = getBaseItemId(sackData.name);
    setTextureWithFallback(icon, loadItemId);
    
    return clone;
}

function renderSacks(sacksArray) {
    container.innerHTML = ""; // Reset der Container-Inhalte

    sacksArray.forEach(sack => {
        const element = createSackElement(sack);
        container.appendChild(element);
    });
}

// Starte das Laden und Rendern der Sacks
loadAndRenderSacks();