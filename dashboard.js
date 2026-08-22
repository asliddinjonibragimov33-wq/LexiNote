const currentUser = sessionStorage.getItem("currentUser");

// Login qilmagan foydalanuvchini login sahifasiga yuboramiz
if (!currentUser) {
    window.location.href = "login.html";
} else {

    const user = JSON.parse(currentUser);

    // Foydalanuvchi ismi
    document.getElementById("user-name").textContent = user.name;

    document.getElementById("navbar-user-name").textContent =
        user.name;

    // Avatar
    document.getElementById("user-avatar").textContent =
        user.name.charAt(0).toUpperCase();
}


// Chiqish tugmasi
const logoutButton = document.querySelector(".logout-btn");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {

        // Login ma'lumotlarini o'chiramiz
        sessionStorage.removeItem("currentUser");

        // Login sahifasiga qaytamiz
        window.location.href = "login.html";
    });
}

