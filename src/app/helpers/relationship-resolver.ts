import { DatabaseService } from "../database.service";

    export async function expand(document: any, schema: any, db: DatabaseService){
        let responseDocument: any = {};
        responseDocument = Object.assign(responseDocument, document);
        let relationships = schema.jsonSchema['relationships'];
        if(relationships){
            let documentIds = Object.keys(relationships).map(relationship => {
                return {relationship, id: responseDocument[relationship]};
            })
            for (let docId of documentIds){
                if(docId.id && ! Array.isArray(docId.id) ){
                    responseDocument[docId.relationship] = await db.getDocument(docId.id).catch(e => console.error(e));
                }
                else if(docId.id && Array.isArray(docId.id)){
                    responseDocument[docId.relationship] = [];
                    for (let id of docId.id){
                        let doc = await db.getDocument(id).catch(e => console.error(e));
                        if(doc){
                            responseDocument[docId.relationship].push(doc);
                        }
                    }
                }
            }
        }
        return responseDocument;
    }

    export async function expandToLevel2(document: any, db: any){
        let expandedDoc = document // await expand(document, schema, db);
        await Promise.all(Object.keys(expandedDoc).filter(key =>  key != '_attachments').map(async (key) => {
            if(typeof expandedDoc[key] === 'object' && (! Array.isArray(expandedDoc[key]))){
                const schemaOfNestedRelationship = await db.getDocument(expandedDoc[key]['schemaDocId']);
                expandedDoc[key] = await expand(expandedDoc[key], schemaOfNestedRelationship, db);
            }
        })).catch(e => console.error(e));
        return expandedDoc;
    }