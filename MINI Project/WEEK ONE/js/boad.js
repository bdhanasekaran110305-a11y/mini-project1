
document.addEventListener("DOMContentLoaded", function () {
    loadDashboard();
});

// Load dashboard data
function loadDashboard() {

    // Get Books
    let books = JSON.parse(localStorage.getItem("books")) || [];

    // Calculate total book quantity
    let totalBookQuantity = 0;

    for (let i = 0; i < books.length; i++) {
        totalBookQuantity += Number(books[i].quantity) || 0;
    }

    document.getElementById("totalBooks").textContent =
        totalBookQuantity;

    // Get Members
    let members = JSON.parse(localStorage.getItem("members")) || [];

    document.getElementById("totalMembers").textContent =
        members.length;

    // Get Issued Books
    let issuedBooks =
        JSON.parse(localStorage.getItem("issuedBooks")) || [];

    document.getElementById("issuedBooks").textContent =
        issuedBooks.length;

    // Get Returned Books
    let returnedBooks =
        JSON.parse(localStorage.getItem("returnedBooks")) || [];

    document.getElementById("returnedBooks").textContent =
        returnedBooks.length;
}

// Refresh dashboard when returning to this page
window.addEventListener("pageshow", function () {
    loadDashboard();
});

// Navigate to another page
function goToPage(page) {
    window.location.href = page;
}

