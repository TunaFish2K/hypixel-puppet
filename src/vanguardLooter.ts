const LOOT_TABLE = [
    { name: "☠ Flawless Onyx Gemstone", count: 1, weight: 80 },
    { name: "☘ Flawless Peridot Gemstone", count: 1, weight: 80 },
    { name: "☘ Flawless Citrine Gemstone", count: 1, weight: 80 },
    { name: "☂ Flawless Aquamarine Gemstone", count: 1, weight: 80 },
    { name: "☠ Fine Onyx Gemstone", count: 160, weight: 40 },
    { name: "☘ Fine Peridot Gemstone", count: 160, weight: 40 },
    { name: "☘ Fine Citrine Gemstone", count: 160, weight: 40 },
    { name: "☂ Fine Aquamarine Gemstone", count: 160, weight: 40 },
    { name: "Blue Goblin Egg", count: 2, weight: 140 },
    { name: "Blue Goblin Egg", count: 4, weight: 70 },
    { name: "Suspicious Scrap", count: 4, weight: 150 },
    { name: "Umber Key", count: 1, weight: 100 },
    { name: "Umber Key", count: 2, weight: 50 },
    { name: "Umber Key", count: 4, weight: 10 },
    { name: "Tungsten Key", count: 1, weight: 100 },
    { name: "Tungsten Key", count: 2, weight: 50 },
    { name: "Tungsten Key", count: 4, weight: 10 },
    { name: "Refined Mithril", count: 2, weight: 60 },
    { name: "Refined Titanium", count: 2, weight: 60 },
    { name: "Refined Umber", count: 2, weight: 80 },
    { name: "Refined Tungsten", count: 2, weight: 80 },
    { name: "Shattered Locket", count: 1, weight: 3 },
    {
        name: "Dwarven O's Metallic Minis",
        count: 1,
        weight: 50,
        unique: true,
    },
    { name: "Umber Plate", count: 1, weight: 50 },
    { name: "Tungsten Plate", count: 1, weight: 50 },
    { name: "Enchanted Book", count: 1, weight: 150 },
    { name: "Mithril Plate", count: 1, weight: 30 },
    { name: "Glacite Amalgamation", count: 2, weight: 80 },
    { name: "Glacite Amalgamation", count: 4, weight: 40 },
    { name: "Skeleton Key", count: 1, weight: 6 },
    { name: "Bejeweled Handle", count: 4, weight: 150 },
    { name: "Opal Crystal", count: 1, weight: 50, unique: true },
    { name: "Onyx Crystal", count: 1, weight: 50, unique: true },
    { name: "Aquamarine Crystal", count: 1, weight: 50, unique: true },
    { name: "Peridot Crystal", count: 1, weight: 50, unique: true },
    { name: "Citrine Crystal", count: 1, weight: 50, unique: true },
    { name: "Ruby Crystal", count: 1, weight: 50, unique: true },
    { name: "Jasper Crystal", count: 1, weight: 50, unique: true },
];

export const MESSAGE_WIDTH = 64;

export function lootVanguard(): string[] {
    const loots: {
        item: string;
        count: number;
    }[] = [];

    const table = LOOT_TABLE.slice();
    const giftOfTheDeparted = Math.random() < 1 / 5;
    const rollCount =
        5 + Math.floor(Math.random() * (3 + 1)) + (giftOfTheDeparted ? 1 : 0);

    function roll(): {
        name: string;
        count: number;
    } {
        if (Math.random() < 1 / 10000) {
            return {
                name: "Frostbitten Dye",
                count: 1,
            };
        }

        const totalWeight = table.reduce((prev, cur) => prev + cur.weight, 0);
        let n = Math.random() * totalWeight;

        for (let i = 0; i < table.length; i++) {
            const item = table[i];
            n -= item.weight;
            if (n <= 0) {
                if (item.unique) {
                    table.splice(i, 1);
                }
                return item;
            }
        }
        return table[table.length - 1];
    }

    for (let i = 0; i < rollCount; i++) {
        const item = roll();
        const index = loots.findIndex((v) => v.item === item.name);

        if (index === -1) {
            loots.push({
                item: item.name,
                count: item.count,
            });
        } else {
            loots[index].count += item.count;
        }
    }
    loots.sort((a, b) => (a.item.includes("Crystal") ? -1 : 1));

    const glacitePowder = 25000 + Math.floor(Math.random() * (50000 + 1));

    const result: string[] = [];

    result.push(
        "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
    );
    result.push("VANGUARD CORPSE LOOT!");
    if (giftOfTheDeparted)
        result.push("+1 bonus drop from HOTM! (Gifts from the Departed)");
    result.push("REWARDS");
    loots.forEach((loot) => {
        if (loot.count > 1) return result.push(`${loot.item} x${loot.count}`);
        result.push(loot.item);
    });
    result.push(`Glacite Powder x${glacitePowder}`);
    result.push(
        "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
    );

    return result;
}
