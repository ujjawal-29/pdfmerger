// Handle form submission for merging PDFs
const form = document.getElementById('pdfForm');
const messageDiv = document.getElementById('message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const files = document.getElementById('pdfs').files;

  if (files.length === 0) {
    messageDiv.innerHTML = `
      <div class="alert alert-warning">
        ⚠️ Please select at least one PDF file!
      </div>`;
    return;
  }

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('pdfs', files[i]);
  }

  messageDiv.innerHTML = `
    <div class="alert alert-info">
      ⏳ Merging PDFs, please wait...
    </div>`;

  try {
    const response = await fetch('/merge', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      messageDiv.innerHTML = `
        <div class="alert alert-success">
          ✅ PDFs merged successfully! Download should start automatically.
        </div>`;
    } else {
      messageDiv.innerHTML = `
        <div class="alert alert-danger">
          ❌ Error while merging PDFs!
        </div>`;
    }
  } catch (error) {
    console.error(error);
    messageDiv.innerHTML = `
      <div class="alert alert-danger">
        🚨 Server error occurred!
      </div>`;
  }
});
