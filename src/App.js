/* eslint-disable no-unused-expressions */
import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import 'font-awesome/css/font-awesome.min.css';
import Clock from 'react-live-clock';

const accurateInterval = require('accurate-interval');

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


class Timer extends React.Component {
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
        this.phaseControl = this.phaseControl.bind(this);
        this.decrementTimer = this.decrementTimer.bind(this);
        this.warning = this.warning.bind(this);
        this.buzzer = this.buzzer.bind(this);
        this.reset = this.reset.bind(this);
        this.switchTimer = this.switchTimer.bind(this);
        this.setBrkLength = this.setBrkLength.bind(this);
        this.setSeshLength = this.setSeshLength.bind(this);
        this.lengthControl = this.lengthControl.bind(this);
    }

    lengthControl(stateToChange, sign, currentLength, timerType) {
        if (this.state.timerState === 'running') return;
        if (this.state.timerType === timerType) {
            if (sign === "-" && currentLength !== 1) {
                this.setState({[stateToChange]: currentLength - 1});
            } else if (sign === "+" && currentLength !== 60) {
                this.setState({[stateToChange]: currentLength + 1});
            }
        } else {
            if (sign === "-" && currentLength !== 1) {
                this.setState({
                    [stateToChange]: currentLength - 1,
                    timer: currentLength * 60 - 60
                });
            } else if (sign === "+" && currentLength !== 60) {
                this.setState({
                    [stateToChange]: currentLength + 1,
                    timer: currentLength * 60 + 60
                });
            }
        }
    }

    beginCountDown() {
        this.setState({
            intervalID: accurateInterval(() => {
                this.decrementTimer();
                this.phaseControl();
            }, 1000)
        })
    }

    setBrkLength(e) {
        this.lengthControl('breakLength', e.currentTarget.value,
            this.state.breakLength, 'Session');
    }

    setSeshLength(e) {
        this.lengthControl('sessionLength', e.currentTarget.value,
            this.state.sessionLength, 'Break');
    }

    decrementTimer() {
        this.setState({timer: this.state.timer - 1});
    }

    phaseControl() {
        let timer = this.state.timer;
        this.warning(timer);
        this.buzzer(timer);
        if (timer < 0) {
            this.state.timerType === 'Session' ? (
                this.state.intervalID && this.state.intervalID.cancel(),
                    this.beginCountDown(),
                    this.switchTimer(this.state.breakLength * 60, 'Break')
            ) : (
                this.state.intervalID && this.state.intervalID.cancel(),
                    this.beginCountDown(),
                    this.switchTimer(this.state.sessionLength * 60, 'Session')
            );
        }
    }

    warning(_timer) {
        let warn = _timer < 61 ?
            this.setState({alarmColor: {color: 'blue'}}) :
            this.setState({alarmColor: {color: 'white'}});
    }

    buzzer(_timer) {
        if (_timer === 0) {
            this.audioBeep.play();
        }
    }

    timerControl() {
        let control = this.state.timerState === 'stopped' ? (
            this.beginCountDown(),
                this.setState({timerState: 'running'})
        ) : (
            this.setState({timerSTate: 'stopped'}),
            this.state.intervalID && this.state.intervalID.cancel()
        );
    }

    clockify() {
        let minutes = Math.floor(this.state.timer / 60);
        let seconds = this.state.timer - minutes * 60;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return minutes + ':' + seconds;
    }

    switchTimer(num, str) {
        this.setState({
            timer: num,
            timerType: str,
            alarmColor: {color: 'white'}
        })
    }

    reset() {
        this.setState({
            breakLength: 5,
            sessionLength: 25,
            timerState: 'stopped',
            timerType: 'Session',
            timer: 1500,
            intervalID: '',
            alarmColor: {color: 'white'}
        });
        this.state.intervalID && this.state.intervalID.cancel();
        this.audioBeep.pause();
        this.audioBeep.currentTime = 0;
    }

    render() {
        return (
            <div className="App">
                <div id="current-time" className="clock-face"><Clock format={'HH:mm:ss'} ticking={true} timezone={'US/Eastern'} /></div>
                <div>
                <div id="break-label">
                    <button id="break-decrement"><i className="fa fa-arrow-down fa-2x"/></button>
                    Break Length: {this.state.breakLength}
                    <button id="break-increment"><i className="fa fa-arrow-up fa-2x"/></button>
                </div>
                <div id="session-label">
                    <button id="session-decrement"><i className="fa fa-arrow-down fa-2x"/></button>
                    Session Length: {this.state.sessionLength}
                    <button id="session-increment"><i className="fa fa-arrow-up fa-2x"/></button>
                </div>
                <div id="break-length">
                    Break Length
                </div>
                <div id="session-length">
                    Session Length
                </div>
                </div>
                <div id="time-label" style={this.state.alarmColor}>
                    Type:
                    {this.state.timerType}
                </div>
                <div id="time-left" className="clock-face">
                    {this.clockify()}
                </div>
                <div id="timer-control">
                    <button id="start_stop" onClick={this.timerControl}>
                        <i className="fa fa-play fa-2x"/>
                        <i className="fa fa-pause fa-2x"/>
                    </button>
                        <button id="reset" onClick={this.reset}>
                            <i className="fa fa-refresh fa-2x"/>
                        </button>
                </div>
                <audio id="beep" preload="auto"
                       src="https://goo.gl/65cBl1"
                       ref={(audio) => {this.audioBeep = audio;}}/>

            </div>

        );
    }
}

function App() {
    return (
            <Timer/>
    );
}

export default App;
