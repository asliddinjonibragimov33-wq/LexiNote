from flask import Flask, request
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from password_reset import password_reset

app = Flask(__name__)
CORS(app)
app.register_blueprint(password_reset)

def get_database():
    connection = sqlite3.connect("vocabulary.db")
    connection.row_factory = sqlite3.Row
    return connection


@app.route("/")
def home():
    return "Vocabulary App Backend ishlayapti!"


@app.route("/users")
def users():
    connection = get_database()

    users_data = connection.execute(
        "SELECT id, name, email, contact, username FROM users"
    ).fetchall()

    connection.close()

    return {
        "users": [dict(user) for user in users_data]
    }


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("name")
    contact = data.get("contact")
    username = data.get("username")
    password = data.get("password")

    if not name or not contact or not username or not password:
        return {
            "error": "Barcha maydonlarni to'ldiring!"
        }, 400

    hashed_password = generate_password_hash(password)

    connection = get_database()

    try:
        connection.execute(
            """
            INSERT INTO users (name, email, contact, username, password)
            VALUES (?, ?, ?, ?, ?)
            """,
            (name, contact, contact, username, hashed_password)
        )

        connection.commit()

    except sqlite3.IntegrityError:
        connection.close()

        return {
            "error": "Bu contact yoki username allaqachon mavjud!"
        }, 409

    connection.close()

    return {
        "message": "Ro'yxatdan o'tish muvaffaqiyatli!",
        "name": name,
        "contact": contact,
        "username": username
    }, 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {
            "error": "Login va parolni kiriting!"
        }, 400

    connection = get_database()

    user = connection.execute(
        "SELECT * FROM users WHERE username = ?",
        (username,)
    ).fetchone()

    connection.close()

    if user is None:
        return {
            "error": "Login yoki parol noto'g'ri!"
        }, 401

    if not check_password_hash(user["password"], password):
        return {
            "error": "Login yoki parol noto'g'ri!"
        }, 401

    return {
        "message": "Login muvaffaqiyatli!",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "username": user["username"],
            "contact": user["contact"]
        }
    }, 200


@app.route("/sets", methods=["POST"])
def create_set():
    data = request.get_json()

    user_id = data.get("user_id")
    date = data.get("date")
    title = data.get("title")

    if not user_id or not date or not title:
        return {
            "error": "Sana, mavzu va foydalanuvchi kerak!"
        }, 400

    connection = get_database()

    # Foydalanuvchi mavjudligini tekshirish
    user = connection.execute(
        "SELECT id FROM users WHERE id = ?",
        (user_id,)
    ).fetchone()

    if user is None:
        connection.close()

        return {
            "error": "Foydalanuvchi topilmadi!"
        }, 404

    cursor = connection.execute(
        """
        INSERT INTO sets (user_id, date, title)
        VALUES (?, ?, ?)
        """,
        (user_id, date, title)
    )

    connection.commit()

    set_id = cursor.lastrowid

    connection.close()

    return {
        "message": "Lug'at muvaffaqiyatli yaratildi!",
        "set": {
            "id": set_id,
            "user_id": user_id,
            "date": date,
            "title": title
        }
    }, 201


