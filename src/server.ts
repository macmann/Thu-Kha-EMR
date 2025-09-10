import { Router } from 'express';

import visitsRouter from './modules/visits/index.ts';
import patientsRouter from './modules/patients/index.ts';
import doctorsRouter from './modules/doctors/index.ts';
import diagnosesRouter from './modules/diagnoses/index.ts';
import medicationsRouter from './modules/medications/index.ts';
import labsRouter from './modules/labs/index.ts';
import observationsRouter from './modules/observations/index.ts';
import insightsRouter from './modules/insights/index.ts';
import auditRouter from './modules/audit/index.ts';
import { docsRouter } from './docs/openapi.ts';

export const apiRouter = Router();

apiRouter.use(visitsRouter);
apiRouter.use('/patients', patientsRouter);
apiRouter.use('/doctors', doctorsRouter);
apiRouter.use(diagnosesRouter);
apiRouter.use('/diagnoses', diagnosesRouter);
apiRouter.use(medicationsRouter);
apiRouter.use('/medications', medicationsRouter);
apiRouter.use(labsRouter);
apiRouter.use('/labs', labsRouter);
apiRouter.use(observationsRouter);
apiRouter.use('/insights', insightsRouter);
apiRouter.use('/audit', auditRouter);
apiRouter.use(docsRouter);

export default apiRouter;
