export function getFormDataFromObject(obj: Record<string, unknown>) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        acc.set(key, value as string);
        return acc;
    }, new FormData());
}