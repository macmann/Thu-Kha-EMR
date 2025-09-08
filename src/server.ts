import { Router } from 'express';

import authRouter from './modules/auth';
import visitsRouter from './modules/visits';
import patientsRouter from './modules/patients';
import doctorsRouter from './modules/doctors';
import diagnosesRouter from './modules/diagnoses';
import medicationsRouter from './modules/medications';
import labsRouter from './modules/labs';
import observationsRouter from './modules/observations';
import insightsRouter from './modules/insights';
import auditRouter from './modules/audit';
import { docsRouter } from './docs/openapi';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
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
