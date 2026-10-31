import React, { useEffect, useRef, useCallback } from 'react';

export function isTouchEvent(e: React.TouchEvent | React.MouseEvent): e is React.TouchEvent {
    return e && 'touches' in e;
}

export function isMouseEvent(e: React.TouchEvent | React.MouseEvent): e is React.MouseEvent {
    return e && 'screenX' in e;
}

// A finger always wobbles a little while holding still, only a real scroll should cancel the long press
const MOVE_TOLERANCE = 10;

export default function useLongPress(callback = (e: React.TouchEvent) => {}, ms = 300) {
    // Refs instead of state: touching a row must not re-render it
    const timerRef = useRef<number>(null);
    const startPointRef = useRef<{ x: number; y: number }>(null);
    const firedRef = useRef<boolean>(false);
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const clear = useCallback(() => {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
        startPointRef.current = null;
    }, []);

    useEffect(() => clear, []);

    const start = useCallback((e: React.TouchEvent) => {
        if (e.touches.length !== 1) return clear();
        firedRef.current = false;
        startPointRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
            firedRef.current = true;
            startPointRef.current = null;
            navigator.vibrate?.(10);
            callbackRef.current(e);
        }, ms);
    }, [ms]);

    const move = useCallback((e: React.TouchEvent) => {
        const startPoint = startPointRef.current;
        if (!startPoint) return;
        const dx = Math.abs(e.touches[0].clientX - startPoint.x);
        const dy = Math.abs(e.touches[0].clientY - startPoint.y);
        if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) clear();
    }, []);

    const stop = useCallback((e: React.TouchEvent) => {
        clear();
        // The menu is already open, don't let the lifted finger also click (open) the item
        if (firedRef.current && e.cancelable) e.preventDefault();
    }, []);

    return {
        onTouchStart: start,
        onTouchMove: move,
        onTouchEnd: stop,
        onTouchCancel: clear,
    };
}
