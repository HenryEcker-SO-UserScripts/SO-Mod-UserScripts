export function getFormDataFromObject(obj: Record<string, unknown>) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        acc.set(key, value as string);
        return acc;
    }, new FormData());
}

export function fetchPostFormDataBodyJsonResponse<T>(endPoint: string, data: Record<string, unknown>): Promise<T> {
    return fetch(endPoint, {
        method: 'POST',
        body: getFormDataFromObject(data)
    }).then(res => res.json());
}