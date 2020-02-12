import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import 'font-awesome/css/font-awesome.min.css';

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


class Timer extends  React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timer: 1500,
            breakLength: 5,
            sessionLength: 25,
            timerState: 'stopped',
            timerType: 'Session',
            intervalID: '',
            alarmColor: {color: 'white'}
        };
        this.clockify = this.clockify.bind(this);
        this.timerControl = this.timerControl.bind(this);
        this.beginCountDown = this.beginCountDown.bind(this);
    }
    beginCountDown() {
        this.setState({
            intervalID: usePreciseTimer(initialTime, 10000, state.isActive),
        }, 1000);
    }
    
    timerControl() {
        let control = this.state.timerState == 'stopped' ? (
            this.beginCountDown(),
                this.setState({timerState: 'running'})
        ) : (
            this.setState({timerSTate: 'stopped'}),
                this.state.intervalID && this.state.intervalID.cancel()
        );
    }
    
    clockify() {
        let minutes = Math.floor(this.state.timer /60);
        let seconds = this.state.timer - minutes * 60;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return minutes + ':' + seconds;
    }
render() {
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
                {this.clockify()}
            </div>
            <div id="timer-control">
                Start_stop
                <button id="start_stop" onClick={this.timerControl}>
                    <i className="fa fa-play fa-2x"/>
                    <i className="fa fa-pause fa-2x"/>
                </button>
                <button id="reset" onClick={this.reset}>
                    <i className="fa fa-refresh fa2x"/>
                </button>
            </div>
            <div id="reset">
                Reset
            </div>

        </div>

    );
}
}

function App() {
    return (
        <div>
        <Timer />
        </div>
    );
}

export default App;
