/* =========================
   SET FORM
========================= */

const setForm =
    document.getElementById("set-form");


/* =========================
   FORMNI TEKSHIRISH
========================= */

if (!setForm) {

    console.error(
        "set-form topilmadi!"
    );

} else {

    setForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* =========================
               INPUTLAR
            ========================= */

            const date =
                document
                    .getElementById("word-date")
                    .value;


            const title =
                document
                    .getElementById("word-title")
                    .value
                    .trim();


            /* =========================
               MAYDONLARNI TEKSHIRISH
            ========================= */

            if (!date || !title) {

                alert(
                    "Iltimos, sana va mavzuni kiriting."
                );

                return;

            }


            /* =========================
               LOGIN QILGAN USER
            ========================= */

            const currentUser =
                JSON.parse(
                    sessionStorage.getItem(
                        "currentUser"
                    )
                );


            if (!currentUser) {

                alert(
                    "Avval tizimga kiring!"
                );

                window.location.href =
                    "login.html";

                return;

            }


            /* =========================
               USER ID TEKSHIRISH
            ========================= */

            if (!currentUser.id) {

                console.error(
                    "currentUser:",
                    currentUser
                );

                alert(
                    "Foydalanuvchi ma'lumotlari noto‘g‘ri."
                );

                sessionStorage.removeItem(
                    "currentUser"
                );

                window.location.href =
                    "login.html";

                return;

            }


            /* =========================
               BACKENDGA SO‘ROV
            ========================= */

            try {

                const response =
                    await fetch(
                        "https://lexinote-backend.onrender.com/sets",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                user_id:
                                    currentUser.id,

                                date:
                                    date,

                                title:
                                    title

                            })

                        }
                    );


                /* =========================
                   BACKEND JAVOBI
                ========================= */

                const result =
                    await response.json();


                console.log(
                    "Set yaratish javobi:",
                    result
                );


                /* =========================
                   XATOLIK
                ========================= */

                if (!response.ok) {

                    alert(
                        result.error ||
                        "Lug‘at yaratishda xatolik!"
                    );

                    return;

                }


                /* =========================
                   SET TEKSHIRISH
                ========================= */

                if (!result.set) {

                    console.error(
                        "Backend noto‘g‘ri javob qaytardi:",
                        result
                    );

                    alert(
                        "Serverdan kutilgan ma'lumot kelmadi."
                    );

                    return;

                }


                /* =========================
                   CURRENT SET
                ========================= */

                const currentSet = {

                    id:
                        result.set.id,

                    date:
                        result.set.date,

                    title:
                        result.set.title,

                    user_id:
                        result.set.user_id,

                    words:
                        []

                };


                /* =========================
                   LOCAL STORAGE
                ========================= */

                localStorage.setItem(
                    "currentSet",
                    JSON.stringify(
                        currentSet
                    )
                );


                /* =========================
                   MUVAFFAQIYAT
                ========================= */

                alert(
                    "Lug‘at to‘plami yaratildi!"
                );


                /* =========================
                   KEYINGI SAHIFA
                ========================= */

                window.location.href =
                    "add-words.html";


            } catch (error) {

                console.error(
                    "Set yaratish xatosi:",
                    error
                );


                alert(
                    "Server bilan bog‘lanib bo‘lmadi. Internet yoki Render serverini tekshiring."
                );

            }

        }
    );

}
