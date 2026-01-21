#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the current seed files
const carPartsSeed = fs.readFileSync(path.join(__dirname, '..', 'db', 'seeds', '02_car_parts.sql'), 'utf8');
const driversSeed = fs.readFileSync(path.join(__dirname, '..', 'db', 'seeds', '03_drivers.sql'), 'utf8');

// Parse the INSERT statements to extract data
function parseInsertStatement(insertSql) {
    // Extract the VALUES part
    const valuesMatch = insertSql.match(/VALUES\s*(.+);/s);
    if (!valuesMatch) return [];

    const valuesStr = valuesMatch[1];
    // Split by closing parenthesis followed by comma and opening parenthesis
    const rows = valuesStr.split(/\),\s*\(/);

    return rows.map(row => {
        // Clean up the row string
        const cleanRow = row.replace(/^\(|\)$/g, '').trim();
        // Split by comma, but not within quotes or JSON
        const values = [];
        let current = '';
        let inQuotes = false;
        let inJson = false;
        let jsonDepth = 0;

        for (let i = 0; i < cleanRow.length; i++) {
            const char = cleanRow[i];

            if (char === '\'' && !inJson) {
                inQuotes = !inQuotes;
                current += char;
            } else if (char === '[' && !inQuotes) {
                inJson = true;
                jsonDepth++;
                current += char;
            } else if (char === ']' && !inQuotes) {
                jsonDepth--;
                if (jsonDepth === 0) {
                    inJson = false;
                }
                current += char;
            } else if (char === ',' && !inQuotes && !inJson) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        if (current.trim()) {
            values.push(current.trim());
        }

        return values;
    });
}

// Convert car parts data
function convertCarParts(rows) {
    return rows.map(row => {
        // Extract values in order from catalog_items format
        const [
            id, name, card_type, rarity, series, season_id, icon,
            cc_price, num_duplicates_after_unlock, collection_id,
            visual_override, collection_sub_name, car_part_type,
            tag_name, ordinal, min_gp_tier, stats_per_level
        ] = row;

        // For car parts, we need: id, name, rarity, series, season_id, icon, cc_price,
        // num_duplicates_after_unlock, collection_id, visual_override, collection_sub_name,
        // car_part_type, stats_per_level
        return `(${id}, ${name}, ${rarity}, ${series}, ${season_id}, ${icon}, ${cc_price}, ${num_duplicates_after_unlock}, ${collection_id}, ${visual_override}, ${collection_sub_name}, ${car_part_type}, ${stats_per_level})`;
    });
}

// Convert drivers data
function convertDrivers(rows) {
    return rows.map(row => {
        // Extract values in order from catalog_items format
        const [
            id, name, card_type, rarity, series, season_id, icon,
            cc_price, num_duplicates_after_unlock, collection_id,
            visual_override, collection_sub_name, car_part_type,
            tag_name, ordinal, min_gp_tier, stats_per_level
        ] = row;

        // For drivers, we need: id, name, rarity, series, season_id, icon, cc_price,
        // num_duplicates_after_unlock, collection_id, visual_override, collection_sub_name,
        // min_gp_tier, tag_name, ordinal, stats_per_level
        return `(${id}, ${name}, ${rarity}, ${series}, ${season_id}, ${icon}, ${cc_price}, ${num_duplicates_after_unlock}, ${collection_id}, ${visual_override}, ${collection_sub_name}, ${min_gp_tier}, ${tag_name}, ${ordinal}, ${stats_per_level})`;
    });
}

// Parse and convert
const carPartsRows = parseInsertStatement(carPartsSeed);
const driversRows = parseInsertStatement(driversSeed);

// Generate new SQL files
const newCarPartsSQL = `-- Car Parts Data for Season 6
INSERT INTO car_parts (id, name, rarity, series, season_id, icon, cc_price, num_duplicates_after_unlock, collection_id, visual_override, collection_sub_name, car_part_type, stats_per_level) VALUES
    ${convertCarParts(carPartsRows).join(',\n    ')};\n`;

const newDriversSQL = `-- Drivers Data for Season 6
INSERT INTO drivers (id, name, rarity, series, season_id, icon, cc_price, num_duplicates_after_unlock, collection_id, visual_override, collection_sub_name, min_gp_tier, tag_name, ordinal, stats_per_level) VALUES
    ${convertDrivers(driversRows).join(',\n    ')};\n`;

// Write new files
fs.writeFileSync(path.join(__dirname, '..', 'db', 'seeds', '02_car_parts.sql'), newCarPartsSQL);
fs.writeFileSync(path.join(__dirname, '..', 'db', 'seeds', '03_drivers.sql'), newDriversSQL);

console.log('✅ Seed files converted successfully!');
console.log(`📊 Car parts: ${carPartsRows.length} items`);
console.log(`📊 Drivers: ${driversRows.length} items`);
