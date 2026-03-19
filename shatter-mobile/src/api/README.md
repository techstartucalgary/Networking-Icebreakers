# API Layer

This folder contains functions that handle route calls to the backend.

These wrappers ensure the rest of the application interacts with the backend through a clean and consistent interface.

## Responsibilities

- Managing HTTP requests (GET, POST, PUT, DELETE)
- Handling errors and returning normalized results
- Applying auth tokens or headers when needed
- Defining API endpoints cleanly

## Structure

Example:
- `events/event.api.tsx`: Handles all route calls regarding events
