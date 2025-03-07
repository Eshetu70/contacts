const API_URL = "https://contacts-2-1no4.onrender.com"; 

function showContactForm() {
    document.getElementById("contactFormSection").classList.remove("hidden");
    document.getElementById("adminPanelSection").classList.add("hidden");
}

function showAdminPanel() {
    document.getElementById("contactFormSection").classList.add("hidden");
    document.getElementById("adminPanelSection").classList.remove("hidden");
    loadAdminPanel();
}

document.getElementById("contactForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetch(`${API_URL}/contact`, { method: "POST", body: formData });
    const result = await response.json();
    document.getElementById("responseMessage").textContent = result.message;
});

async function loadAdminPanel() {
    const response = await fetch(`${API_URL}/admin/contacts`);
    const data = await response.json();
    document.getElementById("contactsList").innerHTML = data.map(contact => `<li>${contact.name} (${contact.email}): ${contact.message}</li>`).join('');
}
