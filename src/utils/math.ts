export const clamp = (n: number, min: number, max: number) => n < min ? min : n > max ? max : n; 

export const isPowerOf2 = (n: number) => (n & (n - 1)) === 0;
