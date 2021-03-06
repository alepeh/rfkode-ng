import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { eventDispatcher, store } from './store';
import { ActionTypes } from './store/rfkode.actions';

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
  token: string = "";

  constructor() { 
    store.subscribe((state) => {
        console.log("State changed")
        const {token} = state;
        if(token && (this.token != token)){
            console.log("token is different");
            this.token = token;
            this.sync(token);
        }
      })
  }


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

put(document: any){
    return this.localDb.put(document);
}

info(){
    return this.localDb.info();
}

sync(token: string) {
    const remoteDbUrl = this._extractRemoteDbUrlFromToken(token);
    const authSession = this._extractAuthSessionFromToken(token);
    console.log(remoteDbUrl);

    const remoteDb = new PouchDB(remoteDbUrl, {
        auth: authSession,
      });
    this.localDb.sync(remoteDb, {live: true, retry: true})
            .on('change', () => {
            this._syncLog('change', "");
            eventDispatcher.next({type: ActionTypes.SYNC_STATE_CHANGED, payload: {loading : true, error: ''}})
          }).on('paused', (err) => {
            this._syncLog('paused', err);
            if(!err){
                eventDispatcher.next({type: ActionTypes.SYNC_STATE_CHANGED, payload: {loading : false, error: ''}})
            }
            else {
                eventDispatcher.next({type: ActionTypes.SYNC_STATE_CHANGED, payload: {loading : false, error: err}})
            }
          }).on('active', () => {
            this._syncLog('active', "");
            eventDispatcher.next({type: ActionTypes.SYNC_STATE_CHANGED, payload: {loading : true, error: ''}})
          }).on('denied', (err) => {
            this._syncLog('denied', err);
          }).on('complete', () => {
            this._syncLog('complete', "");
          }).on('error', (err) => {
            this._syncLog('error', err);
            eventDispatcher.next({type: ActionTypes.SYNC_STATE_CHANGED, payload: {loading : false, error: err}})
          });
}

_extractRemoteDbUrlFromToken(token: any){
    return this._decodeTokenPayload(token)['https://rfkode.alexanderpehm.at/cloudant_db_url'];
}

_extractAuthSessionFromToken(token: any){
    let auth = {
        username: "",
        password: "" 
    };
    auth.username = this._decodeTokenPayload(token)['https://rfkode.alexanderpehm.at/remote_db_username'];
    auth.password = this._decodeTokenPayload(token)['https://rfkode.alexanderpehm.at/remote_db_password'];
    return auth;
}


_decodeTokenPayload(token: any){
    const tokenPayload = token.split('.')[1];
    return JSON.parse(window.atob(tokenPayload));
}

_syncLog(action: string, detail: any){
    console.log('Replication ' + action + ' detail: ' + JSON.stringify(detail));
}
}
