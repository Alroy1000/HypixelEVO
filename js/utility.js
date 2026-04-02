// Mapping von Hypixel Item-IDs zu Minecraft Textur-Dateinamen
const idToTextureMapping = {
    "INK_SACK:4": "lapis_lazuli",
    "INK_SACK:3": "cocoa_beans",
    "INK_SACK:2": "green_dye",
    "HARD_STONE": "deepslate",
    "MITHRIL_ORE": "mithril",
    "COBBLESTONE": "cobblestone",
    "WOOL": "white_wool",
    "COAL": "coal",
    "GOLD": "gold_ingot",
    "ENDSTONE": "end_stone",
    "ENDER_STONE": "end_stone",
    "RAW_RABBIT": "rabbit",
    "RAW_CHICKEN": "chicken",
    "RAW_BEEF": "beef",
    "PORK": "porkchop",
    "SULPHUR": "Sulphur",
    "LOG:2": "birch_log",
    "LOG": "oak_log",
    "LOG:1": "spruce_log",
    "LOG_2:1": "acacia_log",
    "LOG_2": "dark_oak_log",
    "LOG:3": "jungle_log",
    "FIG_LOG": "Fig_log",
    "LUSHLILAC": "lushlilac",
    "SEA_LUMIES": "sea_pickle",
    "TENDER_WOOD": "tender",
    "INK_SACK": "ink_sac",
    "WATER_LILY": "lily_pad",
    "CLAY_BLOCK": "clay",
    "POTATO_ITEM": "potato",
    "CARROT_ITEM": "carrot",
    "SEEDS": "wheat_seeds",
    "NETHER_STALK": "nether_wart",
    "IRON": "iron_ingot",
    "TITANIUM": "titanium_ore",
    "MYCEL": "mycelium",
    "CACTUS_GREEN": "green_dye",
    "SAND:1": "red_sand",
    "SUPER_EGG": "super_enchanted_egg",
    "ICE_HUNK": "hunk_of_ice",
    "MELON": "melon_slice",
    "BLUE_ICE_HUNK": "hunk_of_blue_ice",
    "QUARTZ_BLOCK": "quartz_block_side",
    "GLOSSY_GEMSTONE": "glossy_gemstone",
    "LAPIS_LAZULI_BLOCK": "lapis_block",
    "HAY_BALE": "hey_block_side",
    "HEY_BLOCK":"hey_block_side",
    "CACTUS": "cactus_side",
    "COCOA":"cocoa_beans",
};

const idNameMapping = {
    "INK_SACK:4": "Lapis lazuli",
    "INK_SACK:3": "Coco Bean",
    "INK_SACK:2": "Cactus Green",
    // Weitere Mappings hier hinzufügen
};

export function getJsonData() {
    return fetch('./Profile_0204260829.json')
        .then(response => response.json())
        .catch(error => {
            console.error(error);
            return null;  // Optional: Gib null zurück, wenn ein Fehler auftritt.
        });
}

export function normalizeSacks(profileData) {
    const result = {};

    const members = profileData?.profile?.members;
    if (!members) return result;

    Object.entries(members).forEach(([playerId, memberData]) => {
        const sacks = memberData?.inventory?.sacks_counts;
        if (!sacks) return;

        Object.entries(sacks).forEach(([itemName, itemData]) => {
            const amount = itemData ?? 0;

            // Item Ebene erstellen falls nicht vorhanden
            if (!result[itemName]) {
                result[itemName] = {};
            }

            // Player Ebene
            result[itemName][playerId] = {
                amount: amount
            };
        });
    });

    return result;
}

export function normalizeItemName(itemId) {
    // Prüfe, ob die ID im Mapping existiert
    let itemName = idNameMapping[itemId] || itemId;  // Falls kein Mapping vorhanden, gebe die ID zurück (Fallback)
    
    // Ersetze alle Unterstriche durch Leerzeichen
    itemName = itemName.replace(/_/g, ' ');

    // Umwandlung in UpperCamelCase (UpperLowercase)
    itemName = itemName
        .toLowerCase()
        .replace(/(?:^|\s)\w/g, (match) => match.toUpperCase());  // Jedes Wort mit einem Großbuchstaben beginnen

    return itemName;
}

// Neue Funktion: Item-ID zu Textur-Dateinamen
export function getTextureFileName(itemId) {
    // Für ENCHANTED_ Items => Basis-ID nutzen
    const baseItemId = getBaseItemId(itemId);

    // Spezielles Handling für Gems/Gemstones
    if (isGemItem(baseItemId)) {
        return getGemstoneTexture(baseItemId);
    }

    if (idToTextureMapping[baseItemId]) {
        return idToTextureMapping[baseItemId];
    }

    // Fallback: Konvertiere Item-ID zu Textur-Dateinamen
    return baseItemId.toLowerCase().replace(/:/g, '_');
}

// Extrahiert Basis-ID bei ENCHANTED_ Items
export function getBaseItemId(itemId) {
    if (typeof itemId !== 'string') return itemId;
    if (itemId.startsWith('ENCHANTED_')) {
        return itemId.replace(/^ENCHANTED_/, '');
    }
    return itemId;
}

// Prüfen, ob Item enchanted ist
export function isEnchantedItem(itemId) {
    return typeof itemId === 'string' && itemId.startsWith('ENCHANTED_');
}

// Spezielles Mapping für Gems zu Gemstones
const gemToGemstoneMapping = {
    "RUBY": "ruby",
    "SAPPHIRE": "sapphire",
    "AMETHYST": "amethyst",
    "JADE": "jade",
    "AMBER": "amber",
    "TOPAZ": "topaz",
    "JASPER": "jasper",
    "OPAL": "opal",
    "AQUAMARINE": "aquamarine",
    "CITRINE": "citrine",
    "ONYX": "onyx",
    "PERIDOT": "peridot",
    
};

// Neue Funktion: Gem zu Gemstone-Textur
export function getGemstoneTexture(gemId) {
    if (typeof gemId !== 'string') return gemId;

    // Prüfe direktes Mapping
    if (gemToGemstoneMapping[gemId]) {
        return gemToGemstoneMapping[gemId];
    }

    // Einfache Transformation: GEM -> GEMSTONE
    if (gemId.endsWith('_GEM')) {
        return gemId.replace(/_GEM$/, '_GEMSTONE');
    }

    // Fallback: lowercase und _ durch - ersetzen
    return gemId.toLowerCase().replace(/_/g, '-');
}

// Prüfen, ob Item ein Gem/Gemstone ist
export function isGemItem(itemId) {
    if (typeof itemId !== 'string') return false;

    // Prüfe, ob im Gemstone-Mapping vorhanden
    if (gemToGemstoneMapping[itemId]) return true;

    // Prüfe auf bekannte Gem-Patterns
    const gemPatterns = ['GEM', 'GEMSTONE', 'ROUGH_', 'FLAWED_', 'FINE_', 'FLAWLESS_'];
    return gemPatterns.some(pattern => itemId.includes(pattern));
}