export interface ValidationBounds {
    min: number;
    max: number;
}


export const config = {
    validationBounds: {
        deleteReasonDetails: {
            min: 15,
            max: 600
        },
        annotationDetails: {
            min: 10,
            max: 300
        },
    }
};