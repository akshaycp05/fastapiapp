# fastapiapp

## creating fastapi application

# CRUD operations
- Create
- Read
- Update
- Delete

# Rest API
- GET
- POST
- PUT
- DELETE

# status codes
- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 405 Method Not Allowed
- 409 Conflict
- 500 Internal Server Error

# Architecture of fastapi application
- Model -- tables creation
- Router -- routes requests to controllers
- Controller -- controller logic
- Service -- business logic
- Repository -- data access layer
- Middleware -- request processing pipeline
- schema -- pydantic models for validation

# database
## relational database
- mysql
- postgresql
- sqlite
- sql server

## non-relational database
- mongodb
- cassandra
- redis
- dynamodb

# constraints in database
- primary key -- eg: student_id
- foreign key -- eg: department_id in student table
- unique --eg: email, phonenumber
- not null --eg: name
- check -- eg: salary > 0
- default -- eg: timestamp: func.now()

# mysql example
CREATE TABLE Students(
  Student_ID int PRIMARY KEY, 
  LastName varchar(255) NOT NULL,
  FirstName varchar(255)
);

# modules
- sqlalchemy -- orm (object relational mapping)
- fastapi -- web framework
- uvicorn -- server for running fastapi application --> `uvicorn app.main:app --reload`
- psycopg2 -- postgresql driver
- pydantic -- data validation
- alembic -- acts like Git version control for your database schema
- typing-extensions -- type hints

# Concepts:
- ORM
    - Object Relational Mapping --> to convert python code to sql commands without writing sql commands
- Depends
    - Dependency injection --> to inject dependencies into route handlers
- Sessionmaker
    - To create a session with the database
- SessionLocal
    - To create a session with the database for a single request
- declartive_base
    - To create a base class for all the models
