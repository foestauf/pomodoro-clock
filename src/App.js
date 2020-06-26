/* eslint-disable no-unused-expressions */
import React from 'react';
import './App.css';
import 'font-awesome/css/font-awesome.min.css';
import Clock from 'react-live-clock';

const accurateInterval = require('accurate-interval');
const pauseIcon = 'fa fa-pause fa-2x'
const playIcon = 'fa fa-play fa-2x'

class TimerLengthControl extends React.Component {
    render() {
        return (
            <div className="length-control">
                <div id={this.props.titleID}>
                    {this.props.title}
                </div>
                <button id={this.props.addID}
                        className="btn-level timer-button" value="+"
                        onClick={this.props.onClick}>
                    <i className="fa fa-arrow-up fa-2x timer-button"/>
                </button>
                <div id={this.props.lengthID} className="btn-level">
                    {this.props.length}
                </div>
                <button id={this.props.minID}
                        className="btn-level timer-button" value="-"
                        onClick={this.props.onClick}>
                    <i className="fa fa-arrow-down fa-2x"/>
                </button>

            </div>
        )
    }
}

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
            alarmColor: {color: 'white'},
            startButton: playIcon
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
                this.state.intervalID && this.state.intervalID.clear(),
                    this.beginCountDown(),
                    this.switchTimer(this.state.breakLength * 60, 'Break')
            ) : (
                this.state.intervalID && this.state.intervalID.clear(),
                    this.beginCountDown(),
                    this.switchTimer(this.state.sessionLength * 60, 'Session')
            );
        }
    }

    warning(_timer) {
        _timer < 61 ?
            this.setState({alarmColor: {color: 'blue'}}) :
            this.setState({alarmColor: {color: 'white'}});
    }

    buzzer(_timer) {
        if (_timer === 0) {
            this.audioBeep.play();
        }
    }

    timerControl() {
        if (this.state.timerState === 'stopped') {
            this.beginCountDown();
            this.setState({timerState: 'running'});
            this.setState({startButton: pauseIcon})
        } else {
            this.setState({timerState: 'stopped'});
            this.state.intervalID && this.state.intervalID.clear();
            this.setState({startButton: playIcon})
        }
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
            alarmColor: {color: 'white'},
            startButton: playIcon
        });
        this.state.intervalID && this.state.intervalID.clear();
        this.audioBeep.pause();
        this.audioBeep.currentTime = 0;
    }

    render() {
        return (
            <div className="App">
                <div>Current Time</div>
                <div id="current-time" className="clock-face"><Clock format={'HH:mm:ss'} ticking={true}
                                                                     timezone={'US/Eastern'}/></div>
                <div id="main-display">
                    <div id="crunc-supreme-wrapper">
                    <div id="time-label" style={this.state.alarmColor}>
                        <h1>
                        {this.state.timerType}
                        </h1>
                    </div>

                    <div id="timer-wrapper">
                        <div id="break-label">
                            <TimerLengthControl
                                titleID="break-label" minID="break-decrement"
                                addID="break-increment" lengthID="break-length"
                                title="Break Length" onClick={this.setBrkLength}
                                length={this.state.breakLength}/>
                        </div>
                        <div id="time-left" className="clock-face">
                            {this.clockify()}
                        </div>
                        <TimerLengthControl
                            titleID="session-label" minID="session-decrement"
                            addID="session-increment" lengthID="session-length"
                            title="Session Length" onClick={this.setSeshLength}
                            length={this.state.sessionLength}/>

                        <audio id="beep" preload="auto"
                               src="https://goo.gl/65cBl1"
                               ref={(audio) => {
                                   this.audioBeep = audio;
                               }}/>
                    </div>
                    <div id="timer-control">
                        <button id="start_stop" className="timer-button" onClick={this.timerControl}>

                            <i className={this.state.startButton}/>
                        </button>
                        <button id="reset" className="timer-button" onClick={this.reset}>
                            <i className="fa fa-refresh fa-2x"/>
                        </button>
                    </div>
                </div>
                </div>
            </div>

        );
    }
}

export default Timer;
