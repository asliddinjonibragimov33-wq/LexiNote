/* =========================
   LOGIN QILGAN USER
========================= */

const currentUserData =
    sessionStorage.getItem(
        "currentUser"
    );


/* =========================
   LOGIN TEKSHIRISH
========================= */

if (!currentUserData) {

    alert(
        "Avval tizimga kiring!"
    );

    window.location.href =
        "login.html";

    throw new Error(
        "User login qilmagan."
    );
}


/* =========================
   USER MA'LUMOTLARI
========================= */

let currentUser;

try {

    currentUser =
        JSON.parse(
            currentUserData
        );

} catch (error) {

    console.error(
        "currentUser ma'lumotlarini o‘qishda xatolik:",
        error
    );

    sessionStorage.removeItem(
        "currentUser"
    );

    alert(
        "Sessiya ma'lumotlari buzilgan. Qaytadan kiring."
    );

    window.location.href =
        "login.html";

    throw new Error(
        "currentUser JSON noto‘g‘ri."
    );
}


/* =========================
   USER ISMI
========================= */

const userNameElement =
    document.getElementById(
        "user-name"
    );


const navbarUserNameElement =
    document.getElementById(
        "navbar-user-name"
    );


const userAvatarElement =
    document.getElementById(
        "user-avatar"
    );


/* =========================
   USER MA'LUMOTLARINI
   SAHIFAGA CHIQARISH
========================= */

if (userNameElement) {

    userNameElement.textContent =
        currentUser.name;
}


if (navbarUserNameElement) {

    navbarUserNameElement.textContent =
        currentUser.name;
}


if (userAvatarElement) {

    userAvatarElement.textContent =
        currentUser.name
            .charAt(0)
            .toUpperCase();
}


/* =========================
   LOGOUT
========================= */

const logoutButton =
    document.querySelector(
        ".logout-btn"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            /* =========================
               LOGIN MA'LUMOTLARINI
               O‘CHIRISH
            ========================= */

            sessionStorage.removeItem(
                "currentUser"
            );


            /* =========================
               LOGIN SAHIFASIGA
            ========================= */

            window.location.href =
                "login.html";

        }
    );

}


/* =========================
   DEBUG
========================= */

console.log(
    "Dashboard user:",
    currentUser
);

/* =========================
   LEXINOTE STATISTIKASI
========================= */
const API_URL =
    "https://lexinote-backend.onrender.com";

async function loadStatistics() {
    try {
        const response =
            await fetch(
                `${API_URL}/statistics`
            );

        if (!response.ok) {

            throw new Error(
                "Statistikani olishda xatolik."
            );
        }

        const data =
            await response.json();

        /* =========================
           FOYDALANUVCHILAR
        ========================= */
        const registeredUsers =
            document.getElementById(
                "registered-users"
            );

        if (registeredUsers) {

            registeredUsers.textContent =
                data.registered_users;
        }

        /* =========================
           LUG‘ATLAR
        ========================= */
        const createdSets =
            document.getElementById(
                "created-sets"
            );

        if (createdSets) {
            createdSets.textContent =
                data.created_sets;
        }

        /* =========================
           SO‘ZLAR
        ========================= */
        const savedWords =
            document.getElementById(
                "saved-words"
            );

        if (savedWords) {

            savedWords.textContent =
                Number(
                    data.saved_words
                ).toLocaleString(
                    "en-US"
                );
        }
       
    } catch (error) {
        console.error(
            "Statistikani yuklashda xatolik:",
            error
        );
    }
}

loadStatistics();
