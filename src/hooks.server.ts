// Start the review queue worker with the server. Route modules load lazily, so without this
// delayed jobs only run after someone happens to open the submit page.
import "$src/lib/queue/consumers/submissions";

// One process serves both domains: a stray rejected promise must be logged, not crash it.
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection", reason);
});
