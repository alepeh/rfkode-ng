import { generateNewDocumentId } from './formUtils';


describe('page-form', () => {
    it('generates new document ids with the pattern record:<schema>:<yyyymmddhhmmss>:<randomdigits>', () => {
        const recordIdParts = generateNewDocumentId("schema:form:v1").split(':');
        expect(recordIdParts[0]).toBe('record');
        expect(recordIdParts[1]).toBe('form');
        expect(recordIdParts[2]).toBe('v1');
        expect(recordIdParts[3]).toMatch(/\d{14}/);
      });
});