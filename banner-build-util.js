function* cartesianProductOf(array1, array2) {
    for (const a of array1) {
        for (const b of array2) {
            yield [a, b];
        }
    }
}

const siteBases = [
    '*://*.askubuntu.com', '*://*.serverfault.com',
    '*://*.stackapps.com', '*://*.stackexchange.com',
    '*://*.stackoverflow.com', '*://*.superuser.com',
    '*://*.mathoverflow.net'
].sort((a, b) => a.localeCompare(b));


export function buildMatchPatterns(linePrefix, ...relativeRoutes) {
    relativeRoutes = relativeRoutes.sort((a, b) => a.localeCompare(b));
    return [...cartesianProductOf(siteBases, relativeRoutes)].map(([base, route]) => `${linePrefix}${base}${route}`).join('\n');
}