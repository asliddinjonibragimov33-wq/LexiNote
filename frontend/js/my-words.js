console.log("MY-WORDS JS ISHLADI!");

/* =====================================================
   BACKEND URL
===================================================== */

const API_URL =
    "https://lexinote-backend.onrender.com";


/* =====================================================
   ELEMENTLAR
===================================================== */

const setsList =
    document.getElementById("sets-list");


if (!setsList) {

    console.error(
        "❌ #sets-list elementi topilmadi!"
    );

    throw new Error(
        "#sets-list mavjud emas."
    );

}


/* =====================================================
   CURRENT USER
===================================================== */

const currentUser =
    JSON.parse(
        sessionStorage.getItem("currentUser")
    );


/* =====================================================
   LOGIN TEKSHIRISH
===================================================== */

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
    "✅ Current user:",
    currentUser
);


/* =====================================================
   USER ID TEKSHIRISH
===================================================== */

if (!currentUser.id) {

    console.error(
        "❌ currentUser ichida id mavjud emas:",
        currentUser
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
        "User ID topilmadi."
    );

}


/* =====================================================
   SETLARNI YUKLASH
===================================================== */

async function loadSets() {

    console.log(
        "📚 loadSets() boshlandi..."
    );


    /* ---------------------------------------------
       LOADING
    --------------------------------------------- */

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
            `${API_URL}/sets?user_id=${encodeURIComponent(currentUser.id)}`;


        console.log(
            "🌐 Backend URL:",
            url
        );


        const response =
            await fetch(url, {

                method: "GET",

                headers: {
                    "Accept": "application/json"
                }

            });


        console.log(
            "📡 Backend status:",
            response.status
        );


        /* ---------------------------------------------
           RESPONSE JSON
        --------------------------------------------- */

        const data =
            await response.json();


        console.log(
            "📦 Backend data:",
            data
        );


        /* ---------------------------------------------
           BACKEND XATOSI
        --------------------------------------------- */

        if (!response.ok) {

            console.error(
                "❌ Backend error:",
                data
            );


            setsList.innerHTML = `

                <div class="empty-sets">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <h2>
                        Lug‘atlarni yuklashda xatolik
                    </h2>

                    <p>
                        ${
                            escapeHTML(
                                data.error ||
                                "Server xatosi yuz berdi."
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


        /* ---------------------------------------------
           SETLAR
        --------------------------------------------- */

        const savedSets =
            Array.isArray(data.sets)
                ? data.sets
                : [];


        console.log(
            `✅ ${savedSets.length} ta set topildi.`
        );


        displaySets(
            savedSets
        );


    } catch (error) {

        console.error(
            "❌ loadSets() error:",
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
                    Internet yoki backend serverni
                    tekshirib, qaytadan urinib ko‘ring.
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
   RETRY BUTTON
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

    console.log(
        "🎨 displaySets():",
        savedSets
    );


    setsList.innerHTML = "";


    /* ---------------------------------------------
       SET YO‘Q
    --------------------------------------------- */

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


    /* ---------------------------------------------
       SETLAR
    --------------------------------------------- */

    savedSets.forEach(
        function (set) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "set-card";


            /* -----------------------------------------
               CARD HTML
            ----------------------------------------- */

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


            /* -----------------------------------------
               DELETE BUTTON
            ----------------------------------------- */

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


            /* -----------------------------------------
               CARD CLICK
            ----------------------------------------- */

            card.addEventListener(
                "click",
                function () {

                    console.log(
                        "📖 Tanlangan set:",
                        set
                    );


                    /*
                     * view-words.html uchun
                     */

                    localStorage.setItem(
                        "selectedSetId",
                        String(set.id)
                    );


                    /*
                     * Quiz uchun ham
                     * keyinchalik kerak bo‘lishi mumkin
                     */

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


    /* ---------------------------------------------
       BUTTON DISABLED
    --------------------------------------------- */

    deleteButton.disabled =
        true;


    deleteButton.textContent =
        "⏳";


    try {

        const url =
            `${API_URL}/sets/${set.id}`;


        console.log(
            "🗑️ DELETE:",
            url
        );


        const response =
            await fetch(
                url,
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
            "🗑️ Delete response:",
            data
        );


        /* ---------------------------------------------
           DELETE XATOSI
        --------------------------------------------- */

        if (!response.ok) {

            alert(
                data.error ||
                "Lug‘atni o‘chirishda xatolik yuz berdi."
            );


            deleteButton.disabled =
                false;


            deleteButton.textContent =
                "🗑️";


            return;

        }


        /* ---------------------------------------------
           LOCAL STORAGE TOZALASH
        --------------------------------------------- */

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


        /* ---------------------------------------------
           MUVAFFAQIYAT
        --------------------------------------------- */

        alert(
            data.message ||
            "Lug‘at muvaffaqiyatli o‘chirildi!"
        );


        /* ---------------------------------------------
           RO‘YXATNI QAYTA YUKLASH
        --------------------------------------------- */

        await loadSets();


    } catch (error) {

        console.error(
            "❌ Delete set error:",
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


    const dateString =
        String(date);


    const parts =
        dateString.split("-");


    if (
        parts.length !== 3
    ) {

        return dateString;

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
