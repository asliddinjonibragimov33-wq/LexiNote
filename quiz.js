/* =========================
   LOGIN QILGAN USER
========================= */

const quizUser = JSON.parse(
    sessionStorage.getItem("currentUser")
);


if (!quizUser) {

    alert("Avval tizimga kiring!");

    window.location.href = "login.html";

    throw new Error("User login qilmagan.");

}


/* =========================
   TANLANGAN SET ID
========================= */

const quizSetId =
    localStorage.getItem("quizSetId");


if (!quizSetId) {

    alert(
        "Test uchun lug‘at to‘plami tanlanmagan."
    );

    window.location.href =
        "word-quiz.html";

    throw new Error("Quiz set ID topilmadi.");

}


/* =========================
   ELEMENTLAR
========================= */

const questionWord =
    document.getElementById("question-word");

const answerInput =
    document.getElementById("answer-input");

const checkButton =
    document.getElementById("check-button");

const nextButton =
    document.getElementById("next-button");

const resultMessage =
    document.getElementById("result-message");

const questionNumber =
    document.getElementById("question-number");

const totalQuestions =
    document.getElementById("total-questions");

const quizSetName =
    document.getElementById("quiz-set-name");

const finishButton =
    document.getElementById("finish-button");

const quizCard =
    document.querySelector(".quiz-card");

const quizResult =
    document.getElementById("quiz-result");

const reverseButton =
    document.getElementById("reverse-button");


/* =========================
   QUIZ O‘ZGARUVCHILARI
========================= */

let quizSet = null;

let quizWords = [];

let currentIndex = 0;

let correctCount = 0;

let incorrectCount = 0;

let wrongAnswers = [];

let reverseMode = false;


/* =========================
   BACKENDDAN QUIZ MA'LUMOTLARINI OLISH
========================= */

async function loadQuiz() {

    try {

        console.log(
            "Quiz set ID:",
            quizSetId
        );


        const response =
            await fetch(
                `http://127.0.0.1:5000/sets/${quizSetId}/words?user_id=${quizUser.id}`
            );


        const data =
            await response.json();


        console.log(
            "Quiz backenddan:",
            data
        );


        if (!response.ok) {

            alert(
                data.error ||
                "Quiz ma'lumotlarini olishda xatolik!"
            );

            window.location.href =
                "word-quiz.html";

            return;

        }


        /* =========================
           SET
        ========================= */

        quizSet =
            data.set;


        /* =========================
           SO‘ZLAR
        ========================= */

        quizWords =
            data.words || [];


        /* =========================
           BO‘SH SET
        ========================= */

        if (
            quizWords.length === 0
        ) {

            alert(
                "Bu to‘plamda hali lug‘atlar mavjud emas."
            );

            window.location.href =
                "word-quiz.html";

            return;

        }


        /* =========================
           TASODIFIY TARTIB
        ========================= */

        quizWords.sort(
            function () {

                return Math.random() - 0.5;

            }
        );


        /* =========================
           HEADER
        ========================= */

        totalQuestions.textContent =
            quizWords.length;


        quizSetName.textContent =
            quizSet.title;


        /* =========================
           BIRINCHI SAVOL
        ========================= */

        showQuestion();


    } catch (error) {

        console.error(
            "Quiz load error:",
            error
        );


        alert(
            "Server bilan bog‘lanib bo‘lmadi!"
        );

    }

}


/* =========================
   SAVOLNI KO‘RSATISH
========================= */

function showQuestion() {

    const currentWord =
        quizWords[currentIndex];


    if (!currentWord) {
        return;
    }


    /* =========================
       SAVOL YO‘NALISHI
    ========================= */

    if (reverseMode) {

        questionWord.textContent =
            currentWord.translation;

    } else {

        questionWord.textContent =
            currentWord.word;

    }


    /* =========================
       RAQAM
    ========================= */

    questionNumber.textContent =
        currentIndex + 1;


    /* =========================
       INPUT
    ========================= */

    answerInput.value = "";

    answerInput.disabled = false;


    /* =========================
       CHECK
    ========================= */

    checkButton.disabled = false;


    /* =========================
       RESULT
    ========================= */

    resultMessage.textContent = "";

    resultMessage.className =
        "result-message";


    /* =========================
       NEXT
    ========================= */

    nextButton.style.display =
        "none";


    answerInput.focus();

}


/* =========================
   REVERSE
========================= */

reverseButton.addEventListener(
    "click",
    function () {

        reverseMode =
            !reverseMode;


        showQuestion();

    }
);


/* =========================
   JAVOBNI TEKSHIRISH
========================= */

