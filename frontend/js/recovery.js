/* =========================
   ELEMENTLAR
========================= */

const recoveryForm =
    document.getElementById("recovery-form");

const contactInput =
    document.getElementById("contact");

const recoveryMessage =
    document.getElementById("recovery-message");


/* =========================
   BACKEND URL
========================= */

const API_URL =
    "https://lexinote-backend.onrender.com";


/* =========================
   FORMNI TEKSHIRISH
========================= */

if (!recoveryForm) {

    console.error(
        "recovery-form topilmadi!"
    );

} else {


    /* =========================
       RECOVERY FORM
    ========================= */

    recoveryForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* =========================
               CONTACT
            ========================= */

            const contact =
                contactInput.value.trim();


            /* =========================
               BO‘SH MAYDON
            ========================= */

            if (!contact) {

                recoveryMessage.textContent =
                    "Email yoki telefon raqamingizni kiriting.";

                return;
            }


            /* =========================
               BACKENDGA SO‘ROV
            ========================= */

            try {

                const response =
                    await fetch(
                        `${API_URL}/forgot-password`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                contact:
                                    contact

                            })
                        }
                    );


                /* =========================
                   BACKEND JAVOBI
                ========================= */

                const data =
                    await response.json();


                console.log(
                    "Recovery backend javobi:",
                    data
                );


                /* =========================
                   XATO
                ========================= */

                if (!response.ok) {

                    recoveryMessage.textContent =
                        data.error ||
                        "Xatolik yuz berdi.";

                    return;
                }


                /* =========================
                   CONTACTNI SAQLASH
                ========================= */

                sessionStorage.setItem(
                    "resetContact",
                    contact
                );


                /* =========================
                   MUVAFFAQIYAT
                ========================= */

                recoveryMessage.textContent =
                    "Tasdiqlash kodi yuborildi!";


                /* =========================
                   VERIFY SAHIFASI
                ========================= */

                setTimeout(
                    function () {

                        window.location.href =
                            "verify.html";

                    },
                    500
                );

            }


            /* =========================
               SERVER XATOSI
            ========================= */

            catch (error) {

                console.error(
                    "Recovery xatosi:",
                    error
                );


                recoveryMessage.textContent =
                    "Server bilan bog‘lanib bo‘lmadi!";

            }

        }
    );

}
