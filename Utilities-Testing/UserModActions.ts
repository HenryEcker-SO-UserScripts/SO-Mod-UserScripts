// Simulated versions
export function getUserPii(userId: number | string): Promise<{
    email: string;
    name: string;
    ip: string;
}> {
    console.log('Fetching PII for', userId);
    return Promise.resolve({
        email: 'sample@example.com',
        name: 'First Last',
        ip: '0.0.0.0'
    });
}


export function deleteUser(userId: number | string, deleteReason: string, deleteReasonDetails: string): Promise<{ status: number; }> {
    console.log('Deletion', {
        userId,
        deleteReason,
        deleteReasonDetails
    });
    return Promise.resolve({
        status: 200
    });
}

export function annotateUser(userId: number | string, annotationDetails: string): Promise<{ status: number; }> {
    console.log('Annotation', {
        userId,
        annotationDetails
    });
    return Promise.resolve({
        status: 200
    });
}