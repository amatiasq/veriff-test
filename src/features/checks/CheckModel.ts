import { z } from 'zod';

export type CheckModel = z.infer<typeof CheckModel>;
// More info on branded types: https://amatiasq.com/talks/identifier-types/
export type CheckId = CheckModel['id'];

export const CheckModel = z.object({
  id: z.string().brand('CheckId'),
  priority: z.number().int(),
  description: z.string(),
});
