const fs = require('fs');
const mic = require('mic');
const wav = require('wav');
const axios = require('axios');
const FormData = require('form-data');

// Load environment variables
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Configuración de la grabación
const recordingOptions = {
  rate: 16000,       // Tasa de muestreo (puedes ajustar según sea necesario)
  channels: 1,       // Número de canales (1 para mono)
  debug: true,
};

// Nombre del archivo WAV para almacenar la grabación
const wavFileName = 'audio_input.wav';

// Crear un objeto de escritura para el archivo WAV
const fileWriter = new wav.FileWriter(wavFileName, {
  channels: recordingOptions.channels,
  sampleRate: recordingOptions.rate,
  bitDepth: 32,
});

// Crear un objeto de entrada de micrófono
const microphone = mic(recordingOptions);

// Configurar la transmisión de micrófono al archivo WAV
const micInputStream = microphone.getAudioStream();
micInputStream.pipe(fileWriter);

console.log('Grabando audio durante 10 segundos...');

// Manejar eventos de finalización de la grabación
micInputStream.on('error', (error) => {
  console.error('Error en la transmisión de audio:', error);
});

// Iniciar la grabación
microphone.start();

// Detener la grabación después de 5 segundos
setTimeout(async () => {
  console.log('Deteniendo la grabación...');
  microphone.stop();
  fileWriter.end();

  // Enviar el archivo de audio a OpenAI
  await sendAudioToOpenAI(wavFileName);
}, 10000);

// Función para enviar datos de audio a OpenAI
async function sendAudioToOpenAI(audioFilePath) {
  try {
    const formData = new FormData();
    const stream = fs.createReadStream(audioFilePath);
    formData.append('file', stream, { knownLength: fs.statSync(audioFilePath).size, filename: 'audio_input.wav' });
    formData.append('model', 'whisper-1');
    formData.append('language', 'es'); // Ajusta el idioma según sea necesario

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
    });

    console.log('Respuesta de OpenAI:', response.data.text);
  } catch (error) {
    console.error('Error al enviar datos de audio a OpenAI:', error.message);
  }
}

