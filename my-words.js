console.log("MY-WORDS JS ISHLADI!");

/* =========================
   ELEMENTLAR
========================= */

const setsList =
    document.getElementById("sets-list");

console.log("setsList:", setsList);


/* =========================
   LOGIN QILGAN USER
========================= */

const currentUser =
    JSON.parse(
        sessionStorage.getItem("currentUser")
    );


if (!currentUser) {

    alert("Avval tizimga kiring!");

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

console.log(
    "Login qilgan user ID:",
    currentUser.id
);


/* =========================
   BACKEND URL
========================= */

const API_URL =
    "https://lexinote-backend.onrender.com";


/* =========================
   BACKENDDAN SETLARNI OLISH
========================= */

async function loadSets() {

    console.log(
        "loadSets() ishga tushdi!"
    );

    try {

        const response =
            await fetch(
                `${API_URL}/sets?user_id=${currentUser.id}`
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

        displaySets(
            data.sets || []
        );


    } catch (error) {

        console.error(
            "Load sets error:",
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

function displaySets(savedSets) {

    console.log(
        "displaySets() ishga tushdi:",
        savedSets
    );


    setsList.innerHTML = "";


    /* =========================
       SETLAR MAVJUD EMAS
    ========================= */

    if (
        !savedSets ||
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
        function(set) {

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
                        ${set.title}
                    </h2>

                    <p>
                        ${set.word_count} ta lug‘at
                    </p>

                </div>

                <button
                    class="delete-set-button"
                    title="Lug‘atni o‘chirish"
                >
                    🗑️
                </button>

                <div class="set-card-arrow">
                    →
                </div>

            `;


            /* =========================
               O‘CHIRISH TUGMASI
            ========================= */

            const deleteButton =
                card.querySelector(
                    ".delete-set-button"
                );


            deleteButton.addEventListener(
                "click",
                async function(event) {

                    event.stopPropagation();


                    const confirmed =
                        confirm(
                            `"${set.title}" lug‘at to‘plamini o‘chirishni xohlaysizmi?`
                        );


                    if (!confirmed) {
                        return;
                    }


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

                            return;
                        }


                        alert(
                            data.message ||
                            "Lug‘at muvaffaqiyatli o‘chirildi!"
                        );


                        /* =========================
                           RO‘YXATNI YANGILASH
                        ========================= */

                        loadSets();


                    } catch (error) {

                        console.error(
                            "Delete set error:",
                            error
                        );


                        alert(
                            "Server bilan bog‘lanib bo‘lmadi!"
                        );

                    }

                }
            );


            /* =========================
               SETNI OCHISH
            ========================= */

            card.addEventListener(
                "click",
                function() {

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

loadSets();
