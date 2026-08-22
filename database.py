```python
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv


# ==========================================
# ENVIRONMENT VARIABLES
# ==========================================

load_dotenv()


DATABASE_URL = os.getenv(
    "DATABASE_URL"
)


# ==========================================
# DATABASE CONNECTION
# ==========================================

def get_database():

    if not DATABASE_URL:

        raise RuntimeError(
            "DATABASE_URL topilmadi!"
        )


    connection = psycopg2.connect(
        DATABASE_URL,
        cursor_factory=RealDictCursor
    )


    return connection


# ==========================================
# CREATE TABLES
# ==========================================

def create_database():

    connection = get_database()

    cursor = connection.cursor()


    # ======================================
    # USERS
    # ======================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (

            id SERIAL PRIMARY KEY,

            name TEXT NOT NULL,

            email TEXT UNIQUE NOT NULL,

            password TEXT NOT NULL,

            contact TEXT,

            username TEXT UNIQUE
        )
    """)


    # ======================================
    # SETS
    # ======================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sets (

            id SERIAL PRIMARY KEY,

            user_id INTEGER NOT NULL,

            date TEXT NOT NULL,

            title TEXT NOT NULL,

            created_at TIMESTAMP
                DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    """)


    # ======================================
    # WORDS
    # ======================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS words (

            id SERIAL PRIMARY KEY,

            set_id INTEGER NOT NULL,

            word TEXT NOT NULL,

            translation TEXT NOT NULL,

            definition TEXT,

            example TEXT,

            created_at TIMESTAMP
                DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (set_id)
                REFERENCES sets(id)
                ON DELETE CASCADE
        )
    """)


    # ======================================
    # PASSWORD RESETS
    # ======================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS password_resets (

            id SERIAL PRIMARY KEY,

            user_id INTEGER NOT NULL,

            code TEXT NOT NULL,

            reset_token TEXT,

            expires_at TIMESTAMP NOT NULL,

            verified INTEGER DEFAULT 0,

            created_at TIMESTAMP
                DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    """)


    connection.commit()


    cursor.close()
    connection.close()


# ==========================================
# LOCAL TEST
# ==========================================

if __name__ == "__main__":

    create_database()

    print(
        "PostgreSQL database muvaffaqiyatli tayyorlandi!"
    )
```
