import { Router, Request, Response } from 'express';

const openapi: any = {
  openapi: '3.0.0',
  info: {
    title: 'EMR API',
    version: '1.0.0'
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Patient: {
        type: 'object',
        properties: {
          patientId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          dob: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['M', 'F'] },
          contact: { type: 'string', nullable: true },
          insurance: { type: 'string', nullable: true }
        }
      },
      Doctor: {
        type: 'object',
        properties: {
          doctorId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          department: { type: 'string' }
        }
      },
      Visit: {
        type: 'object',
        properties: {
          visitId: { type: 'string', format: 'uuid' },
          patientId: { type: 'string', format: 'uuid' },
          doctorId: { type: 'string', format: 'uuid' },
          visitDate: { type: 'string', format: 'date' },
          department: { type: 'string' },
          reason: { type: 'string', nullable: true }
        }
      },
      Diagnosis: {
        type: 'object',
        properties: {
          diagId: { type: 'string', format: 'uuid' },
          visitId: { type: 'string', format: 'uuid' },
          diagnosis: { type: 'string' }
        }
      },
      Medication: {
        type: 'object',
        properties: {
          medId: { type: 'string', format: 'uuid' },
          visitId: { type: 'string', format: 'uuid' },
          drugName: { type: 'string' },
          dosage: { type: 'string', nullable: true },
          instructions: { type: 'string', nullable: true }
        }
      },
      LabResult: {
        type: 'object',
        properties: {
          labId: { type: 'string', format: 'uuid' },
          visitId: { type: 'string', format: 'uuid' },
          testName: { type: 'string' },
          resultValue: { type: 'number', nullable: true },
          unit: { type: 'string', nullable: true },
          referenceRange: { type: 'string', nullable: true },
          testDate: { type: 'string', format: 'date', nullable: true }
        }
      },
      Observation: {
        type: 'object',
        properties: {
          obsId: { type: 'string', format: 'uuid' },
          visitId: { type: 'string', format: 'uuid' },
          patientId: { type: 'string', format: 'uuid' },
          doctorId: { type: 'string', format: 'uuid' },
          noteText: { type: 'string' },
          bpSystolic: { type: 'integer', nullable: true },
          bpDiastolic: { type: 'integer', nullable: true },
          heartRate: { type: 'integer', nullable: true },
          temperatureC: { type: 'number', nullable: true },
          spo2: { type: 'integer', nullable: true },
          bmi: { type: 'number', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      ObservationListResponse: {
        type: 'array',
        items: { $ref: '#/components/schemas/Observation' }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      },
      Tokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {}
};

const paths: Record<string, any> = {};
function addPath(path: string, method: string, spec: any) {
  if (!paths[path]) paths[path] = {};
  paths[path][method] = spec;
}

addPath('/health', 'get', {
  summary: 'Health check',
  security: [],
  responses: { '200': { description: 'OK' } }
});

addPath('/auth/register', 'post', {
  summary: 'Register user',
  security: [{ bearerAuth: [] }],
  responses: { '201': { description: 'Created' } }
});

addPath('/auth/login', 'post', {
  summary: 'Login',
  security: [],
  responses: {
    '200': {
      description: 'Tokens',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/Tokens' } } }
    }
  }
});

addPath('/auth/token/refresh', 'post', {
  summary: 'Refresh access token',
  security: [],
  responses: {
    '200': {
      description: 'Tokens',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/Tokens' } } }
    }
  }
});

addPath('/auth/logout', 'post', {
  summary: 'Logout',
  security: [],
  responses: { '204': { description: 'Logged out' } }
});

addPath('/auth/password/forgot', 'post', {
  summary: 'Forgot password',
  security: [],
  responses: { '200': { description: 'OK' } }
});

addPath('/auth/password/reset', 'post', {
  summary: 'Reset password',
  security: [],
  responses: { '200': { description: 'OK' } }
});

addPath('/visits', 'post', {
  summary: 'Create visit',
  security: [{ bearerAuth: [] }],
  responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Visit' } } } } }
});

addPath('/patients/{id}/visits', 'get', {
  summary: 'List visits for patient',
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
  responses: { '200': { description: 'Visits', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Visit' } } } } } }
});

addPath('/visits/{id}', 'get', {
  summary: 'Get visit detail',
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
  responses: { '200': { description: 'Visit', content: { 'application/json': { schema: { $ref: '#/components/schemas/Visit' } } } }, '404': { description: 'Not found' } }
});

addPath('/patients', 'get', {
  summary: 'Search patients',
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'query', in: 'query', required: true, schema: { type: 'string' } },
    { name: 'limit', in: 'query', schema: { type: 'integer' } },
    { name: 'offset', in: 'query', schema: { type: 'integer' } }
  ],
  responses: { '200': { description: 'Patients', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Patient' } } } } } }
});

addPath('/patients/{id}', 'get', {
  summary: 'Get patient',
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
    { name: 'include', in: 'query', schema: { type: 'string', enum: ['summary'] } }
  ],
  responses: { '200': { description: 'Patient', content: { 'application/json': { schema: { $ref: '#/components/schemas/Patient' } } } }, '404': { description: 'Not found' } }
});

addPath('/doctors', 'get', {
  summary: 'Search doctors',
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'department', in: 'query', schema: { type: 'string' } },
    { name: 'q', in: 'query', schema: { type: 'string' } }
  ],
  responses: { '200': { description: 'Doctors', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Doctor' } } } } } }
});

addPath('/visits/{id}/diagnoses', 'post', {
  summary: 'Add diagnosis',
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
  responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Diagnosis' } } } } }
});

addPath('/diagnoses', 'get', {
  summary: 'List diagnoses',
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'q', in: 'query', schema: { type: 'string' } },
    { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'limit', in: 'query', schema: { type: 'integer' } },
    { name: 'offset', in: 'query', schema: { type: 'integer' } }
  ],
  responses: { '200': { description: 'Diagnoses', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Diagnosis' } } } } } }
});

addPath('/visits/{id}/medications', 'post', {
  summary: 'Add medication',
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
  responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Medication' } } } } }
});

addPath('/medications', 'get', {
  summary: 'List medications',
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'patient_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
    { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'limit', in: 'query', schema: { type: 'integer' } },
    { name: 'offset', in: 'query', schema: { type: 'integer' } }
  ],
  responses: { '200': { description: 'Medications', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Medication' } } } } } }
});

addPath('/visits/{id}/labs', 'post', {
  summary: 'Add lab result',
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
  responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/LabResult' } } } } }
});

addPath('/labs', 'get', {
  summary: 'List lab results',
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'patient_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
    { name: 'test_name', in: 'query', schema: { type: 'string' } },
    { name: 'min', in: 'query', schema: { type: 'number' } },
    { name: 'max', in: 'query', schema: { type: 'number' } },
    { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'limit', in: 'query', schema: { type: 'integer' } },
    { name: 'offset', in: 'query', schema: { type: 'integer' } }
  ],
  responses: { '200': { description: 'Lab results', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/LabResult' } } } } } }
});

addPath('/visits/{id}/observations', 'post', {
  summary: 'Add observation',
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
  responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Observation' } } } } }
});

addPath('/visits/{id}/observations', 'get', {
  summary: 'List visit observations',
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
    { name: 'scope', in: 'query', schema: { type: 'string', enum: ['visit', 'patient'] } },
    { name: 'author', in: 'query', schema: { type: 'string', enum: ['me', 'any'] } },
    { name: 'before', in: 'query', schema: { type: 'string', enum: ['visit', 'none'] } },
    { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
    { name: 'limit', in: 'query', schema: { type: 'integer' } },
    { name: 'offset', in: 'query', schema: { type: 'integer' } }
  ],
  responses: {
    '200': {
      description: 'Observations',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ObservationListResponse' } } }
    }
  }
});

addPath('/patients/{patientId}/observations', 'get', {
  summary: 'List patient observations',
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'patientId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
    { name: 'author', in: 'query', schema: { type: 'string', enum: ['me', 'any'] } },
    { name: 'before_visit', in: 'query', schema: { type: 'string', format: 'uuid' } },
    { name: 'exclude_visit', in: 'query', schema: { type: 'string', format: 'uuid' } },
    { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
    { name: 'limit', in: 'query', schema: { type: 'integer' } },
    { name: 'offset', in: 'query', schema: { type: 'integer' } }
  ],
  responses: {
    '200': {
      description: 'Observations',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ObservationListResponse' } } }
    }
  }
});

addPath('/insights/patient-summary', 'get', {
  summary: 'Patient summary',
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'patient_id', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } },
    { name: 'last_n', in: 'query', schema: { type: 'integer' } }
  ],
  responses: { '200': { description: 'Summary' } }
});

addPath('/insights/latest-visit', 'get', {
  summary: 'Latest visit for patient',
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'patient_id', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } }
  ],
  responses: { '200': { description: 'Visit', content: { 'application/json': { schema: { $ref: '#/components/schemas/Visit' } } } }, '404': { description: 'Not found' } }
});

addPath('/insights/cohort', 'get', {
  summary: 'Cohort query',
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'test_name', in: 'query', required: true, schema: { type: 'string' } },
    { name: 'op', in: 'query', schema: { type: 'string', enum: ['gt', 'gte', 'lt', 'lte', 'eq'] } },
    { name: 'value', in: 'query', required: true, schema: { type: 'number' } },
    { name: 'months', in: 'query', required: true, schema: { type: 'integer' } }
  ],
  responses: { '200': { description: 'Cohort' } }
});

addPath('/audit', 'get', {
  summary: 'Audit log',
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'entity', in: 'query', schema: { type: 'string' } },
    { name: 'entity_id', in: 'query', schema: { type: 'string' } },
    { name: 'actor', in: 'query', schema: { type: 'string' } },
    { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'limit', in: 'query', schema: { type: 'integer' } },
    { name: 'offset', in: 'query', schema: { type: 'integer' } }
  ],
  responses: { '200': { description: 'Audit events' } }
});

openapi.paths = paths;

export const docsRouter = Router();
docsRouter.get('/docs/openapi.json', (_req: Request, res: Response) => {
  res.json(openapi);
});

export default docsRouter;
