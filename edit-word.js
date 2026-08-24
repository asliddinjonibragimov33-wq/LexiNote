/* =========================
   LOGIN TEKSHIRISH
========================= */

if (!currentUser) {

    alert("Avval tizimga kiring!");

    window.location.href =
        "login.html";

}


/* =========================
   WORD ID
========================= */

const editingWordId =
    localStorage.getItem("editingWordId");


if (!editingWordId) {

    alert(
        "Tahrirlanadigan lug‘at topilmadi."
    );

    window.location.href =
        "my-words.html";

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
   BACKENDDAN SO‘ZNI TOPISH
========================= */

async function loadWord() {

    try {

        const setId =
            localStorage.getItem(
                "selectedSetId"
            );


        if (!setId) {

            alert(
                "Lug‘at to‘plami topilmadi."
            );

            window.location.href =
                "my-words.html";

            return;
        }


        const response =
            await fetch(
                `https://lexinote-backend.onrender.com/sets/${setId}/words?user_id=${currentUser.id}`
            );


        const data =
            await response.json();


        console.log(
            "Tahrirlash uchun backenddan:",
            data
        );


        if (!response.ok) {

            alert(
                data.error ||
                "So‘zlarni yuklashda xatolik!"
            );

            return;
        }


        const word =
            data.words.find(
                function(item) {

                    return (
                        item.id ==
                        editingWordId
                    );

                }
            );


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
            word.word;


        translationInput.value =
            word.translation;


        definitionInput.value =
            word.definition || "";


        exampleInput.value =
            word.example || "";


    } catch (error) {

        console.error(
            "Load word error:",
            error
        );


        alert(
            "Server bilan bog‘lanib bo‘lmadi!"
        );

    }

}


/* =========================
   SAQLASH
========================= */

editWordForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


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


        try {

            const response =
                await fetch(
                    `https://lexinote-backend.onrender.com/words/${editingWordId}`,
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


            if (!response.ok) {

                alert(
                    data.error ||
                    "So‘zni yangilashda xatolik!"
                );

                return;
            }


            alert(
                data.message
            );


            /* =========================
               TOZALASH
            ========================= */

            localStorage.removeItem(
                "editingWordId"
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

        }

    }
);


/* =========================
   BOSHLASH
========================= */

loadWord();
