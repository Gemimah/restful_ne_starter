import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TZW LTD — Fire Extinguisher Management API',
      version: '1.0.0',
      description: 'RESTful Microservices API for TZW LTD Fire Extinguisher Management System',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}`, description: 'API Gateway' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & User Management (5001)' },
      { name: 'Extinguishers', description: 'Fire Extinguisher CRUD (5002)' },
      { name: 'Inspections', description: 'Inspection Scheduling (5002)' },
      { name: 'Maintenance', description: 'Maintenance Logging (5002)' },
      { name: 'Reports', description: 'Real-time Reports (5003)' },
    ],
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'], summary: 'Register user', security: [],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['firstName', 'lastName', 'email', 'password'],
                  properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'User registered — OTP sent' } },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'], summary: 'Login', security: [],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: { email: { type: 'string' }, password: { type: 'string' } },
                },
              },
            },
          },
          responses: { 200: { description: 'JWT token returned' } },
        },
      },
      '/api/auth/verify-otp': { post: { tags: ['Auth'], summary: 'Verify email OTP', security: [] } },
      '/api/auth/forgot-password': { post: { tags: ['Auth'], summary: 'Request password reset OTP', security: [] } },
      '/api/auth/reset-password': { post: { tags: ['Auth'], summary: 'Reset password with OTP', security: [] } },
      '/api/auth/me': { get: { tags: ['Auth'], summary: 'Get profile' } },
      '/api/auth/profile': { patch: { tags: ['Auth'], summary: 'Update profile' } },
      '/api/auth/change-password': { post: { tags: ['Auth'], summary: 'Change password' } },
      '/api/auth/logout': { post: { tags: ['Auth'], summary: 'Logout' } },
      '/api/auth/users': { get: { tags: ['Auth'], summary: 'List users (ADMIN)' } },
      '/api/extinguishers': {
        get: { tags: ['Extinguishers'], summary: 'List all fire extinguishers' },
        post: { tags: ['Extinguishers'], summary: 'Register extinguisher (ADMIN/INSPECTOR)' },
      },
      '/api/extinguishers/{id}': {
        get: { tags: ['Extinguishers'], summary: 'Get extinguisher details' },
        put: { tags: ['Extinguishers'], summary: 'Update extinguisher (ADMIN/INSPECTOR)' },
        delete: { tags: ['Extinguishers'], summary: 'Delete extinguisher (ADMIN)' },
      },
      '/api/inspections': {
        get: { tags: ['Inspections'], summary: 'List inspections' },
        post: { tags: ['Inspections'], summary: 'Schedule inspection' },
      },
      '/api/inspections/{id}': {
        patch: { tags: ['Inspections'], summary: 'Update inspection status (ADMIN/INSPECTOR)' },
      },
      '/api/maintenance': {
        get: { tags: ['Maintenance'], summary: 'List maintenance logs' },
        post: { tags: ['Maintenance'], summary: 'Log maintenance (ADMIN/INSPECTOR)' },
      },
      '/api/reports/dashboard': { get: { tags: ['Reports'], summary: 'Dashboard summary' } },
      '/api/reports/inventory': { get: { tags: ['Reports'], summary: 'Inventory report' } },
      '/api/reports/inspections': { get: { tags: ['Reports'], summary: 'Inspection report' } },
      '/api/reports/compliance': { get: { tags: ['Reports'], summary: 'Compliance report' } },
      '/api/reports/maintenance': { get: { tags: ['Reports'], summary: 'Maintenance report' } },
      '/api/reports/export/{type}/csv': { get: { tags: ['Reports'], summary: 'Export CSV (inventory|inspections|compliance|maintenance)' } },
      '/api/reports/export/{type}/pdf': { get: { tags: ['Reports'], summary: 'Export PDF' } },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
