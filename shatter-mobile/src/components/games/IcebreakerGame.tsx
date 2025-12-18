type IcebreakerGameProps = {
  eventId: string;
  mode: "preview" | "live";
};

export default function IcebreakerGame({ eventId, mode }: IcebreakerGameProps) {
  return (
    <div className="icebreaker-container">
      <h2 className="text-xl font-bold">
        {mode === "preview" ? "Event Icebreaker Preview" : "Icebreaker Game"}
      </h2>

      {/* Game content here */}
    </div>
  );
}
