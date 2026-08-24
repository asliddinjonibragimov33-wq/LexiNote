const recoveryForm = document.getElementById("recovery-form");

const contactInput = document.getElementById("contact");

const recoveryMessage =
    document.getElementById("recovery-message");


/* =========================
   FORMNI TEKSHIRISH
========================= */

if (!recoveryForm) {

    console.error(
        "recovery-form topilmadi!"
    );

} else {

    recoveryForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const contact =
                contactInput.value.trim();


            if (!contact) {

                recoveryMessage.textContent =
                    "Email yoki telefon raqamingizni kiriting.";

                return;
            }


            try {

                const response =
                    await fetch(
                        "https://lexinote-backend.onrender.com/forgot-password",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                contact: contact
                            })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Backend javobi:",
                    data
                );


                if (!response.ok) {

                    recoveryMessage.textContent =
                        data.error ||
                        "Xatolik yuz berdi.";

                    return;
                }


                /* =========================
                   KONTAKTNI SAQLASH
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


                /*
                   VERIFY.HTML GA O‘TISH
                */

                setTimeout(
                    function () {

                        window.location.href =
                            "verify.html";

                    },
                    500
                );

            }

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
