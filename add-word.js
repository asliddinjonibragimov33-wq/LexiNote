const setForm = document.getElementById("set-form");

setForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const date =
        document.getElementById("word-date").value;

    const title =
        document
            .getElementById("word-title")
            .value
            .trim();


    if (!date || !title) {

        alert("Iltimos, sana va mavzuni kiriting.");

        return;
    }


    /* =========================
       LOGIN QILGAN USER
    ========================= */

    const currentUser =
        JSON.parse(
            sessionStorage.getItem("currentUser")
        );


    if (!currentUser) {

        alert("Avval tizimga kiring!");

        window.location.href = "login.html";

        return;
    }


    /* =========================
       BACKENDGA SET YARATISH
    ========================= */

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/sets",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    user_id: currentUser.id,
                    date: date,
                    title: title

                })
            }
        );


        const result = await response.json();

        console.log(
            "Set yaratish javobi:",
            result
        );


        if (!response.ok) {

            alert(
                result.error ||
                "Lug‘at yaratishda xatolik!"
            );

            return;
        }


        /* =========================
           CURRENT SET
        ========================= */

        const currentSet = {

            id: result.set.id,

            date: result.set.date,

            title: result.set.title,

            user_id: result.set.user_id,

            words: []

        };


        localStorage.setItem(
            "currentSet",
            JSON.stringify(currentSet)
        );


        /* =========================
           KEYINGI SAHIFA
        ========================= */

        alert(
            "Lug‘at to‘plami yaratildi!"
        );


        window.location.href =
            "add-words.html";


    } catch (error) {

        console.error(
            "Set yaratish xatosi:",
            error
        );

        alert(
            "Server bilan bog‘lanib bo‘lmadi!"
        );
    }

});