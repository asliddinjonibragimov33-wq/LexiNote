/* =========================
   LOGIN FORM
========================= */

const loginForm =
    document.getElementById("loginForm");


/* =========================
   BACKEND URL
========================= */

const API_URL =
    "https://lexinote-backend.onrender.com";


/* =========================
   LOGIN
========================= */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        /* =========================
           INPUTLAR
        ========================= */

        const username =
            document
                .getElementById("username")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        /* =========================
           BO‘SH MAYDONLAR
        ========================= */

        if (!username || !password) {

            alert(
                "Login va parolni kiriting!"
            );

            return;
        }


        /* =========================
           BACKENDGA SO‘ROV
        ========================= */

        try {

            const response =
                await fetch(
                    `${API_URL}/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            username:
                                username,

                            password:
                                password

                        })
                    }
                );


            /* =========================
               JSON JAVOB
            ========================= */

            const result =
                await response.json();


            console.log(
                "Login backend javobi:",
                result
            );


            /* =========================
               LOGIN MUVAFFAQIYATLI
            ========================= */

            if (response.ok) {

                /* =========================
                   USERNI SAQLASH
                ========================= */

                sessionStorage.setItem(
                    "currentUser",
                    JSON.stringify(
                        result.user
                    )
                );


                alert(
                    "Kirish muvaffaqiyatli!"
                );


                /* =========================
                   DASHBOARD
                ========================= */

                window.location.href =
                    "dashboard.html";

            }


            /* =========================
               LOGIN XATO
            ========================= */

            else {

                alert(
                    result.error ||
                    "Login yoki parol noto‘g‘ri!"
                );

            }

        }


        /* =========================
           SERVER XATOSI
        ========================= */

        catch (error) {

            console.error(
                "Login xatosi:",
                error
            );


            alert(
                "Server bilan bog‘lanib bo‘lmadi!"
            );

        }

    }
);
