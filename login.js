const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    // Bo'sh maydonlarni tekshirish
    if (!username || !password) {
        alert("Login va parolni kiriting!");
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );


        const result =
            await response.json();


        /* =========================
           LOGIN MUVAFFAQIYATLI
        ========================= */

        if (response.ok) {

            // Foydalanuvchi ma'lumotlarini
            // sessionStorage'da saqlaymiz
            sessionStorage.setItem(
                "currentUser",
                JSON.stringify(result.user)
            );


            alert(
                "Kirish muvaffaqiyatli!"
            );


            // Dashboard'ga o'tamiz
            window.location.href =
                "dashboard.html";

        }


        /* =========================
           LOGIN XATO
        ========================= */

        else {

            alert(
                result.error ||
                "Login yoki parol noto'g'ri!"
            );

        }

    }


    /* =========================
       SERVER XATOSI
    ========================= */

    catch (error) {

        console.error(
            "Login xatosi:",
            error
        );

        alert(
            "Server bilan bog'lanib bo'lmadi!"
        );

    }

});