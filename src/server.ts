import { Router } from 'express';

import authRouter from './modules/auth';
import patientsRouter from './modules/patients';
import doctorsRouter from './modules/doctors';
import visitsRouter from './modules/visits';
import diagnosesRouter from './modules/diagnoses';
import medicationsRouter from './modules/medications';
import labsRouter from './modules/labs';
import observationsRouter from './modules/observations';
import insightsRouter from './modules/insights';
import auditRouter from './modules/audit';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/patients', patientsRouter);
apiRouter.use('/doctors', doctorsRouter);
apiRouter.use('/visits', visitsRouter);
apiRouter.use('/diagnoses', diagnosesRouter);
apiRouter.use('/medications', medicationsRouter);
apiRouter.use('/labs', labsRouter);
apiRouter.use('/observations', observationsRouter);
apiRouter.use('/insights', insightsRouter);
apiRouter.use('/audit', auditRouter);

export default apiRouter;
