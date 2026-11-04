
document.addEventListener("DOMContentLoaded", loadReturnBooks);

function getArray(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function getBookName(book) {
    return book.bookName || book.bookTitle || book.title || book.name || "Unknown Book";
}

function getBookId(book) {
    return book.bookId || book.id || "N/A";
}

function getMemberName(book) {
    return book.memberName || book.studentName || book.userName || book.name || "Unknown Member";
}

function getIssueDate(book) {
    return book.issueDate || book.issuedDate || "-";
}

function getDueDate(book) {
    return book.dueDate || book.returnDate || "-";
}

function isReturned(book) {
    const status = String(book.status || "").toLowerCase();

    return Boolean(book.returned) ||
        ["returned", "return", "completed"].includes(status);
}

function isOverdue(book) {
    const dueDate = getDueDate(book);

    if (dueDate === "-" || isReturned(book)) {
        return false;
    }

    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) {
        return false;
    }

    due.setHours(23, 59, 59, 999);
    return due < new Date();
}

function loadReturnBooks() {
    const issuedBooks = getArray("issuedBooks");
    const returnedBooks = getArray("returnedBooks");

    const activeBooks = issuedBooks.filter(book => !isReturned(book));

    document.getElementById("issuedCount").textContent = activeBooks.length;
    document.getElementById("returnedCount").textContent = returnedBooks.length;
    document.getElementById("overdueCount").textContent =
        activeBooks.filter(isOverdue).length;

    renderReturnTable();
}

function renderReturnTable() {
    const issuedBooks = getArray("issuedBooks");
    const search = document.getElementById("searchInput")
        .value.trim().toLowerCase();

    const table = document.getElementById("returnTable");

    const filteredBooks = issuedBooks
        .map((book, index) => ({ book, index }))
        .filter(({ book }) => {
            const searchableText = [
                getBookId(book),
                getBookName(book),
                getMemberName(book),
                book.memberId || "",
                book.studentId || ""
            ].join(" ").toLowerCase();

            return !isReturned(book) && searchableText.includes(search);
        });

    document.getElementById("recordCount").textContent =
        filteredBooks.length + (filteredBooks.length === 1
            ? " record found"
            : " records found");

    if (filteredBooks.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    📚 No issued books found.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = filteredBooks.map(({ book, index }) => {
        const overdue = isOverdue(book);
        const status = overdue ? "Overdue" : "Issued";
        const statusClass = overdue ? "overdue" : "issued";

        return `
            <tr>
                <td>
                    <span class="book-title">${escapeHTML(getBookName(book))}</span>
                    <span class="book-id">ID: ${escapeHTML(getBookId(book))}</span>
                </td>

                <td>${escapeHTML(getMemberName(book))}</td>

                <td>${escapeHTML(getIssueDate(book))}</td>

                <td>${escapeHTML(getDueDate(book))}</td>

                <td>
                    <span class="status ${statusClass}">${status}</span>
                </td>

                <td>
                    <button class="return-btn" onclick="returnBook(${index})">
                        ↩ Return
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function returnBook(index) {
    const issuedBooks = getArray("issuedBooks");
    const returnedBooks = getArray("returnedBooks");

    if (!issuedBooks[index] || isReturned(issuedBooks[index])) {
        showMessage("This book has already been returned or is unavailable.", "error");
        loadReturnBooks();
        return;
    }

    const book = issuedBooks[index];

    const confirmed = confirm(
        `Confirm return of "${getBookName(book)}" by ${getMemberName(book)}?`
    );

    if (!confirmed) {
        return;
    }

    const returnedDate = new Date().toISOString().slice(0, 10);

    book.status = "Returned";
    book.returned = true;
    book.actualReturnDate = returnedDate;

    returnedBooks.push({
        ...book,
        status: "Returned",
        returned: true,
        actualReturnDate: returnedDate
    });

    try {
        localStorage.setItem("issuedBooks", JSON.stringify(issuedBooks));
        localStorage.setItem("returnedBooks", JSON.stringify(returnedBooks));

        showMessage(
            `Success! "${getBookName(book)}" has been returned.`,
            "success"
        );

        loadReturnBooks();
    } catch (error) {
        showMessage("Unable to save the return. Please check browser storage.", "error");
    }
}

function showMessage(message, type) {
    const messageBox = document.getElementById("message");

    messageBox.textContent = message;
    messageBox.className = "message " + type;

    window.clearTimeout(showMessage.timer);

    showMessage.timer = window.setTimeout(() => {
        messageBox.className = "message";
        messageBox.textContent = "";
    }, 4000);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

document.getElementById("searchInput").addEventListener("input", renderReturnTable);
