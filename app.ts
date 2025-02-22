import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth';
import reset from './routes/restablecercontraseña';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import redis from './config/configRedis';
import path from 'path';

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Swagger setup
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version
  });
});

app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente en el despliegue');
});

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/reset', reset);

app.get("/cache", async (req, res) => {
  const data = await redis.get("mensaje");
  res.json({ mensaje: data || "No hay datos en caché" });
});

app.post("/cache", async (req, res) => {
  const { key, value } = req.body;
  await redis.set(key, value);
  res.json({ success: true });

});
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  'http://localhost:8080',
  'https://microservicioautenticacion-bje8eahhh2hsf5dt.eastus-01.azurewebsites.net'
];

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);

});
