const currentSet = JSON.parse(
    localStorage.getItem("currentSet")
);


if (!currentSet) {

    alert(
        "Lug‘at to‘plami topilmadi."
    );

    window.location.href =
        "add-word.html";

    throw new Error(
        "currentSet mavjud emas"
    );
}
if (!currentSet) {

    alert("Lug‘at to‘plami topilmadi.");

    window.location.href = "add-word.html";

}


/* =========================
   TO‘PLAM MA'LUMOTLARI
========================= */

const setDate =
    document.getElementById("set-date");

const setTitle =
    document.getElementById("set-title");

setDate.textContent =
    "📅 " + formatDate(currentSet.date);

setTitle.textContent =
    currentSet.title;


/* =========================
   ELEMENTLAR
========================= */

const wordForm =
    document.getElementById("word-form");

const wordsList =
    document.getElementById("words-list");

const wordCount =
    document.getElementById("word-count");

const saveSetButton =
    document.getElementById("save-set-button");


/* =========================
   SO‘Z MAYDONLARI
========================= */

const wordInput =
    document.getElementById("word");

const translationInput =
    document.getElementById("translation");

const definitionInput =
    document.getElementById("definition");

const exampleInput =
    document.getElementById("example");


/* =========================
   SO‘ZLAR
========================= */

let words = [];


/* =========================
   BACKENDDAN SO‘ZLARNI OLISH
========================= */

async function loadWords() {

    try {

        const response = await fetch(
            `http://127.0.0.1:5000/sets/${currentSet.id}/words`
        );

        const data = await response.json();

        console.log(
            "Backenddan kelgan so‘zlar:",
            data
        );

        if (!response.ok) {

            alert(
                data.error ||
                "So‘zlarni yuklashda xatolik!"
            );

            return;
        }

        words = data.words;

        displayWords();

    } catch (error) {

        console.error(
            "Load words error:",
            error
        );

        alert(
            "Server bilan bog‘lanib bo‘lmadi!"
        );
    }
}


/* =========================
   SO‘Z QO‘SHISH
========================= */

wordForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const word =
            wordInput.value.trim();

        const translation =
            translationInput.value.trim();

        const definition =
            definitionInput.value.trim();

        const example =
            exampleInput.value.trim();


        if (!word || !translation) {

            alert(
                "Iltimos, so‘z va tarjimasini kiriting."
            );

            return;
        }


        try {

            const response = await fetch(
                `http://127.0.0.1:5000/sets/${currentSet.id}/words`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        word: word,
                        translation: translation,
                        definition: definition,
                        example: example
                    })
                }
            );


            const data =
                await response.json();


            console.log(
                "So‘z qo‘shish javobi:",
                data
            );


            if (!response.ok) {

                alert(
                    data.error ||
                    "So‘zni saqlashda xatolik!"
                );

                return;
            }


            /* =========================
               BACKENDDAN QAYTGAN SO‘Z
            ========================= */

            words.push(
                data.word
            );


            displayWords();


            wordForm.reset();


            alert(
                "So‘z muvaffaqiyatli saqlandi!"
            );


        } catch (error) {

            console.error(
                "Add word error:",
                error
            );

            alert(
                "Server bilan bog‘lanib bo‘lmadi!"
            );
        }

    }
);


/* =========================
   SO‘ZLARNI KO‘RSATISH
========================= */

function displayWords() {

    wordsList.innerHTML = "";


    if (words.length === 0) {

        wordsList.innerHTML = `

            <div class="empty-words">

                <span>
                    📖
                </span>

                <p>
                    Hali hech qanday
                    lug‘at qo‘shilmagan.
                </p>

            </div>

        `;

        wordCount.textContent = "0";

        return;
    }


    words.forEach(
        function(item, index) {

            const wordElement =
                document.createElement("div");


            wordElement.className =
                "word-item";


            wordElement.innerHTML = `

                <div class="word-item-info">

                    <div class="word-item-word">
                        ${item.word}
                    </div>

                    <div class="word-item-translation">
                        ${item.translation}
                    </div>

                    ${
                        item.definition
                        ?
                        `
                        <div class="word-item-definition">
                            ${item.definition}
                        </div>
                        `
                        :
                        ""
                    }

                    ${
                        item.example
                        ?
                        `
                        <div class="word-item-example">
                            ${item.example}
                        </div>
                        `
                        :
                        ""
                    }

                </div>


                <div class="word-item-actions">

                    <button
                        class="delete-word"
                        onclick="deleteWord(${item.id})"
                    >
                        🗑️
                    </button>

                </div>

            `;


            wordsList.appendChild(
                wordElement
            );

        }
    );


    wordCount.textContent =
        words.length;
}


/* =========================
   SO‘ZNI O‘CHIRISH
========================= */

async function deleteWord(wordId) {

    const confirmed =
        confirm(
            "Bu so‘zni o‘chirishni xohlaysizmi?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `http://127.0.0.1:5000/words/${wordId}`,
                {
                    method: "DELETE"
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


        words =
            words.filter(
                function(item) {
                    return item.id !== wordId;
                }
            );


        displayWords();


        alert(
            data.message
        );


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


/* =========================
   SAQLASH
========================= */

saveSetButton.addEventListener(
    "click",
    function() {

        if (words.length === 0) {

            alert(
                "Avval kamida bitta lug‘at qo‘shing."
            );

            return;
        }


        alert(
            "Lug‘atlar muvaffaqiyatli saqlandi!"
        );


        window.location.href =
            "my-words.html";

    }
);


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
   BOSHLANG‘ICH HOLAT
========================= */

loadWords();