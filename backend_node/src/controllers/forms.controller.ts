import type { Request, Response, NextFunction } from 'express';
import { AdminFormService } from '../services/admin-form.service.js';
import { FormService } from '../services/form.service.js';

export const getForms = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.query.id;
        if (id) {
            const result = await AdminFormService.getFormDetail(Number(id));
            return res.json(result);
        }
        const result = await AdminFormService.getAllForms();
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getFormWithFields = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code, id } = req.query;
        if (id) {
            const result = await AdminFormService.getFormDetail(Number(id));
            return res.json(result);
        }
        const result = await FormService.getFormWithFields(code as string);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getFormProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { code, id } = req.query;
        const codeOrId = id || code;
        
        if (!codeOrId) {
            return res.status(400).json({ error: 'Form ID or code is required' });
        }

        const result = await FormService.getFormWithUserProgress(userId, codeOrId as string);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const submitForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId || null;
        const body = req.body;
        const formId = Number(body.form_id);
        const isPartial = body.is_partial === '1' || body.is_partial === true;
        const lastStepIndex = parseInt(body.last_step_index || '0');
        const files = req.files as Express.Multer.File[];

        const answers = { ...body };
        delete answers.is_partial;
        delete answers.last_step_index;
        delete answers.form_id;

        const result = await FormService.submitResponse(userId, formId, answers, isPartial, lastStepIndex, files);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const submitOnboarding = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const files = req.files as Express.Multer.File[];
        const result = await FormService.submitOnboarding(userId, req.body, files);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const createForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AdminFormService.createForm(req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const updateForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        await AdminFormService.saveFormStructure(Number(id), req.body);
        res.json({ success: true, message: 'Form structure updated successfully' });
    } catch (error) {
        next(error);
    }
};

export const archiveForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, is_active } = req.body;
        const status = is_active === true || is_active === 1 ? 1 : 0;
        await AdminFormService.archiveForm(Number(id), status);
        res.json({ success: true, message: `Form ${status ? 'activated' : 'archived'}` });
    } catch (error) {
        next(error);
    }
};

export const deleteForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.query.id || req.body.id;
        if (!id) return res.status(400).json({ error: 'Form ID is required' });
        
        await AdminFormService.deleteForm(Number(id));
        res.json({ success: true, message: 'Form deleted successfully' });
    } catch (error) {
        next(error);
    }
};
