console.log("MY-WORDS JS ISHLADI!");


/* =====================================================
   BACKEND URL
===================================================== */

const API_URL =
    "https://lexinote-backend.onrender.com";


/* =====================================================
   ELEMENT
===================================================== */

const setsList =
    document.getElementById("sets-list");

const searchInput =
    document.getElementById("search-sets");


if (!setsList) {

    console.error(
        "sets-list elementi topilmadi!"
    );

    throw new Error(
        "sets-list mavjud emas."
    );

}


/* =====================================================
   CURRENT USER
   MUHIM:
   navbar.js bilan nom to'qnashmasligi uchun
   myWordsUser ishlatyapmiz.
===================================================== */

const myWordsUser =
    JSON.parse(
        sessionStorage.getItem("currentUser")
    );


/* =====================================================
   LOGIN TEKSHIRISH
===================================================== */

if (!myWordsUser) {

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
    "My Words User:",
    myWordsUser
);


/* =====================================================
   USER ID TEKSHIRISH
===================================================== */

if (!myWordsUser.id) {

    console.error(
        "User ID topilmadi:",
        myWordsUser
    );

    alert(
        "Foydalanuvchi ma'lumotlari noto'g'ri."
    );

    sessionStorage.removeItem(
        "currentUser"
    );

    window.location.href =
        "login.html";

    throw new Error(
        "User ID mavjud emas."
    );

}


/* =====================================================
   🔍 QIDIRUV UCHUN BARCHA SETLAR
===================================================== */

let allSets = [];


/* =====================================================
   SETLARNI BACKENDDAN OLISH
===================================================== */

async function loadSets() {

    console.log(
        "loadSets() ishga tushdi!"
    );


    /* =================================================
       LOADING
    ================================================= */

    setsList.innerHTML = `

        <div class="loading-sets">

            <div class="empty-icon">
                📚
            </div>

            <p>
                Lug‘atlar yuklanmoqda...
            </p>

        </div>

    `;


    try {

        const url =
            `${API_URL}/sets?user_id=${encodeURIComponent(myWordsUser.id)}`;


        console.log(
            "Backend URL:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        console.log(
            "Backend status:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "Backend data:",
            data
        );


        /* =================================================
           BACKEND XATOSI
        ================================================= */

        if (!response.ok) {

            setsList.innerHTML = `

                <div class="empty-sets">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <h2>
                        Xatolik yuz berdi
                    </h2>

                    <p>
                        ${
                            escapeHTML(
                                data.error ||
                                "Lug‘atlarni yuklashda xatolik."
                            )
                        }
                    </p>

                    <button
                        type="button"
                        class="new-word-btn"
                        id="retry-load-sets"
                    >
                        🔄 Qayta urinish
                    </button>

                </div>

            `;


            setupRetryButton();

            return;

        }


        /* =================================================
           SETLAR
        ================================================= */

        const savedSets =
            Array.isArray(data.sets)
                ? data.sets
                : [];


        /* =================================================
           🔍 QIDIRUV UCHUN SAQLAB QO‘YAMIZ
        ================================================= */

        allSets = savedSets;


        console.log(
            "Topilgan setlar:",
            savedSets
        );


        displaySets(
            savedSets
        );


    } catch (error) {

        console.error(
            "loadSets error:",
            error
        );


        setsList.innerHTML = `

            <div class="empty-sets">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h2>
                    Server bilan bog‘lanib bo‘lmadi
                </h2>

                <p>
                    Internet aloqangizni tekshiring
                    va qaytadan urinib ko‘ring.
                </p>

                <button
                    type="button"
                    class="new-word-btn"
                    id="retry-load-sets"
                >
                    🔄 Qayta urinish
                </button>

            </div>

        `;


        setupRetryButton();

    }

}


/* =====================================================
   RETRY
===================================================== */

function setupRetryButton() {

    const retryButton =
        document.getElementById(
            "retry-load-sets"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            loadSets
        );

    }

}


/* =====================================================
   SETLARNI KO‘RSATISH
===================================================== */

