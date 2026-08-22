
from flask import Blueprint, request
from werkzeug.security import generate_password_hash

import secrets
from datetime import datetime, timedelta
import os
import requests

from database import get_database


# ==========================================
# ENVIRONMENT VARIABLES
# ==========================================

BREVO_API_KEY = os.getenv("BREVO_API_KEY")

SENDER_EMAIL = os.getenv("SENDER_EMAIL")

SENDER_NAME = os.getenv(
    "SENDER_NAME",
    "LexiNote"
)


# ==========================================
# PASSWORD RESET BLUEPRINT
# ==========================================

password_reset = Blueprint(
    "password_reset",
    __name__
)


# ==========================================
# RESET CODES TABLE
# ==========================================

def create_reset_table():

    connection = get_database()

    cursor = connection.cursor()

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
# EMAIL YUBORISH
# ==========================================

def send_reset_code_email(
    recipient_email,
    code
):

    url = (
        "https://api.brevo.com/v3/smtp/email"
    )

    headers = {

        "accept":
            "application/json",

        "api-key":
            BREVO_API_KEY,

        "content-type":
            "application/json"
    }

    data = {

        "sender": {

            "name":
                SENDER_NAME,

            "email":
                SENDER_EMAIL
        },

        "to": [

            {
                "email":
                    recipient_email
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
                    Ushbu kod 10 daqiqa
                    davomida amal qiladi.
                </p>

                <p>
                    Agar bu so‘rovni siz yubormagan
                    bo‘lsangiz, ushbu xabarni
                    e'tiborsiz qoldiring.
                </p>

            </body>
        </html>
        """
    }

    response = requests.post(

        url,

        headers=headers,

        json=data,

        timeout=15
    )

    return response


# ==========================================
# 1. FORGOT PASSWORD
# ==========================================

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

    cursor = connection.cursor()


    # ======================================
    # FOYDALANUVCHINI TOPISH
    # ======================================

    cursor.execute(
        """
        SELECT
            id,
            name,
            email,
            contact,
            username

        FROM users

        WHERE email = %s
           OR contact = %s
        """,

        (
            contact,
            contact
        )
    )


    user = cursor.fetchone()


    if user is None:

        cursor.close()
        connection.close()

        return {

            "error":
                "Bunday foydalanuvchi topilmadi!"

        }, 404


    # ======================================
    # 6 XONALI KOD
    # ======================================

    code = str(
        secrets.randbelow(1000000)
    ).zfill(6)


    # ======================================
    # RESET TOKEN
    # ======================================

    reset_token = secrets.token_urlsafe(
        32
    )


    # ======================================
    # 10 DAQIQA
    # ======================================

    expires_at = (

        datetime.now()
        + timedelta(minutes=10)

    )


    # ======================================
    # ESKI RESETLARNI O'CHIRISH
    # ======================================

    cursor.execute(
        """
        DELETE FROM password_resets

        WHERE user_id = %s
        """,

        (user["id"],)
    )


    # ======================================
    # YANGI RESETNI SAQLASH
    # ======================================

    cursor.execute(
        """
        INSERT INTO password_resets (

            user_id,
            code,
            reset_token,
            expires_at

        )

        VALUES (%s, %s, %s, %s)
        """,

        (
            user["id"],
            code,
            reset_token,
            expires_at
        )
    )


    connection.commit()


    cursor.close()
    connection.close()


    # ======================================
    # EMAIL YUBORISH
    # ======================================

    if "@" in contact:

        try:

            email_response = (
                send_reset_code_email(
                    contact,
                    code
                )
            )

        except Exception as error:

            print(
                "Brevo connection error:",
                error
            )

            return {

                "error":
                    "Email yuborishda xatolik yuz berdi!"

            }, 500


        if email_response.status_code not in [
            200,
            201,
            202
        ]:

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
            "Tasdiqlash kodi yuborildi!",

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

    cursor = connection.cursor()


    # ======================================
    # FOYDALANUVCHI
    # ======================================

    cursor.execute(
        """
        SELECT id

        FROM users

        WHERE email = %s
           OR contact = %s
        """,

        (
            contact,
            contact
        )
    )


    user = cursor.fetchone()


    if user is None:

        cursor.close()
        connection.close()

        return {

            "error":
                "Foydalanuvchi topilmadi!"

        }, 404


    # ======================================
    # RESET KOD
    # ======================================

    cursor.execute(
        """
        SELECT *

        FROM password_resets

        WHERE user_id = %s
          AND code = %s
          AND verified = 0

        ORDER BY id DESC

        LIMIT 1
        """,

        (
            user["id"],
            code
        )
    )


    reset = cursor.fetchone()


    if reset is None:

        cursor.close()
        connection.close()

        return {

            "error":
                "Tasdiqlash kodi noto‘g‘ri!"

        }, 400


    # ======================================
    # KOD MUDDATI
    # ======================================

    expires_at = reset[
        "expires_at"
    ]


    if datetime.now() > expires_at:

        cursor.close()
        connection.close()

        return {

            "error":
                "Tasdiqlash kodi muddati tugagan!"

        }, 400


    # ======================================
    # TASDIQLASH
    # ======================================

    cursor.execute(
        """
        UPDATE password_resets

        SET verified = 1

        WHERE id = %s
        """,

        (reset["id"],)
    )


    connection.commit()


    cursor.close()
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

    reset_token = data.get(
        "reset_token"
    )

    new_password = data.get(
        "new_password"
    )


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

    cursor = connection.cursor()


    # ======================================
    # RESET TOKEN
    # ======================================

    cursor.execute(
        """
        SELECT *

        FROM password_resets

        WHERE reset_token = %s
          AND verified = 1

        ORDER BY id DESC

        LIMIT 1
        """,

        (reset_token,)
    )


    reset = cursor.fetchone()


    if reset is None:

        cursor.close()
        connection.close()

        return {

            "error":
                "Reset token noto‘g‘ri yoki yaroqsiz!"

        }, 400


    # ======================================
    # TOKEN MUDDATI
    # ======================================

    expires_at = reset[
        "expires_at"
    ]


    if datetime.now() > expires_at:

        cursor.close()
        connection.close()

        return {

            "error":
                "Reset token muddati tugagan!"

        }, 400


    # ======================================
    # YANGI PAROLNI HASHLASH
    # ======================================

    hashed_password = (
        generate_password_hash(
            new_password
        )
    )


    # ======================================
    # PAROLNI YANGILASH
    # ======================================

    cursor.execute(
        """
        UPDATE users

        SET password = %s

        WHERE id = %s
        """,

        (
            hashed_password,
            reset["user_id"]
        )
    )


    # ======================================
    # TOKENNI O'CHIRISH
    # ======================================

    cursor.execute(
        """
        DELETE FROM password_resets

        WHERE id = %s
        """,

        (reset["id"],)
    )


    connection.commit()


    cursor.close()
    connection.close()


    return {

        "message":
            "Parol muvaffaqiyatli yangilandi!"

    }, 200


# ==========================================
# INITIALIZE RESET TABLE
# ==========================================

create_reset_table()

