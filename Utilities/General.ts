export function getFormDataFromObject(obj: Record<string, unknown>) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        acc.set(key, value as string);
        return acc;
    }, new FormData());
}

export function fetchPostFormData(endPoint: string, data: Record<string, unknown>) {
    return fetch(endPoint, {
        method: 'POST',
        body: getFormDataFromObject(data)
    });
}

export function fetchPostFormDataBodyJsonResponse<T>(endPoint: string, data: Record<string, unknown>): Promise<T> {
    return fetchPostFormData(endPoint, data).then(res => res.json());
}

/**
 * Creates formatted detail string with columns for delete/annotation detail text
 */
export function buildDetailStringFromObject(obj: Record<string, string>, keyValueSeparator: string, recordSeparator: string, alignColumns = false) {
    const filteredObj = Object.entries(obj)
        .reduce((acc, [key, value]) => {
            if (value.length > 0) {
                acc[`${key}${keyValueSeparator}`] = value;
            }
            return acc;
        }, {} as Record<string, string>);

    const getPaddingStr = (function () {
        if (alignColumns) {
            const maxLabelLength = Math.max(...Object.keys(filteredObj).map(k => k.length));
            return function (key: string) {
                return new Array(maxLabelLength - key.length + 1).join(' ');
            };
        } else {
            return function (_: unknown) {
                return '';
            };
        }
    }());

    return Object.entries(filteredObj)
        .map(([key, value]) => `${key}${getPaddingStr(key)}${value}`)
        .join(recordSeparator);

}