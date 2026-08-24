/* =========================
   QUIZ JS
========================= */

console.log("QUIZ JS ISHLADI!");


/* =========================
   BACKEND URL
========================= */

const API_URL =
    "https://lexinote-backend.onrender.com";


/* =========================
   LOGIN QILGAN USER
========================= */

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

    throw new Error(
        "Quiz set ID topilmadi."
    );

}


/* =========================
   ELEMENTLAR
========================= */

const questionWord =
    document.getElementById(
        "question-word"
    );


const answerInput =
    document.getElementById(
        "answer-input"
    );


const checkButton =
    document.getElementById(
        "check-button"
    );


const nextButton =
    document.getElementById(
        "next-button"
    );


const resultMessage =
    document.getElementById(
        "result-message"
    );


const questionNumber =
    document.getElementById(
        "question-number"
    );


const totalQuestions =
    document.getElementById(
        "total-questions"
    );


const quizSetName =
    document.getElementById(
        "quiz-set-name"
    );


const finishButton =
    document.getElementById(
        "finish-button"
    );


const quizCard =
    document.querySelector(
        ".quiz-card"
    );


const quizResult =
    document.getElementById(
        "quiz-result"
    );


const reverseButton =
    document.getElementById(
        "reverse-button"
    );


/* =========================
   ELEMENTLARNI TEKSHIRISH
========================= */

if (
    !questionWord ||
    !answerInput ||
    !checkButton ||
    !nextButton ||
    !resultMessage ||
    !questionNumber ||
    !totalQuestions ||
    !quizSetName ||
    !finishButton ||
    !quizCard ||
    !quizResult ||
    !reverseButton
) {

    console.error(
        "Quiz HTML elementlaridan biri topilmadi."
    );

    throw new Error(
        "Quiz elementlari topilmadi."
    );

}


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
   BACKENDDAN QUIZNI OLISH
========================= */

async function loadQuiz() {

    console.log(
        "loadQuiz() ishga tushdi!"
    );


    try {

        console.log(
            "Quiz set ID:",
            quizSetId
        );


        const response =
            await fetch(
                `${API_URL}/sets/${quizSetId}/words?user_id=${encodeURIComponent(quizUser.id)}`
            );


        console.log(
            "Quiz backend response:",
            response
        );


        const data =
            await response.json();


        console.log(
            "Quiz backenddan:",
            data
        );


        /* =========================
           RESPONSE TEKSHIRISH
        ========================= */

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


        if (!quizSet) {

            alert(
                "Quiz to‘plami topilmadi."
            );

            window.location.href =
                "word-quiz.html";

            return;
        }


        /* =========================
           SO‘ZLAR
        ========================= */

        quizWords =
            Array.isArray(data.words)
                ? data.words
                : [];


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

        shuffleArray(
            quizWords
        );


        /* =========================
           HEADER
        ========================= */

        totalQuestions.textContent =
            quizWords.length;


        quizSetName.textContent =
            quizSet.title || "Quiz";


        /* =========================
           NATIJANI BOSHLASH
        ========================= */

        currentIndex = 0;

        correctCount = 0;

        incorrectCount = 0;

        wrongAnswers = [];


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
   TASODIFIY ARALASHTIRISH
========================= */

function shuffleArray(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            array[i],
            array[randomIndex]
        ] = [
            array[randomIndex],
            array[i]
        ];

    }

}


/* =========================
   SAVOLNI KO‘RSATISH
========================= */

function showQuestion() {

    const currentWord =
        quizWords[currentIndex];


    if (!currentWord) {

        finishQuiz();

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
       SAVOL RAQAMI
    ========================= */

    questionNumber.textContent =
        currentIndex + 1;


    totalQuestions.textContent =
        quizWords.length;


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


    /* =========================
       INPUTGA FOCUS
    ========================= */

    answerInput.focus();

}


/* =========================
   REVERSE MODE
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
    checkAnswer
);


/* =========================
   ENTER BILAN TEKSHIRISH
========================= */

answerInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            !checkButton.disabled
        ) {

            event.preventDefault();

            checkAnswer();

        }

    }
);


/* =========================
   JAVOBNI TEKSHIRISH
========================= */

function checkAnswer() {

    const currentWord =
        quizWords[currentIndex];


    if (!currentWord) {
        return;
    }


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

        answerInput.focus();

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
        String(correctAnswer)
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

    if (
        !quizCard ||
        !quizResult
    ) {

        return;

    }


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

                const wrongCard =
                    document.createElement(
                        "div"
                    );


                wrongCard.className =
                    "wrong-word-card";


                const wordTitle =
                    document.createElement(
                        "h3"
                    );


                wordTitle.textContent =
                    item.word;


                const userAnswerText =
                    document.createElement(
                        "p"
                    );


                userAnswerText.textContent =
                    "Sizning javobingiz: " +
                    item.userAnswer;


                const correctAnswerText =
                    document.createElement(
                        "p"
                    );


                correctAnswerText.textContent =
                    "To‘g‘ri javob: " +
                    item.correctAnswer;


                wrongCard.appendChild(
                    wordTitle
                );


                wrongCard.appendChild(
                    userAnswerText
                );


                wrongCard.appendChild(
                    correctAnswerText
                );


                wrongWordsHTML +=
                    wrongCard.outerHTML;

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
                ${escapeHTML(
                    quizSet?.title || "Quiz"
                )}
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
                id="retry-quiz-button"
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


    /* =========================
       QAYTA ISHLASH
    ========================= */

    const retryButton =
        document.getElementById(
            "retry-quiz-button"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            function () {

                location.reload();

            }
        );

    }

}


/* =========================
   HTML XAVFSIZLIGI
========================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================
   QUIZNI BOSHLASH
========================= */

loadQuiz();