@app.route("/sets/<int:set_id>/words", methods=["POST"])
def add_word_to_set(set_id):
    data = request.get_json()

    word = data.get("word")
    translation = data.get("translation")
    definition = data.get("definition")
    example = data.get("example")

    if not word or not translation:
        return {
            "error": "So'z va tarjima kiritilishi shart!"
        }, 400

    connection = get_database()

    # Set mavjudligini tekshirish
    vocabulary_set = connection.execute(
        "SELECT id FROM sets WHERE id = ?",
        (set_id,)
    ).fetchone()

    if vocabulary_set is None:
        connection.close()

        return {
            "error": "Lug'at to'plami topilmadi!"
        }, 404

    # So'zni setga qo'shish
    cursor = connection.execute(
        """
        INSERT INTO words (
            set_id,
            word,
            translation,
            definition,
            example
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            set_id,
            word,
            translation,
            definition,
            example
        )
    )

    connection.commit()

    word_id = cursor.lastrowid

    connection.close()

    return {
        "message": "So'z muvaffaqiyatli qo'shildi!",
        "word": {
            "id": word_id,
            "set_id": set_id,
            "word": word,
            "translation": translation,
            "definition": definition,
            "example": example
        }
    }, 201


@app.route("/sets", methods=["GET"])
def get_sets():
    user_id = request.args.get("user_id")

    if not user_id:
        return {
            "error": "Foydalanuvchi ID si kerak!"
        }, 400

    connection = get_database()

    sets = connection.execute(
        """
        SELECT
            sets.id,
            sets.date,
            sets.title,
            COUNT(words.id) AS word_count
        FROM sets
        LEFT JOIN words
            ON sets.id = words.set_id
        WHERE sets.user_id = ?
        GROUP BY sets.id
        ORDER BY sets.id DESC
        """,
        (user_id,)
    ).fetchall()

    connection.close()

    result = []

    for set_item in sets:
        result.append({
            "id": set_item["id"],
            "date": set_item["date"],
            "title": set_item["title"],
            "word_count": set_item["word_count"]
        })

    return {
        "sets": result
    }, 200


@app.route("/sets/<int:set_id>/words", methods=["GET"])
def get_words_from_set(set_id):

    user_id = request.args.get("user_id")

    if not user_id:

        return {
            "error": "Foydalanuvchi ID si kerak!"
        }, 400


    connection = get_database()


    #Setni aynan shu foydalanuvchiga tegishliligini tekshirish 

    vocabulary_set = connection.execute(
        """
        SELECT
            id,
            user_id,
            date,
            title
        FROM sets
        WHERE id = ?
        AND user_id = ?
        """,
        (set_id, user_id)
    ).fetchone()


    if vocabulary_set is None:

        connection.close()

        return {
            "error":
                "Lug‘at to‘plami topilmadi yoki sizga tegishli emas!"
        }, 404


    words = connection.execute(
        """
        SELECT
            id,
            word,
            translation,
            definition,
            example
        FROM words
        WHERE set_id = ?
        ORDER BY id ASC
        """,
        (set_id,)
    ).fetchall()


    connection.close()


    words_list = []


    for word_item in words:

        words_list.append({

            "id":
                word_item["id"],

            "word":
                word_item["word"],

            "translation":
                word_item["translation"],

            "definition":
                word_item["definition"],

            "example":
                word_item["example"]

        })


    return {

        "set": {

            "id":
                vocabulary_set["id"],

            "user_id":
                vocabulary_set["user_id"],

            "date":
                vocabulary_set["date"],

            "title":
                vocabulary_set["title"]

        },

        "words":
            words_list

    }, 200


@app.route("/words/<int:word_id>", methods=["DELETE"])
def delete_word(word_id):
    connection = get_database()

    word = connection.execute(
        "SELECT id FROM words WHERE id = ?",
        (word_id,)
    ).fetchone()

    if word is None:
        connection.close()

        return {
            "error": "So‘z topilmadi!"
        }, 404

    connection.execute(
        "DELETE FROM words WHERE id = ?",
        (word_id,)
    )

    connection.commit()
    connection.close()

    return {
        "message": "So‘z muvaffaqiyatli o‘chirildi!"
    }, 200

@app.route("/words/<int:word_id>", methods=["PUT"])
def update_word(word_id):

    data = request.get_json()

    word = data.get("word")
    translation = data.get("translation")
    definition = data.get("definition")
    example = data.get("example")

    if not word or not translation:
        return {
            "error": "So‘z va tarjima kiritilishi shart!"
        }, 400

    connection = get_database()

    existing_word = connection.execute(
        """
        SELECT id
        FROM words
        WHERE id = ?
        """,
        (word_id,)
    ).fetchone()

    if existing_word is None:

        connection.close()

        return {
            "error": "So‘z topilmadi!"
        }, 404

    connection.execute(
        """
        UPDATE words
        SET
            word = ?,
            translation = ?,
            definition = ?,
            example = ?
        WHERE id = ?
        """,
        (
            word,
            translation,
            definition,
            example,
            word_id
        )
    )

    connection.commit()

    connection.close()

    return {
        "message": "So‘z muvaffaqiyatli yangilandi!",
        "word": {
            "id": word_id,
            "word": word,
            "translation": translation,
            "definition": definition,
            "example": example
        }
    }, 200

@app.route("/sets/<int:set_id>", methods=["DELETE"])
def delete_set(set_id):

    connection = get_database()

    # Set mavjudligini tekshirish
    vocabulary_set = connection.execute(
        "SELECT id FROM sets WHERE id = ?",
        (set_id,)
    ).fetchone()

    if vocabulary_set is None:
        connection.close()

        return {
            "error": "Lug'at to'plami topilmadi!"
        }, 404

    # Setga tegishli so'zlarni o'chirish
    connection.execute(
        "DELETE FROM words WHERE set_id = ?",
        (set_id,)
    )

    # Setning o'zini o'chirish
    connection.execute(
        "DELETE FROM sets WHERE id = ?",
        (set_id,)
    )

    connection.commit()
    connection.close()

    return {
        "message": "Lug'at muvaffaqiyatli o'chirildi!"
    }, 200

if __name__ == "__main__":
    app.run(debug=True)