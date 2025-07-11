import { Dispatch, SetStateAction } from "react";
import { trackUserInteraction } from "../services/telemetryService";

interface TimerLengthControlProps {
  title: string;
  titleID: string;
  addID: string;
  onClick: Dispatch<SetStateAction<number>>;
  lengthID: string;
  length: number;
  minID: string;
}

const TimerLengthControl: React.FC<TimerLengthControlProps> = ({
  title,
  titleID,
  addID,
  onClick,
  lengthID,
  length,
  minID,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const action = e.currentTarget.value === "+" ? "increment" : "decrement";
    const newValue = e.currentTarget.value === "+" ? length + 1 : length - 1;
    
    trackUserInteraction(
      `${action}_${title.toLowerCase().replace(/\s+/g, '_')}`,
      `${action}_button`,
      `${length.toString()}_to_${newValue.toString()}`
    );
    
    onClick(newValue);
  };

  return (
    <div className="length-control">
      <div id={titleID} className="control-title">
        {title}
      </div>
      <div className="control-buttons">
        <button
          id={minID}
          className="btn-level timer-button"
          value="-"
          onClick={handleClick}
        >
          <i className="fa fa-arrow-down fa-2x" />
        </button>
        <div id={lengthID} className="btn-level length-value">
          {length}
        </div>
        <button
          id={addID}
          className="btn-level timer-button"
          value="+"
          onClick={handleClick}
        >
          <i className="fa fa-arrow-up fa-2x timer-button" />
        </button>
      </div>
    </div>
  );
};

export default TimerLengthControl;
