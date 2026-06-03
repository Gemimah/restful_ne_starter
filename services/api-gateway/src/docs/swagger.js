import swaggerJsdoc from 'swagger-jsdoc';

const jsonBody = (schema, example) => ({
  content: { 'application/json': { schema, example } },
});

const bearer = [{ bearerAuth: [] }];
const noAuth = [];

const extinguisherBody = {
  type: 'object',
  required: ['serialNumber', 'location', 'type', 'size', 'installationDate', 'expiryDate'],
  properties: {
    serialNumber: { type: 'string', example: 'FE-TZW-001' },
    location: { type: 'string', example: 'Building A - Floor 1' },
    type: { type: 'string', enum: ['WATER', 'CO2', 'FOAM', 'DRY_CHEMICAL'], example: 'CO2' },
    size: { type: 'string', enum: ['LB_1_5', 'LB_5', 'LB_9', 'LB_12'], example: 'LB_5' },
    installationDate: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z' },
    expiryDate: { type: 'string', format: 'date-time', example: '2026-01-15T00:00:00.000Z' },
    status: { type: 'string', enum: ['ACTIVE', 'EXPIRED', 'NEEDS_INSPECTION', 'OUT_OF_SERVICE'], example: 'ACTIVE' },
    assignedInspectorId: { type: 'string', format: 'uuid', nullable: true, description: 'INSPECTOR user assigned for field work' },
  },
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TZW LTD — Fire Extinguisher Management API',
      version: '1.0.0',
      description:
        'RESTful Microservices API (Gateway :5000). Start all services with `npm run dev`. ' +
        'Use **Authorize** with your JWT: paste the token only, or `Bearer <token>`. ' +
        'Seeded admin: admin@tzw.com / Admin@123',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}`, description: 'API Gateway' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication & users (auth-service :5001)' },
      { name: 'Extinguishers', description: 'Fire extinguisher CRUD (resource-service :5002)' },
      { name: 'Inspections', description: 'Inspections (resource-service :5002)' },
      { name: 'Maintenance', description: 'Maintenance logs (resource-service :5002)' },
      { name: 'Reports', description: 'Reports & export (reporting-service :5003)' },
    ],
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register user (sends OTP email)',
          security: noAuth,
          requestBody: jsonBody(
            {
              type: 'object',
              required: ['firstName', 'lastName', 'email', 'password'],
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 6 },
              },
            },
            { firstName: 'John', lastName: 'Inspector', email: 'john@example.com', password: 'Pass1234' }
          ),
          responses: { 201: { description: 'Registered — verify OTP' } },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login (verified users only)',
          security: noAuth,
          requestBody: jsonBody(
            {
              type: 'object',
              required: ['email', 'password'],
              properties: { email: { type: 'string' }, password: { type: 'string' } },
            },
            { email: 'admin@tzw.com', password: 'Admin@123' }
          ),
          responses: { 200: { description: 'Returns JWT token and user' } },
        },
      },
      '/api/auth/verify-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Verify email OTP',
          security: noAuth,
          requestBody: jsonBody(
            {
              type: 'object',
              required: ['email', 'otp'],
              properties: { email: { type: 'string' }, otp: { type: 'string', minLength: 6, maxLength: 6 } },
            },
            { email: 'john@example.com', otp: '123456' }
          ),
          responses: { 200: { description: 'Verified — returns token' } },
        },
      },
      '/api/auth/resend-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Resend OTP',
          security: noAuth,
          requestBody: jsonBody(
            { type: 'object', required: ['email'], properties: { email: { type: 'string' } } },
            { email: 'john@example.com' }
          ),
        },
      },
      '/api/auth/forgot-password': {
        post: {
          tags: ['Auth'],
          summary: 'Request password reset OTP',
          security: noAuth,
          requestBody: jsonBody(
            { type: 'object', required: ['email'], properties: { email: { type: 'string' } } },
            { email: 'john@example.com' }
          ),
        },
      },
      '/api/auth/reset-password': {
        post: {
          tags: ['Auth'],
          summary: 'Reset password with OTP',
          security: noAuth,
          requestBody: jsonBody(
            {
              type: 'object',
              required: ['email', 'otp', 'newPassword'],
              properties: {
                email: { type: 'string' },
                otp: { type: 'string' },
                newPassword: { type: 'string', minLength: 6 },
              },
            },
            { email: 'john@example.com', otp: '123456', newPassword: 'NewPass123' }
          ),
        },
      },
      '/api/auth/me': { get: { tags: ['Auth'], summary: 'Get current profile', security: bearer } },
      '/api/auth/profile': {
        patch: {
          tags: ['Auth'],
          summary: 'Update profile',
          security: bearer,
          requestBody: jsonBody(
            {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
              },
            },
            { firstName: 'John', lastName: 'Doe' }
          ),
        },
      },
      '/api/auth/change-password': {
        post: {
          tags: ['Auth'],
          summary: 'Change password',
          security: bearer,
          requestBody: jsonBody(
            {
              type: 'object',
              required: ['currentPassword', 'newPassword'],
              properties: {
                currentPassword: { type: 'string' },
                newPassword: { type: 'string', minLength: 6 },
              },
            },
            { currentPassword: 'Admin@123', newPassword: 'Admin@456' }
          ),
        },
      },
      '/api/auth/logout': { post: { tags: ['Auth'], summary: 'Logout', security: bearer } },
      '/api/auth/users': { get: { tags: ['Auth'], summary: 'List all users (ADMIN)', security: bearer } },
      '/api/auth/users/{id}/role': {
        patch: {
          tags: ['Auth'],
          summary: 'Update user role (ADMIN)',
          security: bearer,
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: jsonBody(
            { type: 'object', required: ['role'], properties: { role: { type: 'string', enum: ['ADMIN', 'INSPECTOR', 'USER'] } } },
            { role: 'INSPECTOR' }
          ),
        },
      },
      '/api/extinguishers': {
        get: { tags: ['Extinguishers'], summary: 'List extinguishers', security: bearer },
        post: {
          tags: ['Extinguishers'],
          summary: 'Create extinguisher (ADMIN only)',
          security: bearer,
          requestBody: jsonBody(extinguisherBody, {
            serialNumber: 'FE-TZW-001',
            location: 'Warehouse - Bay 3',
            type: 'CO2',
            size: 'LB_5',
            installationDate: '2024-06-01T00:00:00.000Z',
            expiryDate: '2026-06-01T00:00:00.000Z',
            status: 'ACTIVE',
            assignedInspectorId: '00000000-0000-0000-0000-000000000002',
          }),
        },
      },
      '/api/extinguishers/{id}': {
        get: {
          tags: ['Extinguishers'],
          summary: 'Get one extinguisher',
          security: bearer,
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        },
        put: {
          tags: ['Extinguishers'],
          summary: 'Update extinguisher (ADMIN/INSPECTOR)',
          security: bearer,
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: jsonBody(extinguisherBody, { location: 'Building B - Exit', status: 'NEEDS_INSPECTION' }),
        },
        delete: {
          tags: ['Extinguishers'],
          summary: 'Delete extinguisher (ADMIN)',
          security: bearer,
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        },
      },
      '/api/extinguishers/{id}/assign': {
        patch: {
          tags: ['Extinguishers'],
          summary: 'Assign inspector to extinguisher (ADMIN only)',
          security: bearer,
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: jsonBody(
            {
              type: 'object',
              properties: {
                assignedInspectorId: { type: 'string', format: 'uuid', nullable: true },
              },
            },
            { assignedInspectorId: '00000000-0000-0000-0000-000000000002' }
          ),
        },
      },
      '/api/inspections': {
        get: { tags: ['Inspections'], summary: 'List inspections', security: bearer },
        post: {
          tags: ['Inspections'],
          summary: 'Schedule inspection',
          security: bearer,
          requestBody: jsonBody(
            {
              type: 'object',
              required: ['extinguisherId', 'scheduledDate', 'scheduledTime'],
              properties: {
                extinguisherId: { type: 'string', format: 'uuid' },
                scheduledDate: { type: 'string', format: 'date-time' },
                scheduledTime: { type: 'string', example: '09:30' },
                notes: { type: 'string' },
              },
            },
            {
              extinguisherId: '00000000-0000-0000-0000-000000000001',
              scheduledDate: '2026-06-15T00:00:00.000Z',
              scheduledTime: '10:00',
              notes: 'Monthly check',
            }
          ),
        },
      },
      '/api/inspections/{id}': {
        patch: {
          tags: ['Inspections'],
          summary: 'Update inspection (ADMIN/INSPECTOR)',
          security: bearer,
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: jsonBody(
            {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'OVERDUE', 'CANCELLED'] },
                notes: { type: 'string' },
              },
            },
            { status: 'COMPLETED', notes: 'Passed inspection' }
          ),
        },
      },
      '/api/maintenance': {
        get: { tags: ['Maintenance'], summary: 'List maintenance logs', security: bearer },
        post: {
          tags: ['Maintenance'],
          summary: 'Log maintenance (ADMIN/INSPECTOR)',
          security: bearer,
          requestBody: jsonBody(
            {
              type: 'object',
              required: ['extinguisherId', 'actionTaken', 'maintenanceDate'],
              properties: {
                extinguisherId: { type: 'string', format: 'uuid' },
                actionTaken: { type: 'string' },
                maintenanceDate: { type: 'string', format: 'date-time' },
                issuesIdentified: { type: 'string' },
                notes: { type: 'string' },
              },
            },
            {
              extinguisherId: '00000000-0000-0000-0000-000000000001',
              actionTaken: 'Recharged CO2 cylinder',
              maintenanceDate: '2026-06-02T00:00:00.000Z',
              issuesIdentified: 'Low pressure',
              notes: 'Ready for service',
            }
          ),
        },
      },
      '/api/reports/dashboard': { get: { tags: ['Reports'], summary: 'Dashboard stats', security: bearer } },
      '/api/reports/inventory': { get: { tags: ['Reports'], summary: 'Inventory report', security: bearer } },
      '/api/reports/inspections': { get: { tags: ['Reports'], summary: 'Inspection report', security: bearer } },
      '/api/reports/compliance': { get: { tags: ['Reports'], summary: 'Compliance report', security: bearer } },
      '/api/reports/maintenance': { get: { tags: ['Reports'], summary: 'Maintenance report', security: bearer } },
      '/api/reports/export/{type}/csv': {
        get: {
          tags: ['Reports'],
          summary: 'Export CSV',
          security: bearer,
          parameters: [
            {
              in: 'path',
              name: 'type',
              required: true,
              schema: { type: 'string', enum: ['inventory', 'inspections', 'compliance', 'maintenance'] },
            },
          ],
        },
      },
      '/api/reports/export/{type}/pdf': {
        get: {
          tags: ['Reports'],
          summary: 'Export PDF',
          security: bearer,
          parameters: [
            {
              in: 'path',
              name: 'type',
              required: true,
              schema: { type: 'string', enum: ['inventory', 'inspections', 'compliance', 'maintenance'] },
            },
          ],
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
