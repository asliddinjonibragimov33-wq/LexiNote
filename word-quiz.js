const quizSetsList =
    document.getElementById("quiz-sets-list");


/* =========================
   LOGIN QILGAN USER
========================= */

const quizUser = JSON.parse(
    sessionStorage.getItem("currentUser")
);


if (!quizUser) {

    alert("Avval tizimga kiring!");

    window.location.href =
        "login.html";

    throw new Error(
        "User login qilmagan."
    );
}


/* =========================
   BACKENDDAN SETLARNI OLISH
========================= */

async function loadQuizSets() {

    try {

        const response =
            await fetch(
                `http://127.0.0.1:5000/sets?user_id=${quizUser.id}`
            );


        const data =
            await response.json();


        console.log(
            "Quiz uchun backenddan kelgan setlar:",
            data
        );


        if (!response.ok) {

            alert(
                data.error ||
                "Lug‘atlarni yuklashda xatolik!"
            );

            return;
        }


        displayQuizSets(
            data.sets
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

    quizSetsList.innerHTML = "";


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

                <a href="add-word.html">
                    + Lug‘at yaratish
                </a>

            </div>

        `;

        return;

    }


    sets.forEach(
        function(set) {

            const card =
                document.createElement("div");


            card.className =
                "quiz-set-card";


            card.innerHTML = `

                <div class="quiz-set-icon">
                    📚
                </div>

                <div class="quiz-set-info">

                    <h3>
                        ${set.title}
                    </h3>

                    <p>
                        📅 ${formatDate(set.date)}
                        ·
                        ${set.word_count} ta lug‘at
                    </p>

                </div>

                <div class="quiz-set-arrow">
                    →
                </div>

            `;


            /* =========================
               SETNI BOSISH
            ========================= */

            card.addEventListener(
                "click",
                async function() {

                    if (
                        set.word_count === 0
                    ) {

                        alert(
                            "Bu to‘plamda hali lug‘atlar mavjud emas."
                        );

                        return;

                    }


                    try {

                        console.log(
                            "Set ID:",
                            set.id
                        );

                        console.log(
                            "User ID:",
                            quizUser.id
                        );


                        /* =========================
                           SET SO‘ZLARINI OLISH
                        ========================= */

                        const response =
                            await fetch(
                                `http://127.0.0.1:5000/sets/${set.id}/words?user_id=${quizUser.id}`
                            );


                        const data =
                            await response.json();


                        console.log(
                            "Quiz set backenddan:",
                            data
                        );


                        if (!response.ok) {

                            alert(
                                data.error ||
                                "So‘zlarni yuklashda xatolik!"
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
                                data.words

                        };


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
                            set.id
                        );


                        /* =========================
                           QUIZ SAHIFASI
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


            quizSetsList.appendChild(
                card
            );

        }
    );

}


/* =========================
   SANANI FORMATLASH
========================= */

function formatDate(date) {

    const parts =
        date.split("-");


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