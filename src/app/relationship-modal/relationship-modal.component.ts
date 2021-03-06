import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Parser } from 'expr-eval';
import { DatabaseService } from '../database.service';
import { extractSchemaNameFromSchemaId } from '../helpers/formUtils';

@Component({
  selector: 'app-relationship-modal',
  templateUrl: './relationship-modal.component.html',
  styleUrls: ['./relationship-modal.component.css']
})
export class RelationshipModalComponent implements OnInit {

  relationshipTargets: any[] = [];

  @Output() relatedElementAction = new EventEmitter<any>();

  constructor( public dialogRef: MatDialogRef<RelationshipModalComponent>,
    private database: DatabaseService,
    @Inject(MAT_DIALOG_DATA) public data: { 
    relatedDocumentFieldName: string, 
    relatedSchemaId: string, 
    sourceDocument: any, 
    sourceSchema: any }) { }

  ngOnInit(): void {
    this.loadRelationshipTargets();
  }

  async loadRelationshipTargets(){
    const relatedSchemaName = this.data.relatedSchemaId;
    const docs = await this.database.allDocsOfSchema(relatedSchemaName);
    const relatedSchema = await this.database.getDocument(relatedSchemaName) as any;
    let labelProperty = "_id";
    if (relatedSchema.uiSchema["_label"]) {
      labelProperty = relatedSchema.uiSchema["_label"].property;
    }
    if (docs.rows) {
      let filteredDocuments = this.filter(docs.rows);
      if(filteredDocuments){
        this.relationshipTargets = filteredDocuments.map((doc : any) => {
          return { id: doc.doc._id, label: doc.doc[labelProperty] };
        })
      }
    }
  }

  onNewRelatedElement(): void {
    const detail: any = { action: "new", property: this.data.relatedDocumentFieldName };
    this.relatedElementAction.emit(detail);
    this.dismissModal(detail);
  }

  async onSelectExistingElement(relatedElementId : string) {
    //fetch the document and to add a back-reference to
    let relatedElement : any = await this.database.getDocument(relatedElementId);
    //fetch the schema to check if it contains a relationship property
    let relatedSchema = await this.database.getDocument(this.data.relatedSchemaId) as any;
    console.dir(relatedSchema)
    let propertyName = extractSchemaNameFromSchemaId(this.data.sourceDocument["_id"]);
    //if the property is of type array or does not exist, we push the relatedElementId to an array
    if (!relatedSchema.jsonSchema.properties[propertyName] || relatedSchema.jsonSchema.properties[propertyName].type === 'array') {
      relatedElement[propertyName] ? relatedElement[propertyName].push(this.data.sourceDocument["_id"])
        : relatedElement[propertyName] = new Array(this.data.sourceDocument["_id"]);
    } else {
      relatedElement[propertyName] = this.data.sourceDocument["_id"];
    }
    await this.database.put(relatedElement);
    const detail: any = { action: "new", property: this.data.relatedDocumentFieldName, value: relatedElementId };
    this.relatedElementAction.emit(detail);
    this.dismissModal(detail);
  }

  dismissModal(data : any){
      this.dialogRef.close(data);
  }

  filter(unFilteredTargets : any){
    console.dir(unFilteredTargets);
    //check if we have a filter expression for related elements
    const filter = this.data.sourceSchema.jsonSchema.relationships[this.data.relatedDocumentFieldName]["filter"];
    if(filter){
      //we need to pass the source and target object in a combined object
      // i.e. { "this" : sourceDocument,  relatedDocumentFieldName : unfilteredTarget}
      let relatedDocumentFieldName = this.data.relatedDocumentFieldName;
      let filteredTargets = unFilteredTargets.filter((unFilteredTarget: any) => {
        const variables:any = { "this" : this.data.sourceDocument};
        variables[relatedDocumentFieldName] = unFilteredTarget.doc
        return Parser.evaluate(filter, variables);
        });
      return filteredTargets;
    }
    return unFilteredTargets;
  }

}