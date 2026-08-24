/* =========================
   REGISTER FORM
========================= */

const registerForm =
    document.getElementById("registerForm");


/* =========================
   BACKEND URL
========================= */

const API_URL =
    "https://lexinote-backend.onrender.com";


/* =========================
   REGISTER
========================= */

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        /* =========================
           INPUTLAR
        ========================= */

        const name =
            document
                .getElementById("name")
                .value
                .trim();


        const contact =
            document
                .getElementById("contact")
                .value
                .trim();


        const username =
            document
                .getElementById("username")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        const confirmPassword =
            document
                .getElementById("confirm-password")
                .value;


        /* =========================
           BO‘SH MAYDONLAR
        ========================= */

        if (
            !name ||
            !contact ||
            !username ||
            !password ||
            !confirmPassword
        ) {

            alert(
                "Iltimos, barcha maydonlarni to‘ldiring!"
            );

            return;
        }


        /* =========================
           PAROLNI TEKSHIRISH
        ========================= */

        if (
            password !==
            confirmPassword
        ) {

            alert(
                "Parollar bir xil emas!"
            );

            return;
        }


        /* =========================
           PAROL UZUNLIGI
        ========================= */

        if (
            password.length < 6
        ) {

            alert(
                "Parol kamida 6 ta belgidan iborat bo‘lishi kerak!"
            );

            return;
        }


        /* =========================
           BACKENDGA SO‘ROV
        ========================= */

        try {

            const response =
                await fetch(
                    `${API_URL}/register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name:
                                name,

                            contact:
                                contact,

                            username:
                                username,

                            password:
                                password

                        })
                    }
                );


            /* =========================
               BACKEND JAVOBI
            ========================= */

            const result =
                await response.json();


            console.log(
                "Register backend javobi:",
                result
            );


            /* =========================
               MUVAFFAQIYAT
            ========================= */

            if (response.ok) {

                alert(
                    "Ro'yxatdan o'tish muvaffaqiyatli!"
                );


                /* =========================
                   LOGIN SAHIFASIGA
                ========================= */

                window.location.href =
                    "login.html";

            }


            /* =========================
               XATO
            ========================= */

            else {

                alert(
                    result.error ||
                    "Ro'yxatdan o'tishda xatolik yuz berdi!"
                );

            }

        }


        /* =========================
           SERVER XATOSI
        ========================= */

        catch (error) {

            console.error(
                "Register xatosi:",
                error
            );


            alert(
                "Server bilan bog‘lanib bo‘lmadi!"
            );

        }

    }
);
