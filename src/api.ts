import { Hono } from 'hono';
import type { CheckId, CheckModel } from './features/checks/CheckModel';

export const api = new Hono().get('/checks', (c) => c.json(getChecks()));

function getChecks(): CheckModel[] {
  return [
    {
      id: 'aaa' as CheckId,
      priority: 10,
      description: 'Face on the picture matches face on the document',
    },
    {
      id: 'bbb' as CheckId,
      priority: 5,
      description: 'Veriff supports presented document',
    },
    {
      id: 'ccc' as CheckId,
      priority: 7,
      description: 'Face is clearly visible',
    },
    {
      id: 'ddd' as CheckId,
      priority: 3,
      description: 'Document data is clearly visible',
    },
  ];
}
