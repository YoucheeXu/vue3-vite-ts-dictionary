type TimerId = ReturnType<typeof setInterval>;

// Throttle function
export function throttle (fn: Function, delay: number) {
    let lastCall = 0;
    return (...args: any[]) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            fn(...args);
            lastCall = now;
        }
    };
};

// export function debounce2(fn: Function, duration: number = 300){
//     let timerId: TimerId;
//     return function (...args){
//         clearTimeout(timerId);
//         timerId = setTimeout(() => {
//             fn.call(this, ...args);
//         }, duration);
//     };
// }

/**
 * Type-safe debounce function
 * @param fn - The function to debounce
 * @param duration - Debounce delay in ms (default: 300)
 * @returns Debounced function with preserved types
 */
export function debounce<F extends (...args: any[]) => any>(
    fn: F,
    duration: number = 300
) {
    let timerId: TimerId;

    // Annotate `this` type + type the rest parameters
    return function (this: ThisParameterType<F>, ...args: Parameters<F>): void {
            clearTimeout(timerId);
            timerId = setTimeout(() => {
            fn.call(this, ...args);
        }, duration);
    };
}