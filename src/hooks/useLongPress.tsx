import React, { useEffect, useState } from 'react';

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

    const start = (e: React.MouseEvent | React.TouchEvent) => {
        setStartLongPress(true);
        setLongPressEvent(e);
    };

    const stop = (e: React.MouseEvent | React.TouchEvent) => {
        setStartLongPress(false);
        setLongPressEvent(null);
    };

    return {
        onMouseDown: start,
        onMouseUp: stop,
        onMouseLeave: stop,
        onTouchStart: start,
        onTouchEnd: stop,
    };
}
