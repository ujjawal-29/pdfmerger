const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('templates'));

// Serve HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Handle PDF upload and merge
app.post('/merge', upload.array('pdfs'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No PDFs uploaded!');
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of req.files) {
      const pdfBytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
      fs.unlinkSync(file.path); // delete uploaded file after merging
    }

    const mergedPdfFile = await mergedPdf.save();
    const outputPath = path.join(__dirname, 'uploads', 'merged.pdf');
    fs.writeFileSync(outputPath, mergedPdfFile);

    res.download(outputPath, 'merged.pdf', (err) => {
      if (err) console.error(err);
      // Optionally delete merged file after download
      // fs.unlinkSync(outputPath);
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error while merging PDFs');
  }
});

app.listen(2000, () => {
  console.log('🚀 Server running at http://localhost:2000');
});
