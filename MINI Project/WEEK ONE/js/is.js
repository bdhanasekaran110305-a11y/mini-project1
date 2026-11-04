
const STORAGE_KEY = "digitalLibraryIssuedBooks";

let issuedBooks = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
);

const issueForm = document.getElementById("issueForm");
const issueTable = document.getElementById("issueTable");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");

const today = new Date();
const todayString = formatDate(today);

document.getElementById("issueDate").value = todayString;
document.getElementById("issueDate").min = todayString;
document.getElementById("dueDate").min = todayString;

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function saveBooks() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(issuedBooks)
    );
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}

function getStatus(book) {
    if (book.returned) {
        return "Returned";
    }

    if (book.dueDate < todayString) {
        return "Overdue";
    }

    return "Active";
}

issueForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const bookId = document
        .getElementById("issueBookId")
        .value.trim();

    const bookName = document
        .getElementById("issueBookName")
        .value.trim();

    const memberId = document
        .getElementById("memberId")
        .value.trim();

    const memberName = document
        .getElementById("memberName")
        .value.trim();

    const issueDate = document
        .getElementById("issueDate")
        .value;

    const dueDate = document
        .getElementById("dueDate")
        .value;

    if (dueDate < issueDate) {
        showMessage(
            "Due date cannot be earlier than issue date.",
            "error"
        );
        return;
    }

    const duplicate = issuedBooks.some(book =>
        book.bookId.toLowerCase() === bookId.toLowerCase() &&
        book.memberId.toLowerCase() === memberId.toLowerCase() &&
        !book.returned
    );

    if (duplicate) {
        showMessage(
            "This book is already issued to this member and has not been returned.",
            "error"
        );
        return;
    }

    const newBook = {
        id: Date.now(),
        bookId,
        bookName,
        memberId,
        memberName,
        issueDate,
        dueDate,
        returned: false
    };

    issuedBooks.push(newBook);

    saveBooks();
    renderBooks();

    issueForm.reset();

    document.getElementById("issueDate").value = todayString;
    document.getElementById("issueDate").min = todayString;
    document.getElementById("dueDate").min = todayString;

    showMessage("Book issued successfully!", "success");
});

function renderBooks() {
    issueTable.innerHTML = "";

    const query = searchInput.value.trim().toLowerCase();

    const filteredBooks = issuedBooks.filter(book =>
        [
            book.bookId,
            book.bookName,
            book.memberId,
            book.memberName,
            book.issueDate,
            book.dueDate
        ].some(value =>
            String(value).toLowerCase().includes(query)
        )
    );

    filteredBooks.forEach((book, index) => {
        const status = getStatus(book);

        const row = document.createElement("tr");

        const values = [
            index + 1,
            book.bookId,
            book.bookName,
            book.memberId,
            book.memberName,
            book.issueDate,
            book.dueDate
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        statusBadge.className =
            "status " + status.toLowerCase();

        statusBadge.textContent = status;

        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        const actionCell = document.createElement("td");

        if (!book.returned) {
            const returnButton = document.createElement("button");

            returnButton.className = "action-btn return-btn";
            returnButton.textContent = "Return";

            returnButton.addEventListener("click", () => {
                returnBook(book.id);
            });

            actionCell.appendChild(returnButton);
        }

        const deleteButton = document.createElement("button");

        deleteButton.className = "action-btn delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteBook(book.id);
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        issueTable.appendChild(row);
    });

    document.getElementById("emptyMessage").style.display =
        filteredBooks.length === 0 ? "block" : "none";

    updateStats();
}

function updateStats() {
    const activeBooks = issuedBooks.filter(
        book => !book.returned
    );

    const overdueBooks = activeBooks.filter(
        book => book.dueDate < todayString
    );

    document.getElementById("totalIssued").textContent =
        issuedBooks.length;

    document.getElementById("activeIssued").textContent =
        activeBooks.length;

    document.getElementById("overdueBooks").textContent =
        overdueBooks.length;
}

function returnBook(id) {
    const book = issuedBooks.find(book => book.id === id);

    if (!book) {
        return;
    }

    if (!confirm(`Mark "${book.bookName}" as returned?`)) {
        return;
    }

    book.returned = true;

    saveBooks();
    renderBooks();

    showMessage("Book returned successfully!", "success");
}

function deleteBook(id) {
    if (!confirm("Are you sure you want to delete this record?")) {
        return;
    }

    issuedBooks = issuedBooks.filter(book => book.id !== id);

    saveBooks();
    renderBooks();

    showMessage("Issue record deleted.", "success");
}

searchInput.addEventListener("input", renderBooks);

renderBooks();

