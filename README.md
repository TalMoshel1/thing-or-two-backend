# Project Features

This project provides a robust API and frontend with the following features:

- **RESTful Endpoints:** Implements standard CRUD operations for managing resources.
- **Authentication & Authorization:** Secures endpoints using modern authentication mechanisms.
- **Validation:** Ensures data integrity with request validation.
- **Error Handling:** Returns meaningful error messages for invalid requests.
- **Database Integration:** Connects to a persistent data store for reliable data management.
- **Logging:** Tracks API usage and errors for monitoring and debugging.
- **Swagger Documentation:** Interactive API documentation is available at [`/docs`](./docs), allowing you to explore and test endpoints easily.
- **Frontend Technologies:** The frontend is built using **MUI** for UI components, **Redux** for state management, and **React Context** for sharing data across components.

To run the docker package:

Clone the backend repository.

Run:

    docker build . -t tal-music

    docker-compose up

Wait around 30 seconds, then open http://localhost:3000

(API docs available at http://localhost:3000/docs)
