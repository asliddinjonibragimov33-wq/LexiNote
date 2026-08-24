/* =========================
   SET ID
========================= */

const selectedSetId =
    localStorage.getItem("selectedSetId");


/* =========================
   LOGIN QILGAN USER
========================= */

if (!currentUser) {

    alert("Avval tizimga kiring!");

    window.location.href =
        "login.html";

}


/* =========================
   SET ID TEKSHIRISH
========================= */

if (!selectedSetId) {

    alert(
        "Lug‘at to‘plami tanlanmagan."
    );

    window.location.href =
        "my-words.html";

}


/* =========================
   ELEMENTLAR
========================= */

const viewDate =
    document.getElementById("view-date");

const viewTitle =
    document.getElementById("view-title");

const viewCount =
    document.getElementById("view-count");

const wordsList =
    document.getElementById("view-words-list");


/* =========================
   BACKENDDAN SETNI OLISH
========================= */

async function loadSet() {

    try {

        const response =
            await fetch(
                `https://lexinote-backend.onrender.com/sets/${selectedSetId}/words?user_id=${currentUser.id}`
            );


        const data =
            await response.json();


        console.log(
            "View words backend:",
            data
        );


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
           SET MA'LUMOTLARI
        ========================= */

        viewDate.textContent =
            "📅 " +
            formatDate(
                data.set.date
            );


        viewTitle.textContent =
            data.set.title;


        viewCount.textContent =
            data.words.length +
            " ta lug‘at";


        /* =========================
           SO‘ZLARNI KO‘RSATISH
        ========================= */

        displayWords(
            data.words
        );


    } catch (error) {

        console.error(
            "Load set error:",
            error
        );


        alert(
            "Server bilan bog‘lanib bo‘lmadi!"
        );

    }

}


/* =========================
   SO‘ZLARNI CHIQARISH
========================= */

function displayWords(words) {

    wordsList.innerHTML = "";


    if (words.length === 0) {

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

        return;
    }


    words.forEach(
        function(item, index) {

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

                    <h2>
                        ${item.word}
                    </h2>


                    <h3>
                        ${item.translation}
                    </h3>


                    ${
                        item.definition
                        ?
                        `
                        <p class="word-definition">
                            ${item.definition}
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
                            ${item.example}
                        </p>
                        `
                        :
                        ""
                    }

                </div>


                <div class="view-word-actions">

                    <button
                        class="edit-word-button"
                        title="Lug‘atni tahrirlash"
                    >
                        ✏️
                    </button>


                    <button
                        class="delete-word-button"
                        title="Lug‘atni o‘chirish"
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
                function(event) {

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
                async function(event) {

                    event.stopPropagation();


                    const confirmed =
                        confirm(
                            `"${item.word}" lug‘atini o‘chirishni xohlaysizmi?`
                        );


                    if (!confirmed) {
                        return;
                    }


                    try {

                        const response =
                            await fetch(
                                `https://lexinote-backend.onrender.com/words/${item.id}`,
                                {
                                    method:
                                        "DELETE"
                                }
                            );


                        const data =
                            await response.json();


                        if (!response.ok) {

                            alert(
                                data.error ||
                                "So‘zni o‘chirishda xatolik!"
                            );

                            return;
                        }


                        alert(
                            data.message
                        );


                        loadSet();


                    } catch (error) {

                        console.error(
                            "Delete word error:",
                            error
                        );


                        alert(
                            "Server bilan bog‘lanib bo‘lmadi!"
                        );

                    }

                }
            );


            wordsList.appendChild(
                wordCard
            );

        }
    );

}


/* =========================
   SANA FORMATLASH
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

loadSet();
