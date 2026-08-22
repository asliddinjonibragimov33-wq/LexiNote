console.log("MY-WORDS JS ISHLADI!");

const setsList =
    document.getElementById("sets-list");

console.log("setsList:", setsList);

const userId =
    JSON.parse(
        sessionStorage.getItem("currentUser")
    ).id;

console.log("currentUser:", currentUser);


if (!currentUser) {

    alert("Avval tizimga kiring!");

    window.location.href =
        "login.html";

} else {

    console.log(
        "Login qilgan user ID:",
        currentUser.id
    );

}


/* =========================
   BACKENDDAN SETLARNI OLISH
========================= */

async function loadSets() {

    console.log("loadSets() ishga tushdi!");

    try {

        const response =
            await fetch(
                `http://127.0.0.1:5000/sets?user_id=${currentUser.id}`
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


        if (!response.ok) {

            alert(
                data.error ||
                "Lug‘atlarni yuklashda xatolik!"
            );

            return;
        }


        displaySets(data.sets);


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


    if (savedSets.length === 0) {

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


    savedSets.forEach(function(set) {

        const card =
            document.createElement("div");

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
           O‘CHIRISH
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
                            `http://127.0.0.1:5000/sets/${set.id}`,
                            {
                                method: "DELETE"
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        alert(
                            data.error ||
                            "Lug‘atni o‘chirishda xatolik!"
                        );

                        return;
                    }


                    alert(data.message);

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


        setsList.appendChild(card);

    });

}


/* =========================
   SANA
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