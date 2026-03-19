# Services

This folder contains shared service logic used throughout the application.  
Services are responsible for handling reusable, external-facing functionality such as:

- API helpers or HTTP wrappers
- Data formatting utilities
- Authentication helpers
- Integration logic for third-party services

## Structure

Each service should be its own file and export functions or classes that can be consumed by any part of the app.

Example:
- `event.service.tsx`: Serves the Events API routes