/* =========================
   WORD QUIZ
   ========================= */

console.log("WORD-QUIZ JS ISHLADI!");

/* =========================
   BACKEND URL
========================= */

const API_URL =
    "https://lexinote-backend.onrender.com";


/* =========================
   ELEMENTLAR
========================= */

const quizSetsList =
    document.getElementById("quiz-sets-list");


/* =========================
   ELEMENT TEKSHIRISH
========================= */

if (!quizSetsList) {

    console.error(
        "quiz-sets-list topilmadi!"
    );

}


/* =========================
   LOGIN QILGAN USER
========================= */

/*
   navbar.js ham currentUser bilan ishlaydi.
   Bu faylda esa uni qayta o‘zimiz olamiz.
*/

let quizUser = null;

try {

    quizUser = JSON.parse(
        sessionStorage.getItem("currentUser")
    );

} catch (error) {

    console.error(
        "currentUser JSON xatosi:",
        error
    );

}


/* =========================
   LOGIN TEKSHIRISH
========================= */

if (
    !quizUser ||
    !quizUser.id
) {

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
    "Quiz user:",
    quizUser
);

console.log(
    "Quiz user ID:",
    quizUser.id
);


/* =========================
   BACKENDDAN SETLARNI OLISH
========================= */

async function loadQuizSets() {

    console.log(
        "loadQuizSets() ishga tushdi!"
    );


    try {

        const response =
            await fetch(
                `${API_URL}/sets?user_id=${encodeURIComponent(quizUser.id)}`
            );


        console.log(
            "Quiz sets response:",
            response
        );


        const data =
            await response.json();


        console.log(
            "Quiz uchun backenddan kelgan setlar:",
            data
        );


        /* =========================
           SERVER JAVOBINI TEKSHIRISH
        ========================= */

        if (!response.ok) {

            alert(
                data.error ||
                "Lug‘atlarni yuklashda xatolik!"
            );

            return;
        }


        /* =========================
           SETLARNI KO‘RSATISH
        ========================= */

        displayQuizSets(
            data.sets || []
        );


    } catch (error) {

        console.error(
            "Quiz sets yuklash xatosi:",
            error
        );


        alert(
            "Server bilan bog‘lanib bo‘lmadi!"
        );

    }

}


/* =========================
   SETLARNI KO‘RSATISH
========================= */

function displayQuizSets(sets) {

    if (!quizSetsList) {
        return;
    }


    quizSetsList.innerHTML = "";


    /* =========================
       SETLAR MAVJUD EMAS
    ========================= */

    if (
        !sets ||
        sets.length === 0
    ) {

        quizSetsList.innerHTML = `

            <div class="quiz-empty">

                <div>
                    📚
                </div>

                <h3>
                    Hali lug‘atlaringiz yo‘q
                </h3>

                <p>
                    Avval lug‘at to‘plamini yarating.
                </p>

                <a
                    href="add-word.html"
                >
                    + Lug‘at yaratish
                </a>

            </div>

        `;

        return;
    }


    /* =========================
       SETLARNI CHIQARISH
    ========================= */

    sets.forEach(
        function(set) {

            const card =
                document.createElement("div");


            card.className =
                "quiz-set-card";


            /* =========================
               CARD
            ========================= */

            card.innerHTML = `

                <div class="quiz-set-icon">
                    📚
                </div>

                <div class="quiz-set-info">

                    <h3></h3>

                    <p></p>

                </div>

                <div class="quiz-set-arrow">
                    →
                </div>

            `;


            /*
               innerHTML orqali title qo‘yish o‘rniga
               textContent ishlatamiz.
            */

            const titleElement =
                card.querySelector(
                    ".quiz-set-info h3"
                );


            const infoElement =
                card.querySelector(
                    ".quiz-set-info p"
                );


            titleElement.textContent =
                set.title || "Nomsiz lug‘at";


            infoElement.textContent =
                `📅 ${formatDate(set.date)} · ${Number(set.word_count) || 0} ta lug‘at`;


            /* =========================
               SETNI BOSISH
            ========================= */

            card.addEventListener(
                "click",
                async function() {

                    const wordCount =
                        Number(set.word_count) || 0;


                    /* =========================
                       BO‘SH SET
                    ========================= */

                    if (
                        wordCount === 0
                    ) {

                        alert(
                            "Bu to‘plamda hali lug‘atlar mavjud emas."
                        );

                        return;
                    }


                    /* =========================
                       SETNI OCHISH
                    ========================= */

                    console.log(
                        "Tanlangan set ID:",
                        set.id
                    );


                    console.log(
                        "Quiz user ID:",
                        quizUser.id
                    );


                    try {

                        const response =
                            await fetch(
                                `${API_URL}/sets/${set.id}/words?user_id=${encodeURIComponent(quizUser.id)}`
                            );


                        const data =
                            await response.json();


                        console.log(
                            "Quiz set backenddan:",
                            data
                        );


                        /* =========================
                           SERVER JAVOBI
                        ========================= */

                        if (!response.ok) {

                            alert(
                                data.error ||
                                "So‘zlarni yuklashda xatolik!"
                            );

                            return;
                        }


                        /* =========================
                           WORDS TEKSHIRISH
                        ========================= */

                        const words =
                            data.words || [];


                        if (
                            words.length === 0
                        ) {

                            alert(
                                "Bu to‘plamda hali lug‘atlar mavjud emas."
                            );

                            return;
                        }


                        /* =========================
                           QUIZ SET
                        ========================= */

                        const quizSet = {

                            id:
                                data.set.id,

                            user_id:
                                data.set.user_id,

                            date:
                                data.set.date,

                            title:
                                data.set.title,

                            words:
                                words

                        };


                        console.log(
                            "Quiz uchun tayyor set:",
                            quizSet
                        );


                        /* =========================
                           LOCAL STORAGE
                        ========================= */

                        localStorage.setItem(
                            "quizSet",
                            JSON.stringify(
                                quizSet
                            )
                        );


                        localStorage.setItem(
                            "quizSetId",
                            String(set.id)
                        );


                        /* =========================
                           QUIZ SAHIFASIGA O‘TISH
                        ========================= */

                        window.location.href =
                            "quiz.html";


                    } catch (error) {

                        console.error(
                            "Quiz set ochish xatosi:",
                            error
                        );


                        alert(
                            "Server bilan bog‘lanib bo‘lmadi!"
                        );

                    }

                }
            );


            /* =========================
               LISTGA QO‘SHISH
            ========================= */

            quizSetsList.appendChild(
                card
            );

        }
    );

}


/* =========================
   SANA FORMATLASH
========================= */

function formatDate(date) {

    if (!date) {

        return "Sana mavjud emas";

    }


    /*
       Backend:
       2026-08-24

       Natija:
       24.08.2026
    */

    const parts =
        String(date).split("-");


    if (
        parts.length !== 3
    ) {

        return date;

    }


    return (
        parts[2] +
        "." +
        parts[1] +
        "." +
        parts[0]
    );

}


/* =========================
   BOSHLASH
========================= */

loadQuizSets();
