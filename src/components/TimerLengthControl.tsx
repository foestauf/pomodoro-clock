import { Dispatch, SetStateAction } from "react";

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
    onClick(e.currentTarget.value === "+" ? length + 1 : length - 1);
  };

  return (
    <div className="length-control">
      <div id={titleID}>{title}</div>
      <button
        id={addID}
        className="btn-level timer-button"
        value="+"
        onClick={handleClick}
      >
        <i className="fa fa-arrow-up fa-2x timer-button" />
      </button>
      <div id={lengthID} className="btn-level">
        {length}
      </div>
      <button
        id={minID}
        className="btn-level timer-button"
        value="-"
        onClick={handleClick}
      >
        <i className="fa fa-arrow-down fa-2x" />
      </button>
    </div>
  );
};
export default TimerLengthControl;
