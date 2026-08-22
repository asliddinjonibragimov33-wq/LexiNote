const verifyForm =
    document.getElementById("verify-form");

const verificationCode =
    document.getElementById("verification-code");

const verifyMessage =
    document.getElementById("verify-message");


/* =========================
   RECOVERY KONTAKTINI OLISH
========================= */

const resetContact =
    sessionStorage.getItem("resetContact");


if (!resetContact) {

    alert(
        "Hisobni tiklash jarayoni topilmadi."
    );

    window.location.href =
        "recovery.html";

}


/* =========================
   FORMNI TEKSHIRISH
========================= */

if (!verifyForm) {

    console.error(
        "verify-form topilmadi!"
    );

} else {

    verifyForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const code =
                verificationCode.value.trim();


            /* =========================
               KODNI TEKSHIRISH
            ========================= */

            if (!code) {

                verifyMessage.textContent =
                    "Tasdiqlash kodini kiriting.";

                return;

            }


            if (!/^\d{6}$/.test(code)) {

                verifyMessage.textContent =
                    "Kod 6 xonali raqamdan iborat bo‘lishi kerak.";

                return;

            }


            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:5000/verify-code",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                contact:
                                    resetContact,

                                code:
                                    code

                            })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Verify backend javobi:",
                    data
                );


                /* =========================
                   XATO
                ========================= */

                if (!response.ok) {

                    verifyMessage.textContent =
                        data.error ||
                        "Tasdiqlash kodi noto‘g‘ri.";

                    return;

                }


                /* =========================
                   MUVAFFAQIYAT
                ========================= */

                /*
                   Backend token qaytarsa,
                   uni saqlab qo‘yamiz.
                */

                if (data.reset_token) {

                    sessionStorage.setItem(
                        "resetToken",
                        data.reset_token
                    );

                }


                sessionStorage.setItem(
                    "verifiedContact",
                    resetContact
                );


                verifyMessage.textContent =
                    "✓ Kod tasdiqlandi!";


                /* =========================
                   PAROLNI YANGILASH
                ========================= */

                setTimeout(
                    function () {

                        window.location.href =
                            "reset-password.html";

                    },
                    500
                );

            }


            catch (error) {

                console.error(
                    "Verify xatosi:",
                    error
                );


                verifyMessage.textContent =
                    "Server bilan bog‘lanib bo‘lmadi!";

            }

        }
    );

}