import fs from 'fs';
const file = '/var/www/goa.city/backend_node/src/controllers/meetings.controller.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace('export const createMeeting = async (req: Request, res: Response) => {', "export const createMeeting = async (req: Request, res: Response) => {\n    console.log('CREATE MEETING CALLED:', req.body);");
fs.writeFileSync(file, code);
