import { Link } from "react-router-dom";

interface EventCardComponentProps {
  name: string;
  joinCode: string;
}

const EventCardComponent = ({ name, joinCode }: EventCardComponentProps) => {
  return (
    <div className="center max-w-sm rounded-2xl shadow-lg bg-black p-6">
      <h2 className="text-xl font-semibold">{name}</h2>

      <p className="mt-2 text-sm text-gray-600">
        Join Code: <span className="font-mono">{joinCode}</span>
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <Link
          to={`/events/${joinCode}`}
          className="rounded border py-2 text-center"
        >
          Event
        </Link>
      </div>
    </div>
  );
};

export default EventCardComponent;
