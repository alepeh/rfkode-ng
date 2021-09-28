import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { store } from './store';

export interface Schema {
  _id: string,
  name: string
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  DBNAME = 'rfkode';
  localDb = new PouchDB(this.DBNAME);

  constructor() { }


allSchemas(){
    return this.localDb.allDocs({
        include_docs: true,
        startkey: 'schema',
        endkey: 'schema\ufff0'
    })
}

getDocument(id: string){
    return this.localDb.get(id, {attachments : true});
}

removeDocument(id: string, rev: string){
    return this.localDb.remove(id, rev);
}

allDocsOfSchema(schemaId: string){
    let schemaName = schemaId.split(':')[1];
    console.log("schema name: " + schemaName);
    return this.localDb.allDocs({
        include_docs: true,
        descending: true,
        endkey: 'record:'+schemaName + ':',
        startkey: 'record:'+schemaName+':\ufff0'
    })
}

getAttachment(docId: string, attachmentName: string){
    return this.localDb.getAttachment(docId, attachmentName);
}

allDocs(){
    return this.localDb.allDocs({
        include_docs: true
    });
}

info(){
    return this.localDb.info();
}
}
