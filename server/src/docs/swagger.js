import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RESTful NE API',
      version: '1.0.0',
      description: 'Exam starter API — update title/description for your project',
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/auth/*.js', './src/modules/**/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
