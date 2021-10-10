import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common'
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DatabaseService } from '../database.service';
import 'rfkode-form';
import { expand } from '../helpers/relationship-resolver';
import { extractSchemaNameFromSchemaId, generateNewDocumentId } from '../helpers/formUtils';
import { RelationshipModalComponent } from '../relationship-modal/relationship-modal.component';
import {MatDialog} from '@angular/material/dialog';
import { ActionModalComponent } from '../action-modal/action-modal.component';
import { DeleteConfirmComponent } from '../delete-confirm/delete-confirm.component';


@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  @ViewChild('rfkform') rfkFormComponent!: ElementRef<HTMLRfkodeFormElement>;


  documentId: string = "";
  schemaId: string = "";
  schema: any;
  params: any = {};
  mode: string = "";

  displayData: any = {};
  persistentData: any;

  isDirty: boolean = false;


  constructor(private route: ActivatedRoute,
    private database: DatabaseService,
    private router: Router,
    private dialog: MatDialog,
    private location: Location) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      console.log("Navigation event triggered");
      this.persistentData = null;
      this.displayData = null;
      this.schema = null;
      this.documentId = params.get('id')!;
      this.schemaId = params.get('schemaId') as string;
      this.mode = params.get('mode') as string;
      console.log(this.schemaId);
      console.log(this.documentId);
      this.extractAdditionalRouteParams(params);
      if(this.mode === 'NEW'){
         this.setupNewForm();
      }
      else {
         this.loadExistingDocument();
      }
    })
  }

  private extractAdditionalRouteParams(params: ParamMap){
    params.keys.filter(param => 
        param != 'id' &&
        param != 'schemaId' &&
        param != 'mode'
    ).forEach(filterdParam =>
      this.params[filterdParam]=params.get(filterdParam)
    )
    console.dir(this.params);
  }

  private async loadSchema(){
    if(this.schemaId){
      await this.database.getDocument(this.schemaId).then(aDocument => {
        this.schema = aDocument;
      })
    }
  }

  private async loadGlobalData() {
    await this.database.getDocument('settings:global').then(settings => {
      if (settings) {
        this.displayData['_globalContext'] = settings;
      }
    }).catch(error => {
      console.error(error);
    });
  }

  async setupNewForm() {
    await this.loadSchema();
    console.log("Setup new form");
    console.log(this.documentId);
    if(!this.documentId){
      this.documentId = generateNewDocumentId(this.schema._id);
    }
      this.persistentData = { _id: this.documentId, schemaDocId: this.schema._id };
      if(this.params){
        //localhost:3000/#/form/schema/schema:feuerstaette:v1/document/record:feuerstaette:v1:000dugil29uc1i/params/objekt=0001234&fs=0002345/mode/NEW
        Object.keys(this.params).forEach(key => {
          if(this.schema.jsonSchema.properties[key] && this.schema.jsonSchema.properties[key].type === 'array'){
            this.persistentData[key] = this.params[key];
          }
          else {
            this.persistentData[key] = this.params[key];
          }
        })
        console.log("Added additional params: ");
        console.dir(this.params);
      }
      let expandedData = await expand(this.persistentData, this.schema, this.database);
      this.displayData = {...this.displayData, ...expandedData};
      console.dir(this.displayData);
      this.rfkFormComponent.nativeElement.schema = this.schema;
      this.rfkFormComponent.nativeElement.data = this.displayData;
  }

  async loadExistingDocument() {
    await this.loadSchema();
    await this.loadGlobalData();
    await this.database.getDocument(this.documentId).then(aDocument => {
      this.persistentData = aDocument;
      console.dir(this.persistentData);
    })
    // expand all the referenced relationships
    let resolvedData;
    if (this.persistentData) {
      resolvedData = await expand(this.persistentData, this.schema, this.database).catch(error => {
        console.error(error);
      });
    }

    //copy the object, otherwise we assign the attachments to the ordinary data properties
    this.displayData = { ...this.displayData, ...resolvedData }
    if (this.persistentData && this.persistentData['_attachments']) {
      Object.keys(this.persistentData._attachments).map(attachmentName => {
        this.displayData[attachmentName] = this.persistentData._attachments[attachmentName]['data'];
      });
    }
    this.rfkFormComponent.nativeElement.schema = this.schema;
    this.rfkFormComponent.nativeElement.data = this.displayData;
  }

  @HostListener('window:dataChanged', ['$event'])
  _onDataChanged(ev: any) {
    if (this.isValueDifferent(ev.detail)) {
      this.isDirty = true;
      this.persistentData[ev.detail.property] = ev.detail.value;
      this.displayData[ev.detail.property] = ev.detail.value;

      //this should refresh the form
      if (ev.detail['source'] && ev.detail['source'] === 'formula') {
        console.log("Data changed because of formula evaluation, not rerendering form");
      }
      else {
        console.log("Data change");
        console.dir(ev.detail);
        this.rfkFormComponent.nativeElement.data = {...this.displayData};
      }
    }
    else {
      console.log("Received data change event but wasn't active");
      console.dir(ev.detail);
    }
  }

  isValueDifferent(detail: any) {
    if (this.persistentData[detail.property] != detail.value) {
      return true;
    }
    //this is a hack as the json widget uses 2-way data binding and therefore the value is always the same on the change event
    if (this.schema['uiSchema'] && this.schema['uiSchema'][detail.property] && this.schema['uiSchema'][detail.property]['widget'] === "json") {
      return true;
    }
    console.warn("Data change fired for " + detail.property + " but value " + detail.value + " stayed the same");
    console.dir(this.persistentData[detail.property]);
    console.dir(detail.value);
    return false;
  }

  @HostListener('window:relatedElementAction', ['$event'])
  _onRelatedElementAction(ev: any) {
    this.handleRelatedElementAction(ev.detail);
    console.log(ev.detail);
  }

  /**
* called to navigate to an existing relationship
*/
  async handleRelatedElementAction(selectionevent: any) {
    console.log("SelectionEvent fired in: " + this.documentId);
    const relationship = selectionevent.property;
    const relatedSchema = this.schema.jsonSchema.relationships[relationship].$ref;
    switch (selectionevent.action) {
      case "view":
        const relatedRecordId = selectionevent.value;
        if (this.isDirty) {
          console.log("Form is dirty, saving...");
          this.save();
        }
        this.router.navigate(["form/" + relatedRecordId, {schemaId: relatedSchema}]);
        break;
      case "new":
        console.log("New related element");
        await this._linkRelationship(selectionevent);
        break;
      default:
        console.log("Opening Modal to select relationship");
        let fieldName = relationship;
        this.openRelationshipModal(fieldName, relatedSchema);
    }
  }

  openRelationshipModal(relatedDocumentFieldName: string, relatedSchemaId: string){
    let dialogRef = this.dialog.open(RelationshipModalComponent,{
      height: '400px',
      width: '600px',
      data: {
        relatedDocumentFieldName,
        relatedSchemaId,
        sourceDocument: this.displayData,
        sourceSchema: this.schema
      }
    });
    dialogRef.afterClosed().subscribe((data: any)=>{
      console.log("Dialog Ref closed");
      this.handleRelatedElementAction(data);
    })
  }

  async openActionModal(){
    let actions = this.schema['actions'];
    let resolvedData = await expand(this.persistentData, this.schema, this.database);
    let dialogRef = this.dialog.open(ActionModalComponent,{
      height: '400px',
      width: '600px',
      data: {
        resolvedData,
        actions,
        db: this.database
      }
    });
    dialogRef.afterClosed().subscribe((data: any)=>{
      console.log("Action Dialog Ref closed");
    })
  }

  async _linkRelationship(e: any) {
    console.log("relationship selected");
    const fieldName = e.property;
    const existingRelationship = e.value;
    if (existingRelationship) {
      //oldRelValue, newRelValue
      this._updateRelationship(fieldName, existingRelationship);
      this.save();
      const updatedFormData = await expand(this.persistentData, this.schema, this.database);
      console.log("Updated Form Data");
      this.displayData = { ...this.displayData, ...updatedFormData }
      this.rfkFormComponent.nativeElement.data = {...this.displayData};
    }
    else {
      const relatedSchema = this.schema.jsonSchema.relationships[fieldName].$ref;
      const relatedRecordId = generateNewDocumentId(relatedSchema);
      //TODO save the new recordId before reloading data
      this._updateRelationship(fieldName, relatedRecordId);
      this.save();
      //pass the currentDoc as a parameter so we already have a back-reference in case it has it defined in the schema
      const relatedSchemaDoc : any  = await this.database.getDocument(relatedSchema);
      let params:any = {schemaId: relatedSchema, mode: 'NEW'};
      if(relatedSchemaDoc && relatedSchemaDoc.jsonSchema.relationships[extractSchemaNameFromSchemaId(this.documentId)]){
          //params = extractSchemaNameFromSchemaId(this.documentId) + '=' + this.documentId;
          params[extractSchemaNameFromSchemaId(this.documentId)]=this.documentId
      }
      //getRouter().push('form/schema/' + relatedSchema + '/document/' + relatedRecordId + '/params/' + params + '/mode/NEW');
      this.router.navigate(["form/" + relatedRecordId, params]);
    }
  }

  _updateRelationship(fieldName: string, relatedDocId: string) {
    //in case of a multiple select field, we need to update the array of related records
    console.log(fieldName);
    if (this.schema.jsonSchema.properties[fieldName].type === 'array') {
      this.persistentData[fieldName] ? this.persistentData[fieldName].push(relatedDocId)
        : this.persistentData[fieldName] = [relatedDocId];
    } else {
      this.persistentData[fieldName] = relatedDocId;
    }
  }

  @HostListener('window:attachmentChanged', ['$event'])
  async _onAttachmentChanged(ev: any) {
    console.log("Attachment changed");
    this.isDirty = true;
    if(this.schema['uiSchema'] && this.schema['uiSchema'][ev.detail.property] && this.schema['uiSchema'][ev.detail.property].widget === "signature"){
        if (!this.persistentData['_attachments']) {
                this.persistentData._attachments = {};
              }
              this.persistentData._attachments[ev.detail.property] = { //filename
                content_type: ev.detail.value.type,
                data: ev.detail.value
              };
      }
      else {
        let randomizedFilename = Math.random().toString(36).replace('0.', '') + '_' + ev.detail.value.name
        await this.postData("https://enth5xmrexl9ewh.m.pipedream.net", ev.detail.value, ev.detail.value.type, randomizedFilename);
        this.persistentData[ev.detail.property] = randomizedFilename;
      }
  }

  async postData(url = '', file : File, contentType = '', fileName = '') {
    // Default options are marked with *
    var dataBase64  = String(await this.toBase64(file));
    const i = dataBase64.indexOf("base64,")
    dataBase64 = dataBase64.substring(i+"base64,".length)
    const bodyData = JSON.stringify({ data : dataBase64, fileType : contentType, fileName : fileName});
    await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyData// body data type must match "Content-Type" header
    });
    //return response.json(); // parses JSON response into native JavaScript objects
  }

  toBase64 = (file: any) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  async delete(){
    let actions = this.schema['actions'];
    let resolvedData = await expand(this.persistentData, this.schema, this.database);
    let dialogRef = this.dialog.open(DeleteConfirmComponent,{
      height: '200px',
      width: '300px',
    });
    dialogRef.afterClosed().subscribe((confirm: boolean)=>{
      if(confirm){
        this.database.removeDocument(this.documentId, this.persistentData._rev);
        this.location.back();
      }
    })
  }

  save() {
    console.log("SAVED");
    this.database.put(this.persistentData).then((doc) => {
      console.log(this.persistentData);
      this.persistentData._rev = doc.rev;
      this.isDirty = false;
    }).catch((error) => {
      console.error(error);
    });;
  }

}
