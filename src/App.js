import React, {useEffect, useRef, useState} from 'react';
import './App.css';

// Can call with usePreciseTimer(updateTime, 1000, state.isActive);
const usePreciseTimer = (handler, periodInMilliseconds, activityFlag) => {
    const [timeDelay, setTimeDelay] = useState(1);
    const savedCallback = useRef();
    const initialTime = useRef();

useEffect(() => {
    savedCallback.current = handler;
}, [handler]);

useEffect(() => {
    if (activityFlag) {
        initialTime.current = new Date().getTime();
        const id = setInterval(() => {
            const currentTime = new Date().getTime();
            const delay = currentTime - initialTime.current;
            initialTime.current = currentTime;
            setTimeDelay(delay / 1000);
            savedCallback.current(timeDelay);
        }, periodInMilliseconds);

        return () => {
            clearInterval(id);
        };
    }
}, [periodInMilliseconds, activityFlag, timeDelay]);
};


function App() {
    return (
        <div className="App">
            <div id ="break-label">
                <button id="break-decrement"></button>
                Break Label
                <button id="break-increment"></button>
            </div>
            <div id="session-label">
                <button id="session-decrement"></button>
                Session Label
                <button id="session-increment"></button>
            </div>
            <div id="break-length">
                Break Length
            </div>
            <div id="session-length">
                Session Length
            </div>
            <div id="time-label">
                Timer Label
            </div>
            <div id="time-left">
                Time Left
            </div>
            <div id="start_stop">
                Start_stop
            </div>
            <div id="reset">
                Reset
            </div>

        </div>
    );
}

export default App;
