import TestComponent from "../components/TestComponent";
import QRCodeDisplay from "../components/QRCodeDisplay";
import EventCardComponent from "../components/EventCardComponent";

const HomePage = () => {
  return (
    <div>
      <p>This is the first component</p>
      <TestComponent />
      <QRCodeDisplay />
      <EventCardComponent
        name="Tech Meetup Calgary"
        joinCode="28926159"
      />
    </div>
  );
};

export default HomePage;
