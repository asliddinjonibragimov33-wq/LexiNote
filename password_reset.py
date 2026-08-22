from flask import Blueprint, request
from werkzeug.security import generate_password_hash
import sqlite3
import secrets
from datetime import datetime, timedelta
import os
import requests
from dotenv import load_dotenv


load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_NAME = os.getenv("SENDER_NAME", "LexiNote")
# ==========================================
# PASSWORD RESET BLUEPRINT
# ==========================================

password_reset = Blueprint(
    "password_reset",
    __name__
)


# ==========================================
# DATABASE
# ==========================================

def get_database():

    connection = sqlite3.connect(
        "vocabulary.db"
    )

    connection.row_factory = sqlite3.Row

    return connection


# ==========================================
# RESET CODES TABLE
# ==========================================

def create_reset_table():

    connection = get_database()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS password_resets (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER NOT NULL,

            code TEXT NOT NULL,

            reset_token TEXT,

            expires_at TEXT NOT NULL,

            verified INTEGER DEFAULT 0,

            created_at TIMESTAMP
                DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    """)

    connection.commit()

    connection.close()


create_reset_table()


# ==========================================
# 1. FORGOT PASSWORD
# ==========================================
def send_reset_code_email(
    recipient_email,
    code
):

    url = "https://api.brevo.com/v3/smtp/email"

    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }

    data = {

        "sender": {
            "name": SENDER_NAME,
            "email": SENDER_EMAIL
        },

        "to": [
            {
                "email": recipient_email
            }
        ],

        "subject":
            "LexiNote — Tasdiqlash kodi",

        "htmlContent": f"""
        <html>
            <body>

                <h2>LexiNote</h2>

                <p>
                    Hisobingizni tiklash uchun
                    tasdiqlash kodingiz:
                </p>

                <h1>
                    {code}
                </h1>

                <p>
                    Ushbu kod 10 daqiqa davomida amal qiladi.
                </p>

                <p>
                    Agar bu so‘rovni siz yubormagan
                    bo‘lsangiz, ushbu xabarni e'tiborsiz qoldiring.
                </p>

            </body>
        </html>
        """
    }

    response = requests.post(
        url,
        headers=headers,
        json=data
    )

    return response

@password_reset.route(
    "/forgot-password",
    methods=["POST"]
)


def forgot_password():

    data = request.get_json()

    contact = data.get("contact")


    if not contact:

        return {
            "error":
                "Email yoki telefon raqamini kiriting!"
        }, 400


    connection = get_database()


    user = connection.execute(
        """
        SELECT
            id,
            name,
            email,
            contact,
            username
        FROM users
        WHERE email = ?
           OR contact = ?
        """,
        (
            contact,
            contact
        )
    ).fetchone()


    if user is None:

        connection.close()

        return {
            "error":
                "Bunday foydalanuvchi topilmadi!"
        }, 404


    # ======================================
    # 6 XONALI TASDIQLASH KODI
    # ======================================

    code = str(
        secrets.randbelow(1000000)
    ).zfill(6)


    # ======================================
    # RESET TOKEN
    # ======================================

    reset_token = secrets.token_urlsafe(32)


    # ======================================
    # KODNING AMAL QILISH VAQTI
    # 10 DAQIQA
    # ======================================

    expires_at = (
        datetime.now()
        + timedelta(minutes=10)
    ).isoformat()


    # Eski reset kodlarini o'chirish

    connection.execute(
        """
        DELETE FROM password_resets
        WHERE user_id = ?
        """,
        (user["id"],)
    )


    # Yangi kodni saqlash

    connection.execute(
        """
        INSERT INTO password_resets (
            user_id,
            code,
            reset_token,
            expires_at
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            user["id"],
            code,
            reset_token,
            expires_at
        )
    )


    connection.commit()

    connection.close()


    if "@" in contact:

        email_response = send_reset_code_email(
        contact,
        code
    )

    if "@" in contact:

        email_response = send_reset_code_email(
            contact,
            code
        )

    if email_response.status_code not in [200, 201, 202]:

        print(
            "Brevo xatosi:",
            email_response.text
        )

        return {
            "error":
                "Tasdiqlash kodini emailga yuborib bo‘lmadi!"
        }, 500

    return {

        "message":
            "Tasdiqlash kodi yaratildi!",

        "contact":
            contact

    }, 200