function displaySets(
    savedSets
) {

    setsList.innerHTML = "";


    /* =================================================
       SETLAR YO‘Q
    ================================================= */

    if (
        savedSets.length === 0
    ) {

        setsList.innerHTML = `

            <div class="empty-sets">

                <div class="empty-icon">
                    📚
                </div>

                <h2>
                    Hali lug‘atlar mavjud emas
                </h2>

                <p>
                    Birinchi lug‘at to‘plamingizni
                    yarating.
                </p>

                <a
                    href="add-word.html"
                    class="new-word-btn"
                >
                    + Lug‘at yaratish
                </a>

            </div>

        `;

        return;

    }


    /* =================================================
       SETLARNI CHIQARISH
    ================================================= */

    savedSets.forEach(
        function (set) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "set-card";


            card.innerHTML = `

                <div class="set-card-icon">
                    📚
                </div>

                <div class="set-card-info">

                    <div class="set-card-date">

                        📅
                        ${formatDate(set.date)}

                    </div>

                    <h2>
                        ${escapeHTML(set.title)}
                    </h2>

                    <p>
                        ${
                            Number(set.word_count) || 0
                        }
                        ta lug‘at
                    </p>

                </div>

                <button
                    type="button"
                    class="delete-set-button"
                    title="Lug‘atni o‘chirish"
                    aria-label="Lug‘atni o‘chirish"
                >
                    🗑️
                </button>

                <div
                    class="set-card-arrow"
                    aria-hidden="true"
                >
                    →
                </div>

            `;


            /* =================================================
               DELETE BUTTON
            ================================================= */

            const deleteButton =
                card.querySelector(
                    ".delete-set-button"
                );


            deleteButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    deleteSet(
                        set,
                        deleteButton
                    );

                }
            );


            /* =================================================
               SETNI OCHISH
            ================================================= */

            card.addEventListener(
                "click",
                function () {

                    console.log(
                        "Tanlangan set:",
                        set.id
                    );


                    localStorage.setItem(
                        "selectedSetId",
                        String(set.id)
                    );


                    localStorage.setItem(
                        "quizSetId",
                        String(set.id)
                    );


                    window.location.href =
                        "view-words.html";

                }
            );


            setsList.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   🔍 LUG‘ATLARDAN QIDIRISH
===================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const searchText =
                searchInput.value
                    .trim()
                    .toLowerCase();


            const filteredSets =
                allSets.filter(
                    function (set) {

                        const title =
                            String(
                                set.title || ""
                            ).toLowerCase();

                        return title.includes(
                            searchText
                        );

                    }
                );


            displaySets(
                filteredSets
            );

        }
    );

}


/* =====================================================
   SETNI O‘CHIRISH
===================================================== */

async function deleteSet(
    set,
    deleteButton
) {

    const confirmed =
        confirm(
            `"${set.title}" lug‘at to‘plamini o‘chirishni xohlaysizmi?`
        );


    if (!confirmed) {

        return;

    }


    deleteButton.disabled =
        true;


    deleteButton.textContent =
        "⏳";


    try {

        const response =
            await fetch(
                `${API_URL}/sets/${set.id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Delete response:",
            data
        );


        if (!response.ok) {

            alert(
                data.error ||
                "Lug‘atni o‘chirishda xatolik!"
            );


            deleteButton.disabled =
                false;

            deleteButton.textContent =
                "🗑️";

            return;

        }


        /* =================================================
           LOCAL STORAGE TOZALASH
        ================================================= */

        const selectedSetId =
            localStorage.getItem(
                "selectedSetId"
            );


        const quizSetId =
            localStorage.getItem(
                "quizSetId"
            );


        if (
            String(selectedSetId) ===
            String(set.id)
        ) {

            localStorage.removeItem(
                "selectedSetId"
            );

        }


        if (
            String(quizSetId) ===
            String(set.id)
        ) {

            localStorage.removeItem(
                "quizSetId"
            );

        }


        alert(
            data.message ||
            "Lug‘at muvaffaqiyatli o‘chirildi!"
        );


        await loadSets();


    } catch (error) {

        console.error(
            "Delete set error:",
            error
        );


        alert(
            "Server bilan bog‘lanib bo‘lmadi!"
        );


        deleteButton.disabled =
            false;

        deleteButton.textContent =
            "🗑️";

    }

}


/* =====================================================
   SANANI FORMATLASH
===================================================== */

function formatDate(
    date
) {

    if (!date) {

        return "—";

    }


    const parts =
        String(date).split("-");


    if (
        parts.length !== 3
    ) {

        return String(date);

    }


    return (
        parts[2] +
        "." +
        parts[1] +
        "." +
        parts[0]
    );

}


/* =====================================================
   XAVFSIZ HTML
===================================================== */

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


/* =====================================================
   START
===================================================== */

loadSets();
