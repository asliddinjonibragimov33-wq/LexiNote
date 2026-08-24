console.log("VIEW-WORDS JS ISHLADI!");


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
    "View words user:",
    currentUser
);


/* =========================
   SET ID
========================= */

const selectedSetId =
    localStorage.getItem(
        "selectedSetId"
    );


if (!selectedSetId) {

    alert(
        "Lug‘at to‘plami tanlanmagan."
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

const viewDate =
    document.getElementById(
        "view-date"
    );


const viewTitle =
    document.getElementById(
        "view-title"
    );


const viewCount =
    document.getElementById(
        "view-count"
    );


const wordsList =
    document.getElementById(
        "view-words-list"
    );


/* =========================
   ELEMENTLARNI TEKSHIRISH
========================= */

if (
    !viewDate ||
    !viewTitle ||
    !viewCount ||
    !wordsList
) {

    console.error(
        "View words elementlaridan biri topilmadi."
    );

    throw new Error(
        "HTML elementlari topilmadi."
    );

}


/* =========================
   BACKENDDAN SETNI OLISH
========================= */

async function loadSet() {

    console.log(
        "Set yuklanmoqda:",
        selectedSetId
    );


    /* =========================
       LOADING
    ========================= */

    wordsList.innerHTML = `

        <div class="empty-words">

            <span>
                📖
            </span>

            <p>
                Lug‘atlar yuklanmoqda...
            </p>

        </div>

    `;


    try {

        const response =
            await fetch(
                `${API_URL}/sets/${encodeURIComponent(selectedSetId)}/words?user_id=${encodeURIComponent(currentUser.id)}`
            );


        console.log(
            "View words response:",
            response
        );


        const data =
            await response.json();


        console.log(
            "View words backend:",
            data
        );


        /* =========================
           BACKEND XATOSI
        ========================= */

        if (!response.ok) {

            alert(
                data.error ||
                "Lug‘atni yuklashda xatolik!"
            );

            window.location.href =
                "my-words.html";

            return;

        }


        /* =========================
           SET TEKSHIRISH
        ========================= */

        if (!data.set) {

            alert(
                "Lug‘at to‘plami topilmadi."
            );

            window.location.href =
                "my-words.html";

            return;

        }


        /* =========================
           SET MA'LUMOTLARI
        ========================= */

        viewDate.textContent =
            "📅 " +
            formatDate(
                data.set.date
            );


        viewTitle.textContent =
            data.set.title;


        const words =
            Array.isArray(data.words)
                ? data.words
                : [];


        viewCount.textContent =
            words.length +
            " ta lug‘at";


        /* =========================
           SO‘ZLARNI KO‘RSATISH
        ========================= */

        displayWords(
            words
        );


    } catch (error) {

        console.error(
            "Load set error:",
            error
        );


        wordsList.innerHTML = `

            <div class="empty-words">

                <span>
                    ⚠️
                </span>

                <p>
                    Server bilan bog‘lanib bo‘lmadi.
                </p>

                <button
                    type="button"
                    id="retry-load-set"
                >
                    🔄 Qayta urinish
                </button>

            </div>

        `;


        const retryButton =
            document.getElementById(
                "retry-load-set"
            );


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadSet
            );

        }

    }

}


/* =========================
   SO‘ZLARNI CHIQARISH
========================= */

function displayWords(words) {

    wordsList.innerHTML = "";


    /* =========================
       BO‘SH SET
    ========================= */

    if (
        !Array.isArray(words) ||
        words.length === 0
    ) {

        wordsList.innerHTML = `

            <div class="empty-words">

                <span>
                    📖
                </span>

                <p>
                    Bu lug‘at to‘plamida
                    hali so‘zlar yo‘q.
                </p>

            </div>

        `;

        viewCount.textContent =
            "0 ta lug‘at";

        return;

    }


    /* =========================
       SO‘ZLAR
    ========================= */

    words.forEach(
        function (item, index) {

            const wordCard =
                document.createElement(
                    "div"
                );


            wordCard.className =
                "view-word-card";


            wordCard.innerHTML = `

                <div class="view-word-number">
                    ${index + 1}
                </div>


                <div class="view-word-content">

                    <h2 class="word-title">
                        ${escapeHTML(item.word)}
                    </h2>


                    <h3 class="word-translation">
                        ${escapeHTML(item.translation)}
                    </h3>


                    ${
                        item.definition
                        ?
                        `
                        <p class="word-definition">
                            ${escapeHTML(item.definition)}
                        </p>
                        `
                        :
                        ""
                    }


                    ${
                        item.example
                        ?
                        `
                        <p class="word-example">
                            ${escapeHTML(item.example)}
                        </p>
                        `
                        :
                        ""
                    }

                </div>


                <div class="view-word-actions">

                    <button
                        type="button"
                        class="edit-word-button"
                        title="Lug‘atni tahrirlash"
                        aria-label="Lug‘atni tahrirlash"
                    >
                        ✏️
                    </button>


                    <button
                        type="button"
                        class="delete-word-button"
                        title="Lug‘atni o‘chirish"
                        aria-label="Lug‘atni o‘chirish"
                    >
                        🗑️
                    </button>

                </div>

            `;


            /* =========================
               TAHRIRLASH
            ========================= */

            const editButton =
                wordCard.querySelector(
                    ".edit-word-button"
                );


            editButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    localStorage.setItem(
                        "editingWordId",
                        item.id
                    );


                    localStorage.setItem(
                        "selectedSetId",
                        selectedSetId
                    );


                    window.location.href =
                        "edit-word.html";

                }
            );


            /* =========================
               O‘CHIRISH
            ========================= */

            const deleteButton =
                wordCard.querySelector(
                    ".delete-word-button"
                );


            deleteButton.addEventListener(
                "click",
                async function (event) {

                    event.stopPropagation();


                    const confirmed =
                        confirm(
                            `"${item.word}" lug‘atini o‘chirishni xohlaysizmi?`
                        );


                    if (!confirmed) {

                        return;

                    }


                    /* =========================
                       BUTTON HOLATI
                    ========================= */

                    deleteButton.disabled =
                        true;


                    try {

                        const response =
                            await fetch(
                                `${API_URL}/words/${encodeURIComponent(item.id)}`,
                                {
                                    method: "DELETE"
                                }
                            );


                        const data =
                            await response.json();


                        console.log(
                            "Delete word response:",
                            data
                        );


                        /* =========================
                           XATO
                        ========================= */

                        if (!response.ok) {

                            alert(
                                data.error ||
                                "So‘zni o‘chirishda xatolik!"
                            );

                            deleteButton.disabled =
                                false;

                            return;

                        }


                        /* =========================
                           MUVAFFAQIYAT
                        ========================= */

                        alert(
                            data.message ||
                            "So‘z muvaffaqiyatli o‘chirildi!"
                        );


                        /* =========================
                           RO‘YXATNI YANGILASH
                        ========================= */

                        await loadSet();


                    } catch (error) {

                        console.error(
                            "Delete word error:",
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


            wordsList.appendChild(
                wordCard
            );

        }
    );


    /* =========================
       COUNT
    ========================= */

    viewCount.textContent =
        words.length +
        " ta lug‘at";

}


/* =========================
   HTML XAVFSIZLIGI
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
   SANA FORMATLASH
========================= */

function formatDate(date) {

    if (!date) {

        return "—";

    }


    const parts =
        date.split("-");


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

loadSet();
