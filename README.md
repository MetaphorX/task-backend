# 📝 Task Backend API

A RESTful API built with Node.js, Express.js, and MongoDB for managing tasks. This backend service provides endpoints to create, read, update, and delete tasks, with role-based access control (RBAC) distinguishing between admin and regular users.

## 📁 Project Structure



```bash
task-backend/
├── config/             # Configuration files (e.g., database connections)
├── controllers/        # Route handler functions
├── middlewares/        # Custom middleware functions (e.g., authentication, authorization)
├── models/             # Mongoose schemas and models
├── routes/             # API route definitions
├── .env                # Environment variables
├── .gitignore          # Specifies files to ignore in Git
├── package.json        # Project metadata and dependencies
├── package-lock.json   # Exact versions of installed dependencies
└── server.js           # Entry point of the application
```



## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/MetaphorX/task-backend.git
   cd task-backend
   ```


2. **Install dependencies:**

   ```bash
   npm install
   ```


3. **Configure environment variables:**

   Create a `.env` file in the root directory and add the following:

   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/taskdb
   JWT_SECRET=your_jwt_secret_key
   ```


4. **Start the server:**

   ```bash
   npm start
   ```


   The server will run on `http://localhost:3000`.

## 🔐 Authentication & Authorization

### Authentication

- Users authenticate using JSON Web Tokens (JWT).
- Upon successful login, a JWT is issued, which must be included in the `Authorization` header for protected routes. ([Node.js - Role Based Authorization Tutorial with Example API](https://jasonwatmore.com/post/2018/11/28/nodejs-role-based-authorization-tutorial-with-example-api?utm_source=chatgpt.com))

### Role-Based Access Control (RBAC)

- Two roles are defined:
  - **Admin**: Has full access to all resources and can manage users and tasks.
  - **User**: Can manage their own tasks.
- Roles are assigned during user registration or by an admin user.
- Middleware functions enforce access control based on user roles.

## 📚 API Documentation

### Base URL


```
http://localhost:3000/api
```


### Authentication Endpoints

- **POST `/api/auth/register`**: Register a new user.
- **POST `/api/auth/login`**: Authenticate a user and return a JWT.

### Task Endpoints

- **GET `/api/tasks`**: Retrieve all tasks.
  - Accessible by: Admin
- **GET `/api/tasks/user`**: Retrieve tasks for the authenticated user.
  - Accessible by: User
- **POST `/api/tasks`**: Create a new task.
  - Accessible by: Admin, User
- **PUT `/api/tasks/:id`**: Update a task by ID.
  - Accessible by: Admin, Task Owner
- **DELETE `/api/tasks/:id`**: Delete a task by ID.
  - Accessible by: Admin, Task Owner ([How to check role of user in express application - Auth0 Community](https://community.auth0.com/t/how-to-check-role-of-user-in-express-application/27525?utm_source=chatgpt.com))

### Sample Request

**Create a Task**


```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Finish project documentation",
  "description": "Complete the README and API docs",
  "status": "in-progress"
}
```


### Sample Response


```json
{
  "success": true,
  "data": {
    "_id": "60f7c0f5b6e0f2a5d8e8b456",
    "title": "Finish project documentation",
    "description": "Complete the README and API docs",
    "status": "in-progress",
    "owner": "60f7c0f5b6e0f2a5d8e8b123",
    "createdAt": "2025-04-29T22:00:00.000Z",
    "updatedAt": "2025-04-29T22:00:00.000Z"
  }
}
```


## 🧪 Testing

To run tests (if implemented):


```bash
npm test
```


*Note: Testing framework setup (e.g., Jest, Mocha) is required.*

## 🛠️ Technologies Used

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **dotenv**: Environment variable management ([The Complete Guide to Node.js User Authentication with Auth0](https://auth0.com/blog/complete-guide-to-nodejs-express-user-authentication/?utm_source=chatgpt.com))

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---
