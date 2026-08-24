/* =========================
   ELEMENTLAR
========================= */

const resetForm =
    document.getElementById("reset-password-form");

const newPassword =
    document.getElementById("new-password");

const confirmPassword =
    document.getElementById("confirm-password");

const resetMessage =
    document.getElementById("reset-message");


/* =========================
   BACKEND URL
========================= */

const API_URL =
    "https://lexinote-backend.onrender.com";


/* =========================
   RESET TOKEN
========================= */

const resetToken =
    sessionStorage.getItem("resetToken");


if (!resetToken) {

    alert(
        "Parolni tiklash uchun tasdiqlash jarayoni topilmadi."
    );

    window.location.href =
        "recovery.html";

    throw new Error(
        "Reset token topilmadi."
    );
}


/* =========================
   FORM TEKSHIRISH
========================= */

if (!resetForm) {

    console.error(
        "reset-password-form topilmadi!"
    );

} else {


    /* =========================
       FORM
    ========================= */

    resetForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* =========================
               INPUTLAR
            ========================= */

            const password =
                newPassword.value;


            const confirm =
                confirmPassword.value;


            /* =========================
               BO‘SH MAYDONLAR
            ========================= */

            if (
                !password ||
                !confirm
            ) {

                resetMessage.textContent =
                    "Barcha maydonlarni to‘ldiring.";

                return;
            }


            /* =========================
               PAROL UZUNLIGI
            ========================= */

            if (
                password.length < 6
            ) {

                resetMessage.textContent =
                    "Parol kamida 6 ta belgidan iborat bo‘lishi kerak.";

                return;
            }


            /* =========================
               PAROLLARNI TEKSHIRISH
            ========================= */

            if (
                password !==
                confirm
            ) {

                resetMessage.textContent =
                    "Parollar bir xil emas.";

                return;
            }


            /* =========================
               BACKENDGA SO‘ROV
            ========================= */

            try {

                const response =
                    await fetch(
                        `${API_URL}/reset-password`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                reset_token:
                                    resetToken,

                                new_password:
                                    password

                            })
                        }
                    );


                /* =========================
                   BACKEND JAVOBI
                ========================= */

                const data =
                    await response.json();


                console.log(
                    "Reset password backend javobi:",
                    data
                );


                /* =========================
                   XATO
                ========================= */

                if (!response.ok) {

                    resetMessage.textContent =
                        data.error ||
                        "Parolni yangilashda xatolik yuz berdi.";

                    return;
                }


                /* =========================
                   MUVAFFAQIYAT
                ========================= */

                resetMessage.textContent =
                    "✓ Parol muvaffaqiyatli yangilandi!";


                /* =========================
                   RESET MA'LUMOTLARINI
                   TOZALASH
                ========================= */

                sessionStorage.removeItem(
                    "resetToken"
                );

                sessionStorage.removeItem(
                    "verifiedContact"
                );

                sessionStorage.removeItem(
                    "resetContact"
                );


                /* =========================
                   LOGIN SAHIFASI
                ========================= */

                setTimeout(
                    function () {

                        window.location.href =
                            "login.html";

                    },
                    1000
                );

            }


            /* =========================
               SERVER XATOSI
            ========================= */

            catch (error) {

                console.error(
                    "Reset password xatosi:",
                    error
                );


                resetMessage.textContent =
                    "Server bilan bog‘lanib bo‘lmadi!";

            }

        }
    );

}
