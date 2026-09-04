from flask import Flask, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

from database import get_database, create_database


# ==========================================
# DATABASE INITIALIZATION
# ==========================================

create_database()


# ==========================================
# PASSWORD RESET
# ==========================================

from password_reset import password_reset


# ==========================================
# FLASK APP
# ==========================================

app = Flask(__name__)

CORS(app)

app.register_blueprint(password_reset)


# ==========================================
# HOME
# ==========================================

@app.route("/")
def home():

    return "Vocabulary App Backend ishlayapti!"


# ==========================================
# USERS
# ==========================================

@app.route("/users")
def users():

    connection = get_database()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            name,
            email,
            contact,
            username
        FROM users
    """)

    users_data = cursor.fetchall()

    cursor.close()
    connection.close()

    return {
        "users": users_data
    }


# ==========================================
# REGISTER
# ==========================================

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    contact = data.get("contact")
    username = data.get("username")
    password = data.get("password")


    if not name or not contact or not username or not password:

        return {
            "error":
                "Barcha maydonlarni to'ldiring!"
        }, 400


    hashed_password = generate_password_hash(
        password
    )


    connection = get_database()

    cursor = connection.cursor()


    try:

        cursor.execute(
            """
            INSERT INTO users (
                name,
                email,
                contact,
                username,
                password
            )

            VALUES (%s, %s, %s, %s, %s)

            RETURNING id
            """,

            (
                name,
                contact,
                contact,
                username,
                hashed_password
            )
        )


        user_id = cursor.fetchone()["id"]

        connection.commit()


    except Exception as error:

        connection.rollback()

        cursor.close()
        connection.close()

        print(
            "Register error:",
            error
        )

        return {
            "error":
                "Bu contact yoki username allaqachon mavjud!"
        }, 409


    cursor.close()
    connection.close()


    return {

        "message":
            "Ro'yxatdan o'tish muvaffaqiyatli!",

        "id":
            user_id,

        "name":
            name,

        "contact":
            contact,

        "username":
            username

    }, 201


# ==========================================
# LOGIN
# ==========================================

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")


    if not username or not password:

        return {
            "error":
                "Login va parolni kiriting!"
        }, 400


    connection = get_database()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE username = %s
        """,

        (username,)
    )


    user = cursor.fetchone()


    cursor.close()
    connection.close()


    if user is None:

        return {
            "error":
                "Login yoki parol noto'g'ri!"
        }, 401


    if not check_password_hash(
        user["password"],
        password
    ):

        return {
            "error":
                "Login yoki parol noto'g'ri!"
        }, 401


    return {

        "message":
            "Login muvaffaqiyatli!",

        "user": {

            "id":
                user["id"],

            "name":
                user["name"],

            "username":
                user["username"],

            "contact":
                user["contact"]

        }

    }, 200


# ==========================================
# CREATE SET
# ==========================================

@app.route("/sets", methods=["POST"])
def create_set():

    data = request.get_json()

    user_id = data.get("user_id")
    date = data.get("date")
    title = data.get("title")


    if not user_id or not date or not title:

        return {
            "error":
                "Sana, mavzu va foydalanuvchi kerak!"
        }, 400


    connection = get_database()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT id
        FROM users
        WHERE id = %s
        """,

        (user_id,)
    )


    user = cursor.fetchone()


    if user is None:

        cursor.close()
        connection.close()

        return {
            "error":
                "Foydalanuvchi topilmadi!"
        }, 404


    cursor.execute(
        """
        INSERT INTO sets (
            user_id,
            date,
            title
        )

        VALUES (%s, %s, %s)

        RETURNING id
        """,

        (
            user_id,
            date,
            title
        )
    )


    set_id = cursor.fetchone()["id"]

    connection.commit()


    cursor.close()
    connection.close()


    return {

        "message":
            "Lug'at muvaffaqiyatli yaratildi!",

        "set": {

            "id":
                set_id,

            "user_id":
                user_id,

            "date":
                date,

            "title":
                title

        }

    }, 201


# ==========================================
# ADD WORD
# ==========================================

@app.route(
    "/sets/<int:set_id>/words",
    methods=["POST"]
)
def add_word_to_set(set_id):

    data = request.get_json()

    word = data.get("word")
    translation = data.get("translation")
    definition = data.get("definition")
    example = data.get("example")


    if not word or not translation:

        return {
            "error":
                "So'z va tarjima kiritilishi shart!"
        }, 400


    connection = get_database()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT id
        FROM sets
        WHERE id = %s
        """,

        (set_id,)
    )


    vocabulary_set = cursor.fetchone()


    if vocabulary_set is None:

        cursor.close()
        connection.close()

        return {
            "error":
                "Lug'at to'plami topilmadi!"
        }, 404


    cursor.execute(
        """
        INSERT INTO words (
            set_id,
            word,
            translation,
            definition,
            example
        )

        VALUES (
            %s,
            %s,
            %s,
            %s,
            %s
        )

        RETURNING id
        """,

        (
            set_id,
            word,
            translation,
            definition,
            example
        )
    )


    word_id = cursor.fetchone()["id"]

    connection.commit()


    cursor.close()
    connection.close()


    return {

        "message":
            "So'z muvaffaqiyatli qo'shildi!",

        "word": {

            "id":
                word_id,

            "set_id":
                set_id,

            "word":
                word,

            "translation":
                translation,

            "definition":
                definition,

            "example":
                example

        }

    }, 201


# ==========================================
# GET USER SETS
# ==========================================

