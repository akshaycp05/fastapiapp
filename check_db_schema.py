import psycopg2

conn = psycopg2.connect('postgresql://postgres:password@localhost:5432/Student_db')
cur = conn.cursor()
cur.execute("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name='users';")
print('COLUMNS:')
for row in cur.fetchall():
    print(row)
cur.execute("SELECT version_num FROM alembic_version;")
print('ALEMBIC VERSION:')
for row in cur.fetchall():
    print(row)
cur.close()
conn.close()
