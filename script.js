const API_URL = "https://contacts-1-2pnh.onrender.com/upload"; // Your backend URL on Render

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    if (!fileInput) return alert("Please select a file.");

    const formData = new FormData();
    formData.append("file", fileInput);

    const response = await fetch(API_URL, {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    document.getElementById("message").textContent = result.message;
});
