const fs = require('fs');
const mic = require('mic');
const wav = require('wav');

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

console.log('Grabando audio durante 5 segundos...');

// Manejar eventos de finalización de la grabación
micInputStream.on('error', (error) => {
  console.error('Error en la transmisión de audio:', error);
});

// Iniciar la grabación
microphone.start();

// Detener la grabación después de 5 segundos
setTimeout(() => {
  console.log('Deteniendo la grabación...');
  microphone.stop();
  fileWriter.end();
}, 5000);
