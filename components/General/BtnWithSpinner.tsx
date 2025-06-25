import { Button, Spinner } from "react-bootstrap";

interface IProps {
  onClick: () => void;
  wasClicked: boolean;
  children: React.ReactNode;
}

export const BtnWithSpinner: React.FC<IProps> = ({
  onClick,
  wasClicked,
  children,
}) => {
  return (
    <Button
      onClick={onClick}
      className="mt-2 no-btn-styles text-white p-2 rounded "
      style={{
        width: "150px",
        backgroundColor: wasClicked ? "grey" : "#4C96CC",
      }}
    >
      {wasClicked ? <Spinner size="sm" className="text-white" /> : children}
    </Button>
  );
};
