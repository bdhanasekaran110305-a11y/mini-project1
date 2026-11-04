
const STORAGE_KEY = "members";

const memberTableBody = document.getElementById("memberTableBody");
const memberModal = document.getElementById("memberModal");
const memberForm = document.getElementById("memberForm");
const editIndex = document.getElementById("editIndex");
const modalTitle = document.getElementById("modalTitle");
const saveBtn = document.getElementById("saveBtn");
const emptyMessage = document.getElementById("emptyMessage");
const toast = document.getElementById("toast");

let toastTimer;

// Add sample members only when no member data exists.
// Existing saved members will not be overwritten.
if (localStorage.getItem(STORAGE_KEY) === null) {
    const initialMembers = [
        {
            name: "Dhana",
            phone: "9876543210",
            email: "dhana@gmail.com",
            address: "Sattur"
        },
        {
            name: "Arun",
            phone: "9876543211",
            email: "arun@gmail.com",
            address: "Madurai"
        },
        {
            name: "Kumar",
            phone: "9876543212",
            email: "kumar@gmail.com",
            address: "Chennai"
        }
    ];

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(initialMembers)
    );
}

// Read saved members
function getMembers() {
    try {
        const members = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(members) ? members : [];
    } catch (error) {
        console.error("Unable to read member data:", error);
        return [];
    }
}

// Save members to Local Storage
function saveMembers(members) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(members)
    );
}

// Display all members in the table
function displayMembers() {
    const members = getMembers();

    memberTableBody.replaceChildren();

    members.forEach(function (member, index) {
        const row = document.createElement("tr");

        const values = [
            index + 1,
            member.name,
            member.phone,
            member.email,
            member.address
        ];

        values.forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value ?? "";
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const actionButtons = document.createElement("div");

        actionButtons.className = "action-buttons";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function () {
            editMember(index);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            deleteMember(index);
        });

        actionButtons.append(editButton, deleteButton);
        actionCell.appendChild(actionButtons);
        row.appendChild(actionCell);

        memberTableBody.appendChild(row);
    });

    emptyMessage.hidden = members.length !== 0;
}

// Open the form for a new member
document.getElementById("addMemberBtn").addEventListener(
    "click",
    function () {
        memberForm.reset();
        editIndex.value = "-1";
        modalTitle.textContent = "Add Member";
        saveBtn.textContent = "Save Member";
        memberModal.classList.add("show");
        document.getElementById("memberName").focus();
    }
);

// Close the form
function closeModal() {
    memberModal.classList.remove("show");
    memberForm.reset();
    editIndex.value = "-1";
}

document.getElementById("closeModalBtn").addEventListener(
    "click",
    closeModal
);

memberModal.addEventListener("click", function (event) {
    if (event.target === memberModal) {
        closeModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeModal();
    }
});

// Add a new member or update an existing member
memberForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("memberName")
        .value.trim();

    const phone = document.getElementById("memberPhone")
        .value.trim();

    const email = document.getElementById("memberEmail")
        .value.trim();

    const address = document.getElementById("memberAddress")
        .value.trim();

    if (!name || !phone || !email || !address) {
        showToast("Please fill in all fields.");
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        showToast("Enter a valid 10-digit phone number.");
        return;
    }

    const members = getMembers();
    const currentIndex = Number(editIndex.value);

    // Prevent duplicate phone numbers and email addresses
    const duplicate = members.some(function (member, index) {
        if (index === currentIndex) {
            return false;
        }

        return (
            member.phone === phone ||
            member.email.toLowerCase() === email.toLowerCase()
        );
    });

    if (duplicate) {
        showToast("Phone number or email already exists.");
        return;
    }

    const member = {
        name: name,
        phone: phone,
        email: email,
        address: address
    };

    if (
        editIndex.value !== "-1" &&
        Number.isInteger(currentIndex) &&
        currentIndex >= 0 &&
        currentIndex < members.length
    ) {
        members[currentIndex] = member;
        showToast("Member updated successfully!");
    } else {
        members.push(member);
        showToast("Member added and saved successfully!");
    }

    saveMembers(members);
    displayMembers();
    closeModal();

    // Notify other open pages, such as the dashboard
    window.dispatchEvent(new Event("membersUpdated"));
});

// Edit member
function editMember(index) {
    const members = getMembers();
    const member = members[index];

    if (!member) {
        return;
    }

    document.getElementById("memberName").value = member.name;
    document.getElementById("memberPhone").value = member.phone;
    document.getElementById("memberEmail").value = member.email;
    document.getElementById("memberAddress").value = member.address;

    editIndex.value = String(index);
    modalTitle.textContent = "Edit Member";
    saveBtn.textContent = "Update Member";

    memberModal.classList.add("show");
}

// Delete member
function deleteMember(index) {
    const members = getMembers();

    if (!members[index]) {
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete " +
        members[index].name + "?"
    );

    if (!confirmed) {
        return;
    }

    members.splice(index, 1);

    saveMembers(members);
    displayMembers();

    showToast("Member deleted successfully!");
    window.dispatchEvent(new Event("membersUpdated"));
}

// Show success or error message
function showToast(message) {
    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}

// Load saved members when the page opens
document.addEventListener("DOMContentLoaded", displayMembers);

// Also render immediately because this script uses defer
displayMembers();