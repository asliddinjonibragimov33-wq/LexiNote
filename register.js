const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirm-password").value;

    // Parollarni tekshirish
    if (password !== confirmPassword) {
        alert("Parollar bir xil emas!");
        return;
    }

    try {
        const response = await fetch(
            "https://lexinote-backend.onrender.com/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    contact: contact,
                    username: username,
                    password: password
                })
            }
        );

        const result = await response.json();

        if (response.ok) {
            alert("Ro'yxatdan o'tish muvaffaqiyatli!");

            console.log(result);
        } else {
            alert(result.error);
        }

    } catch (error) {
        console.error(error);
        alert("Server bilan bog'lanib bo'lmadi!");
    }
});