checkButton.addEventListener(
    "click",
    function () {

        const currentWord =
            quizWords[currentIndex];


        const userAnswer =
            answerInput.value
                .trim()
                .toLowerCase();


        /* =========================
           BO‘SH JAVOB
        ========================= */

        if (!userAnswer) {

            resultMessage.textContent =
                "Avval javobingizni yozing.";

            resultMessage.className =
                "result-message warning";

            return;

        }


        /* =========================
           TO‘G‘RI JAVOB
        ========================= */

        const correctAnswer =
            reverseMode
                ? currentWord.word
                : currentWord.translation;


        const normalizedCorrectAnswer =
            correctAnswer
                .trim()
                .toLowerCase();


        /* =========================
           TO‘G‘RI
        ========================= */

        if (
            userAnswer ===
            normalizedCorrectAnswer
        ) {

            correctCount++;


            resultMessage.textContent =
                "✓ To‘g‘ri!";


            resultMessage.className =
                "result-message correct";

        }


        /* =========================
           NOTO‘G‘RI
        ========================= */

        else {

            incorrectCount++;


            wrongAnswers.push({

                word:
                    currentWord.word,

                userAnswer:
                    answerInput.value.trim(),

                correctAnswer:
                    correctAnswer

            });


            resultMessage.textContent =
                "✗ Noto‘g‘ri! To‘g‘ri javob: " +
                correctAnswer;


            resultMessage.className =
                "result-message incorrect";

        }


        /* =========================
           JAVOBDAN KEYIN
        ========================= */

        answerInput.disabled = true;

        checkButton.disabled = true;

        nextButton.style.display =
            "block";

    }
);


/* =========================
   KEYINGI SO‘Z
========================= */

nextButton.addEventListener(
    "click",
    function () {

        currentIndex++;


        if (
            currentIndex >=
            quizWords.length
        ) {

            finishQuiz();

            return;

        }


        showQuestion();

    }
);


/* =========================
   YAKUNLASH
========================= */

finishButton.addEventListener(
    "click",
    function () {

        const confirmed =
            confirm(
                "Testni hozir yakunlashni xohlaysizmi?"
            );


        if (!confirmed) {
            return;
        }


        finishQuiz();

    }
);


/* =========================
   QUIZNI YAKUNLASH
========================= */

function finishQuiz() {

    quizCard.style.display =
        "none";


    const answeredCount =
        correctCount +
        incorrectCount;


    quizResult.style.display =
        "block";


    let wrongWordsHTML = "";


    /* =========================
       HAMMASI TO‘G‘RI
    ========================= */

    if (
        wrongAnswers.length === 0
    ) {

        wrongWordsHTML = `

            <div class="perfect-result">

                🎉 Ajoyib!

                <p>
                    Barcha javoblaringiz to‘g‘ri!
                </p>

            </div>

        `;

    }


    /* =========================
       XATO JAVOBLAR
    ========================= */

    else {

        wrongWordsHTML = `

            <div class="wrong-title">
                Xato qilingan lug‘atlar
            </div>

        `;


        wrongAnswers.forEach(
            function (item) {

                wrongWordsHTML += `

                    <div
                        class="wrong-word-card"
                    >

                        <h3>
                            ${item.word}
                        </h3>

                        <p>
                            Sizning javobingiz:
                            <strong>
                                ${item.userAnswer}
                            </strong>
                        </p>

                        <p>
                            To‘g‘ri javob:
                            <strong>
                                ${item.correctAnswer}
                            </strong>
                        </p>

                    </div>

                `;

            }
        );

    }


    /* =========================
       NATIJA
    ========================= */

    quizResult.innerHTML = `

        <div class="result-header">

            <div class="result-icon">
                🎉
            </div>

            <h1>
                Test yakunlandi!
            </h1>

            <p>
                ${quizSet.title}
            </p>

        </div>


        <div class="score-box">

            <div class="score-number">

                ${correctCount}

                <span>
                    / ${answeredCount}
                </span>

            </div>

            <div class="score-text">
                To‘g‘ri javoblar
            </div>

        </div>


        <div class="result-statistics">

            <div class="result-stat correct-stat">

                <strong>
                    ${correctCount}
                </strong>

                <span>
                    ✓ To‘g‘ri
                </span>

            </div>


            <div class="result-stat incorrect-stat">

                <strong>
                    ${incorrectCount}
                </strong>

                <span>
                    ✗ Xato
                </span>

            </div>

        </div>


        ${wrongWordsHTML}


        <div class="result-actions">

            <button
                class="retry-button"
                onclick="location.reload()"
            >
                🔄 Qayta ishlash
            </button>


            <a
                href="word-quiz.html"
                class="back-to-quiz"
            >
                📚 Lug‘atlarim
            </a>

        </div>

    `;

}


/* =========================
   QUIZNI BOSHLASH
========================= */

loadQuiz();