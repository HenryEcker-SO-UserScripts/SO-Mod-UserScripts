export type ModFlagRadioType = 'mod-flag' | 'plagiarism';

export const textAreaLimits = {
    plagiarism: {
        min: 10,
        max: 500
    },
    plagiarismSource: {
        min: 10
    },
    mod: {
        min: 10,
        max: 500
    },
    comments: {
        min: 15,
        max: 600
    }
};

export function isInValidationBounds(textLength: number, bounds: { min?: number; max?: number; }) {
    const min = bounds.min ?? 0;
    if (bounds.max === undefined) {
        return min <= textLength;
    }
    return min <= textLength && textLength <= bounds.max;
}