const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const vision = require('@google-cloud/vision');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Configuración de Google Cloud Vision
const client = new vision.ImageAnnotatorClient({
  keyFilename: 'athena-436216-51da7ff758e9.json',
});

// Middleware para servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Ruta para el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
      const filePath = path.join(__dirname, req.file.path);
      const [result] = await client.textDetection(filePath);
      const detections = result.textAnnotations;
      const detectedText = detections.map(text => text.description).join('\n');
      
      // Enviar el texto detectado como respuesta de texto plano
      res.send(detectedText);
    } catch (error) {
      console.error(error); // Log del error en la consola
      res.status(500).send('Error detecting text');
    }
  });

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});