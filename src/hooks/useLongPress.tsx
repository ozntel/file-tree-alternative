import React, { useEffect, useState, useCallback } from 'react';

export function isTouchEvent(e: React.TouchEvent | React.MouseEvent): e is React.TouchEvent {
    return e && 'touches' in e;
}

export function isMouseEvent(e: React.TouchEvent | React.MouseEvent): e is React.MouseEvent {
    return e && 'screenX' in e;
}

export default function useLongPress(callback = (e: React.MouseEvent | React.TouchEvent) => {}, ms = 300) {
    const [startLongPress, setStartLongPress] = useState<boolean>(false);
    const [longPressEvent, setLongPressEvent] = useState<React.MouseEvent | React.TouchEvent>(null);

    useEffect(() => {
        let timerId: any;
        if (startLongPress) {
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
    }, [callback, ms, startLongPress]);

    const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        setStartLongPress(true);
        setLongPressEvent(e);
    }, []);

    const stop = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        setStartLongPress(false);
        setLongPressEvent(null);
    }, []);

    return {
        onMouseDown: start,
        onMouseUp: stop,
        onMouseLeave: stop,
        onTouchStart: start,
        onTouchEnd: stop,
    };
}
