import sqlite3


connection = sqlite3.connect("vocabulary.db")
cursor = connection.cursor()

# contact ustunini qo'shamiz
columns = [
    row[1]
    for row in cursor.execute("PRAGMA table_info(users)").fetchall()
]

if "contact" not in columns:
    cursor.execute(
        "ALTER TABLE users ADD COLUMN contact TEXT"
    )

# username ustunini qo'shamiz
if "username" not in columns:
    cursor.execute(
        "ALTER TABLE users ADD COLUMN username TEXT"
    )

connection.commit()
connection.close()

print("Database muvaffaqiyatli yangilandi!")