# ==========================================
# 2. VERIFY CODE
# ==========================================

@password_reset.route(
    "/verify-code",
    methods=["POST"]
)
def verify_code():

    data = request.get_json()

    contact = data.get("contact")

    code = data.get("code")


    if not contact or not code:

        return {
            "error":
                "Kontakt va tasdiqlash kodi kerak!"
        }, 400


    connection = get_database()


    user = connection.execute(
        """
        SELECT id
        FROM users
        WHERE email = ?
           OR contact = ?
        """,
        (
            contact,
            contact
        )
    ).fetchone()


    if user is None:

        connection.close()

        return {
            "error":
                "Foydalanuvchi topilmadi!"
        }, 404


    reset = connection.execute(
        """
        SELECT *
        FROM password_resets
        WHERE user_id = ?
          AND code = ?
          AND verified = 0
        ORDER BY id DESC
        LIMIT 1
        """,
        (
            user["id"],
            code
        )
    ).fetchone()


    if reset is None:

        connection.close()

        return {
            "error":
                "Tasdiqlash kodi noto‘g‘ri!"
        }, 400


    # ======================================
    # KOD MUDDATINI TEKSHIRISH
    # ======================================

    expires_at = datetime.fromisoformat(
        reset["expires_at"]
    )


    if datetime.now() > expires_at:

        connection.close()

        return {
            "error":
                "Tasdiqlash kodi muddati tugagan!"
        }, 400


    # ======================================
    # KOD TASDIQLANDI
    # ======================================

    connection.execute(
        """
        UPDATE password_resets
        SET verified = 1
        WHERE id = ?
        """,
        (reset["id"],)
    )


    connection.commit()

    connection.close()


    return {

        "message":
            "Tasdiqlash kodi to‘g‘ri!",

        "reset_token":
            reset["reset_token"]

    }, 200


# ==========================================
# 3. RESET PASSWORD
# ==========================================

@password_reset.route(
    "/reset-password",
    methods=["POST"]
)
def reset_password():

    data = request.get_json()

    reset_token =data.get("reset_token")
    new_password =data.get("new_password")


    if not reset_token or not new_password:

        return {
            "error":
                "Reset token va yangi parol kerak!"
        }, 400


    if len(new_password) < 6:

        return {
            "error":
                "Parol kamida 6 ta belgidan iborat bo‘lishi kerak!"
        }, 400


    connection = get_database()


    reset = connection.execute(
        """
        SELECT *
        FROM password_resets
        WHERE reset_token = ?
          AND verified = 1
        ORDER BY id DESC
        LIMIT 1
        """,
        (reset_token,)
    ).fetchone()


    if reset is None:

        connection.close()

        return {
            "error":
                "Reset token noto‘g‘ri yoki yaroqsiz!"
        }, 400


    # ======================================
    # TOKEN MUDDATINI TEKSHIRISH
    # ======================================

    expires_at = datetime.fromisoformat(
        reset["expires_at"]
    )


    if datetime.now() > expires_at:

        connection.close()

        return {
            "error":
                "Reset token muddati tugagan!"
        }, 400


    # ======================================
    # YANGI PAROLNI HASHLASH
    # ======================================

    hashed_password =generate_password_hash(
            new_password
        )


    # ======================================
    # PAROLNI YANGILASH
    # ======================================

    connection.execute(
        """
        UPDATE users
        SET password = ?
        WHERE id = ?
        """,
        (
            hashed_password,
            reset["user_id"]
        )
    )


    # Tokenni qayta ishlatib bo'lmasligi uchun
    # reset yozuvini o'chiramiz

    connection.execute(
        """
        DELETE FROM password_resets
        WHERE id = ?
        """,
        (reset["id"],)
    )


    connection.commit()

    connection.close()


    return {

        "message":
            "Parol muvaffaqiyatli yangilandi!"

    }, 200