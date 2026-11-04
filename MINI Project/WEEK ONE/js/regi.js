document.querySelector("form").addEventListener("submit", function(event) {

    event.preventDefault();

    // Get values from the form
    let username = document.querySelector('input[type="text"]').value;
    let email = document.querySelector('input[type="email"]').value;
    let phone = document.querySelector('input[type="tel"]').value;
    let password = document.querySelector('input[type="password"]').value;

    // Create user account
    let user = {
        username: username,
        email: email,
        phone: phone,
        password: password
    };

    // Save account in Local Storage
    localStorage.setItem("userAccount", JSON.stringify(user));

    alert("Registration successful!");

    // Go to login page
    window.location.href = "/Pages/Login/loginPage.html";
});