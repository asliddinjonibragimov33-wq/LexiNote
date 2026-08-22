const currentUser = JSON.parse(
    sessionStorage.getItem("currentUser")
);


/* =========================
   LOGIN TEKSHIRISH
========================= */

if (!currentUser) {

    alert("Avval tizimga kiring!");

    window.location.href = "login.html";

} else {

    /* =========================
       ISM
    ========================= */

    const userName =
        document.getElementById("navbar-user-name");

    if (userName) {

        userName.textContent =
            currentUser.name;

    }


    /* =========================
       AVATAR
    ========================= */

    const userAvatar =
        document.getElementById("user-avatar");

    if (userAvatar) {

        userAvatar.textContent =
            currentUser.name
                .charAt(0)
                .toUpperCase();

    }


    /* =========================
       CHIQISH
    ========================= */

    const logoutButton =
        document.querySelector(".logout-btn");


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                const confirmed =
                    confirm(
                        "Tizimdan chiqishni xohlaysizmi?"
                    );


                if (!confirmed) {
                    return;
                }


                sessionStorage.removeItem(
                    "currentUser"
                );


                window.location.href =
                    "login.html";

            }
        );

    }

}