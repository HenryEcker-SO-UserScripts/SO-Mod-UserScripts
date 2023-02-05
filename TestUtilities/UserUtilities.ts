export function getUserPii(userId: number | string): Promise<{
    email: string;
    name: string;
    ip: string;
}> {
    return new Promise(resolve => {
        console.log('Fetching PII for', userId);
        resolve({
            email: 'sample@example.com',
            name: 'First Last',
            ip: '0.0.0.0'
        });
    });
}


export function deleteUser(userId: number | string, deleteReason: string, deleteReasonDetails: string): Promise<{ status: number; }> {
    return new Promise(resolve => {
        console.log('Deletion', {
            userId,
            deleteReason,
            deleteReasonDetails
        });
        resolve({
            status: 200
        });
    });
}

export function annotateUser(userId: number | string, annotationDetails: string): Promise<{ status: number; }> {
    return new Promise(resolve => {
        console.log('Annotation', {
            userId,
            annotationDetails
        });
        resolve({
            status: 200
        });
    });
}