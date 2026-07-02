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
- alembic -- database migration
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


pip install alembic
alembic init alembic
alembic-> env.py -> from imported model ->metadata data
alembic.ini->sqlalchemy.url to postgresql database url ---> postgresql://user:password@host:port/database_name
alembic revision --autogenerate -m "initial migration"
you will have a new version update with def upgrade() in that for eg:713e98317319.py before doing upgrade check that.
alembic upgrade head



pip install passlib
pip install python-jose[cryptography]

passlib- used to encrypt passwords
# hashing algorithm
argon2
bcrypt 

python-jose[cryptography]- used to create jwt tokens
jwt tokens -> used to authenticate and authorize users
its in format xxxx.yyyyy.zzzz basically 3 parts 
1.header -> algo + token type:{alg:HS256,typ:JWT}
2.payload -> data, for eg: {user_id:1,role:admin}
3.signature -> used to verify the token:{hash(header+payload+secretkey)}
access token -> used to access protected resources
refresh token -> used to refresh access token


pip install python-multipart