
jest.mock('../services/database');
import { expand, expandToLevel2 } from './relationship-resolver';
import { db } from '../services/database';
import {rootDoc, rootDocExpandedToLevel1, rel1Doc, rel2Doc, rootSchemaDoc} from '../services/__mocks__/database';

describe('relationship-resolver', () => {
    it('replaces all root level document references with the full object', async () => {
        const schema = await db.getDocument(rootSchemaDoc._id);
        const expandedDoc = await expand(rootDoc, schema, db);
        expect(expandedDoc['rel1']).toEqual(rel1Doc);
      });

      it('replaces all level2 document references with the full object', async () => {
        const expandedDoc = await expandToLevel2(rootDocExpandedToLevel1, db);
        expect(expandedDoc['rel1']['rel2']).toEqual(rel2Doc);
      });
});