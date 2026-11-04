document.getElementById("loginForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const savedUser = localStorage.getItem("registeredUser");

    if (savedUser === null) {

        alert("Please create an account first.");

        window.location.href = "reg.html";

        return;
    }

    const user = JSON.parse(savedUser);

    if (username === user.username && password === user.password) {

        alert("Login successful!");

        window.location.href = "dashboard.html";

    } else {

        alert("Invalid username or password.");

    }

});