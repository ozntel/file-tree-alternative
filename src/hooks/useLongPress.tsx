import React, { useEffect, useState, useCallback } from 'react';

export function isTouchEvent(e: React.TouchEvent | React.MouseEvent): e is React.TouchEvent {
    return e && 'touches' in e;
}

export function isMouseEvent(e: React.TouchEvent | React.MouseEvent): e is React.MouseEvent {
    return e && 'screenX' in e;
}

export default function useLongPress(callback = (e: React.TouchEvent) => {}, ms = 300) {
    const [startLongPress, setStartLongPress] = useState<boolean>(false);
    const [longPressEvent, setLongPressEvent] = useState<React.TouchEvent>(null);
    const [startLocationY, setStartLocationY] = useState<number>(null);

    useEffect(() => {
        let timerId: any;
        if (startLongPress && startLocationY) {
            timerId = setTimeout(() => {
                callback(longPressEvent);
                stop(longPressEvent);
            }, ms);
        } else {
            clearTimeout(timerId);
        }
        return () => {
            clearTimeout(timerId);
        };
    }, [callback, ms, startLongPress, startLocationY]);

    const start = useCallback((e: React.TouchEvent) => {
        setStartLongPress(true);
        setStartLocationY(e.touches[0].clientY);
        setLongPressEvent(e);
    }, []);

    const move = useCallback(
        (e: React.TouchEvent) => {
            if (startLocationY) {
                let dist = Math.abs(e.touches[0].clientY - startLocationY);
                if (dist >= 0.5) stop(e);
            }
        },
        [startLocationY]
    );

    const stop = useCallback((e: React.TouchEvent) => {
        setStartLongPress(false);
        setLongPressEvent(null);
    }, []);

    return {
        onTouchStart: start,
        onTouchMove: move,
        onTouchEnd: stop,
    };
}
