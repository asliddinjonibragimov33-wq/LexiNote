console.log("EDIT-WORD JS ISHLADI!");

/* =========================
   BACKEND URL
========================= */

const API_URL =
    "https://lexinote-backend.onrender.com";


/* =========================
   LOGIN QILGAN USER
========================= */

const currentUser =
    JSON.parse(
        sessionStorage.getItem("currentUser")
    );


if (!currentUser) {

    alert(
        "Avval tizimga kiring!"
    );

    window.location.href =
        "login.html";

    throw new Error(
        "User login qilmagan."
    );

}


console.log(
    "Edit word user:",
    currentUser
);


/* =========================
   WORD ID
========================= */

const editingWordId =
    localStorage.getItem(
        "editingWordId"
    );


if (!editingWordId) {

    alert(
        "Tahrirlanadigan lug‘at topilmadi."
    );

    window.location.href =
        "my-words.html";

    throw new Error(
        "editingWordId topilmadi."
    );

}


/* =========================
   SET ID
========================= */

const selectedSetId =
    localStorage.getItem(
        "selectedSetId"
    );


if (!selectedSetId) {

    alert(
        "Lug‘at to‘plami topilmadi."
    );

    window.location.href =
        "my-words.html";

    throw new Error(
        "selectedSetId topilmadi."
    );

}


/* =========================
   ELEMENTLAR
========================= */

const editWordForm =
    document.getElementById(
        "edit-word-form"
    );


const wordInput =
    document.getElementById(
        "edit-word"
    );


const translationInput =
    document.getElementById(
        "edit-translation"
    );


const definitionInput =
    document.getElementById(
        "edit-definition"
    );


const exampleInput =
    document.getElementById(
        "edit-example"
    );


/* =========================
   ELEMENTLARNI TEKSHIRISH
========================= */

if (
    !editWordForm ||
    !wordInput ||
    !translationInput ||
    !definitionInput ||
    !exampleInput
) {

    console.error(
        "Edit word elementlaridan biri topilmadi."
    );

    throw new Error(
        "HTML elementlari topilmadi."
    );

}


/* =========================
   BACKENDDAN SO‘ZNI OLISH
========================= */

async function loadWord() {

    console.log(
        "Tahrirlanadigan word ID:",
        editingWordId
    );


    console.log(
        "Tanlangan set ID:",
        selectedSetId
    );


    try {

        /* =========================
           LOADING
        ========================= */

        wordInput.disabled = true;

        translationInput.disabled = true;

        definitionInput.disabled = true;

        exampleInput.disabled = true;


        const response =
            await fetch(
                `${API_URL}/sets/${encodeURIComponent(selectedSetId)}/words?user_id=${encodeURIComponent(currentUser.id)}`
            );


        console.log(
            "Load word response:",
            response
        );


        const data =
            await response.json();


        console.log(
            "Tahrirlash uchun backenddan:",
            data
        );


        /* =========================
           BACKEND XATOSI
        ========================= */

        if (!response.ok) {

            alert(
                data.error ||
                "So‘zlarni yuklashda xatolik!"
            );

            window.location.href =
                "view-words.html";

            return;

        }


        /* =========================
           WORDS TEKSHIRISH
        ========================= */

        const words =
            Array.isArray(data.words)
                ? data.words
                : [];


        const word =
            words.find(
                function (item) {

                    return String(item.id) ===
                        String(editingWordId);

                }
            );


        /* =========================
           SO‘Z TOPILMADI
        ========================= */

        if (!word) {

            alert(
                "Tahrirlanadigan so‘z topilmadi!"
            );

            window.location.href =
                "view-words.html";

            return;

        }


        /* =========================
           INPUTLARNI TO‘LDIRISH
        ========================= */

        wordInput.value =
            word.word || "";


        translationInput.value =
            word.translation || "";


        definitionInput.value =
            word.definition || "";


        exampleInput.value =
            word.example || "";


        /* =========================
           INPUTLARNI YOQISH
        ========================= */

        wordInput.disabled = false;

        translationInput.disabled = false;

        definitionInput.disabled = false;

        exampleInput.disabled = false;


    } catch (error) {

        console.error(
            "Load word error:",
            error
        );


        alert(
            "Server bilan bog‘lanib bo‘lmadi!"
        );


        window.location.href =
            "view-words.html";

    }

}


/* =========================
   SO‘ZNI YANGILASH
========================= */

editWordForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        /* =========================
           INPUTLARDAN MA'LUMOT OLISH
        ========================= */

        const word =
            wordInput.value.trim();


        const translation =
            translationInput.value.trim();


        const definition =
            definitionInput.value.trim();


        const example =
            exampleInput.value.trim();


        /* =========================
           TEKSHIRISH
        ========================= */

        if (
            !word ||
            !translation
        ) {

            alert(
                "So‘z va tarjimasini kiriting."
            );

            return;

        }


        /* =========================
           SAQLASH TUGMASINI TOPISH
        ========================= */

        const submitButton =
            editWordForm.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.disabled =
                true;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/words/${encodeURIComponent(editingWordId)}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            word:
                                word,

                            translation:
                                translation,

                            definition:
                                definition,

                            example:
                                example

                        })

                    }
                );


            const data =
                await response.json();


            console.log(
                "Yangilash javobi:",
                data
            );


            /* =========================
               XATO
            ========================= */

            if (!response.ok) {

                alert(
                    data.error ||
                    "So‘zni yangilashda xatolik!"
                );


                if (submitButton) {

                    submitButton.disabled =
                        false;

                }


                return;

            }


            /* =========================
               MUVAFFAQIYAT
            ========================= */

            alert(
                data.message ||
                "So‘z muvaffaqiyatli yangilandi!"
            );


            /* =========================
               EDITING ID NI TOZALASH
            ========================= */

            localStorage.removeItem(
                "editingWordId"
            );


            /* =========================
               SET ID QOLADI
            ========================= */

            localStorage.setItem(
                "selectedSetId",
                selectedSetId
            );


            /* =========================
               ORQAGA QAYTISH
            ========================= */

            window.location.href =
                "view-words.html";


        } catch (error) {

            console.error(
                "Update word error:",
                error
            );


            alert(
                "Server bilan bog‘lanib bo‘lmadi!"
            );


            if (submitButton) {

                submitButton.disabled =
                    false;

            }

        }

    }
);


/* =========================
   BOSHLASH
========================= */

loadWord();
