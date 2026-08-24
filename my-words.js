console.log("MY-WORDS JS ISHLADI!");

/* =========================
   BACKEND URL
========================= */

const API_URL =
    "https://lexinote-backend.onrender.com";


/* =========================
   ELEMENTLAR
========================= */

const setsList =
    document.getElementById("sets-list");


if (!setsList) {

    console.error(
        "sets-list elementi topilmadi!"
    );

    throw new Error(
        "sets-list mavjud emas."
    );

}


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
    "Login qilgan user:",
    currentUser
);


/* =========================
   SETLARNI BACKENDDAN OLISH
========================= */

async function loadSets() {

    console.log(
        "loadSets() ishga tushdi!"
    );


    /* =========================
       LOADING
    ========================= */

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

        const response =
            await fetch(
                `${API_URL}/sets?user_id=${encodeURIComponent(currentUser.id)}`
            );


        console.log(
            "Backend response:",
            response
        );


        const data =
            await response.json();


        console.log(
            "Backend data:",
            data
        );


        /* =========================
           BACKEND XATOSI
        ========================= */

        if (!response.ok) {

            alert(
                data.error ||
                "Lug‘atlarni yuklashda xatolik!"
            );

            return;
        }


        /* =========================
           SETLARNI CHIQARISH
        ========================= */

        displaySets(
            data.sets || []
        );


    } catch (error) {

        console.error(
            "Load sets error:",
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
                    Internet aloqangizni tekshirib,
                    qaytadan urinib ko‘ring.
                </p>

                <button
                    class="new-word-btn"
                    id="retry-load-sets"
                >
                    🔄 Qayta urinish
                </button>

            </div>

        `;


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

}


/* =========================
   SETLARNI KO‘RSATISH
========================= */

function displaySets(savedSets) {

    console.log(
        "displaySets():",
        savedSets
    );


    setsList.innerHTML = "";


    /* =========================
       SETLAR YO‘Q
    ========================= */

    if (
        !Array.isArray(savedSets) ||
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
                    Birinchi lug‘at
                    to‘plamingizni yarating.
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


    /* =========================
       SETLARNI CHIQARISH
    ========================= */

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
                        📅 ${formatDate(set.date)}
                    </div>


                    <h2>
                        ${escapeHTML(set.title)}
                    </h2>


                    <p>
                        ${Number(set.word_count) || 0}
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


            /* =========================
               O‘CHIRISH
            ========================= */

            const deleteButton =
                card.querySelector(
                    ".delete-set-button"
                );


            deleteButton.addEventListener(
                "click",
                async function (event) {

                    event.stopPropagation();


                    const confirmed =
                        confirm(
                            `"${set.title}" lug‘at to‘plamini o‘chirishni xohlaysizmi?`
                        );


                    if (!confirmed) {

                        return;

                    }


                    /* =========================
                       DELETE BUTTON HOLATI
                    ========================= */

                    deleteButton.disabled =
                        true;


                    try {

                        const response =
                            await fetch(
                                `${API_URL}/sets/${set.id}`,
                                {
                                    method: "DELETE"
                                }
                            );


                        const data =
                            await response.json();


                        console.log(
                            "Delete set response:",
                            data
                        );


                        if (!response.ok) {

                            alert(
                                data.error ||
                                "Lug‘atni o‘chirishda xatolik!"
                            );

                            deleteButton.disabled =
                                false;

                            return;
                        }


                        alert(
                            data.message ||
                            "Lug‘at muvaffaqiyatli o‘chirildi!"
                        );


                        /* =========================
                           TANLANGAN SETNI TOZALASH
                        ========================= */

                        const selectedSetId =
                            localStorage.getItem(
                                "selectedSetId"
                            );


                        if (
                            String(selectedSetId) ===
                            String(set.id)
                        ) {

                            localStorage.removeItem(
                                "selectedSetId"
                            );

                        }


                        /* =========================
                           RO‘YXATNI YANGILASH
                        ========================= */

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

                    }

                }
            );


            /* =========================
               SETNI OCHISH
            ========================= */

            card.addEventListener(
                "click",
                function () {

                    localStorage.setItem(
                        "selectedSetId",
                        set.id
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


/* =========================
   SANANI FORMATLASH
========================= */

function formatDate(date) {

    if (!date) {

        return "—";

    }


    const parts =
        date.split("-");


    if (parts.length !== 3) {

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
   XAVFSIZ HTML
========================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


/* =========================
   BOSHLASH
========================= */

loadSets();