@app.route("/sets", methods=["GET"])
def get_sets():

    user_id = request.args.get(
        "user_id"
    )


    if not user_id:

        return {
            "error":
                "Foydalanuvchi ID si kerak!"
        }, 400


    connection = get_database()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT
            sets.id,
            sets.date,
            sets.title,
            COUNT(words.id) AS word_count

        FROM sets

        LEFT JOIN words
            ON sets.id = words.set_id

        WHERE sets.user_id = %s

        GROUP BY
            sets.id,
            sets.date,
            sets.title

        ORDER BY sets.id DESC
        """,

        (user_id,)
    )


    sets = cursor.fetchall()


    cursor.close()
    connection.close()


    result = []


    for set_item in sets:

        result.append({

            "id":
                set_item["id"],

            "date":
                set_item["date"],

            "title":
                set_item["title"],

            "word_count":
                set_item["word_count"]

        })


    return {
        "sets": result
    }, 200


# ==========================================
# GET WORDS FROM SET
# ==========================================

@app.route(
    "/sets/<int:set_id>/words",
    methods=["GET"]
)
def get_words_from_set(set_id):

    user_id = request.args.get(
        "user_id"
    )


    if not user_id:

        return {
            "error":
                "Foydalanuvchi ID si kerak!"
        }, 400


    connection = get_database()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT
            id,
            user_id,
            date,
            title

        FROM sets

        WHERE id = %s
        AND user_id = %s
        """,

        (
            set_id,
            user_id
        )
    )


    vocabulary_set = cursor.fetchone()


    if vocabulary_set is None:

        cursor.close()
        connection.close()

        return {
            "error":
                "Lug‘at to‘plami topilmadi yoki sizga tegishli emas!"
        }, 404


    cursor.execute(
        """
        SELECT
            id,
            word,
            translation,
            definition,
            example

        FROM words

        WHERE set_id = %s

        ORDER BY id ASC
        """,

        (set_id,)
    )


    words = cursor.fetchall()


    cursor.close()
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


# ==========================================
# DELETE WORD
# ==========================================

@app.route(
    "/words/<int:word_id>",
    methods=["DELETE"]
)
def delete_word(word_id):

    connection = get_database()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT id
        FROM words
        WHERE id = %s
        """,

        (word_id,)
    )


    word = cursor.fetchone()


    if word is None:

        cursor.close()
        connection.close()

        return {
            "error":
                "So‘z topilmadi!"
        }, 404


    cursor.execute(
        """
        DELETE FROM words
        WHERE id = %s
        """,

        (word_id,)
    )


    connection.commit()


    cursor.close()
    connection.close()


    return {
        "message":
            "So‘z muvaffaqiyatli o‘chirildi!"
    }, 200


# ==========================================
# UPDATE WORD
# ==========================================

@app.route(
    "/words/<int:word_id>",
    methods=["PUT"]
)
def update_word(word_id):

    data = request.get_json()

    word = data.get("word")
    translation = data.get("translation")
    definition = data.get("definition")
    example = data.get("example")


    if not word or not translation:

        return {
            "error":
                "So‘z va tarjima kiritilishi shart!"
        }, 400


    connection = get_database()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT id
        FROM words
        WHERE id = %s
        """,

        (word_id,)
    )


    existing_word = cursor.fetchone()


    if existing_word is None:

        cursor.close()
        connection.close()

        return {
            "error":
                "So‘z topilmadi!"
        }, 404


    cursor.execute(
        """
        UPDATE words

        SET
            word = %s,
            translation = %s,
            definition = %s,
            example = %s

        WHERE id = %s
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


    cursor.close()
    connection.close()


    return {

        "message":
            "So‘z muvaffaqiyatli yangilandi!",

        "word": {

            "id":
                word_id,

            "word":
                word,

            "translation":
                translation,

            "definition":
                definition,

            "example":
                example

        }

    }, 200


# ==========================================
# DELETE SET
# ==========================================

@app.route(
    "/sets/<int:set_id>",
    methods=["DELETE"]
)
def delete_set(set_id):

    connection = get_database()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT id
        FROM sets
        WHERE id = %s
        """,

        (set_id,)
    )


    vocabulary_set = cursor.fetchone()


    if vocabulary_set is None:

        cursor.close()
        connection.close()

        return {
            "error":
                "Lug'at to'plami topilmadi!"
        }, 404


    cursor.execute(
        """
        DELETE FROM words
        WHERE set_id = %s
        """,

        (set_id,)
    )


    cursor.execute(
        """
        DELETE FROM sets
        WHERE id = %s
        """,

        (set_id,)
    )


    connection.commit()


    cursor.close()
    connection.close()


    return {
        "message":
            "Lug'at muvaffaqiyatli o'chirildi!"
    }, 200

# ==========================================
# LEXINOTE STATISTICS
# ==========================================
@app.route("/statistics", methods=["GET"])
def get_statistics():
    connection = get_database()
    cursor = connection.cursor()

    # =========================
    # RO‘YXATDAN O‘TGAN USERLAR
    # =========================
    cursor.execute("""
        SELECT COUNT(*) AS count
        FROM users
    """)

    registered_users =
        cursor.fetchone()["count"]

    # =========================
    # YARATILGAN LUG‘ATLAR
    # =========================
    cursor.execute("""
        SELECT COUNT(*) AS count
        FROM sets
    """)

    created_sets =
        cursor.fetchone()["count"]

    # =========================
    # SAQLANGAN SO‘ZLAR
    # =========================
    cursor.execute("""
        SELECT COUNT(*) AS count
        FROM words
    """)

    saved_words =
        cursor.fetchone()["count"]

    cursor.close()
    connection.close()

    return {

        "registered_users":
            registered_users,

        "created_sets":
            created_sets,

        "saved_words":
            saved_words

    }, 200
    
# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True
    )
