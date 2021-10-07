import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DatabaseService } from '../database.service';
import { switchMap } from 'rxjs/operators';
import { partitionArray } from '@angular/compiler/src/util';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  documents: any[] = [];
  schema: any;

  constructor(
    private route: ActivatedRoute,
    private database: DatabaseService,
    private router: Router,
    private location: Location) { }

    ngOnInit(): void {
      this.route.paramMap.subscribe((params : ParamMap)=> {
        this.getDocsOfSchema(params.get('id')!)
      })     
    }
    
    getDocsOfSchema(id : string): void {
      this.database.getDocument(id).then(doc => {this.schema = doc});
      const aDocumentArray: any[] = [];
      this.database.allDocsOfSchema(id).then(docs => {
          docs.rows.map(doc => {
            aDocumentArray.push(doc.doc);
          });
          this.documents = [...aDocumentArray];
        }).catch(error => {
          console.log(error);
    })
  }

  getTitle(document: any): String {
    const title = (this.schema.uiSchema && this.schema.uiSchema['_label'] && document[this.schema.uiSchema['_label']['property']]) ? document[this.schema.uiSchema['_label']['property']] : document['_id'];
    return title;
  }

  addDocument(){
    //getRouter().push("/form/schema/" + this.schemaId + "/mode/NEW");
    this.router.navigate(["form/", {schemaId: this.schema._id, mode: 'NEW'}]);
  }

  editSchema(): void {
    //getRouter().push("/form/schema/" + this.schema['schemaDocId'] + "/document/" + this.schemaId + "/mode/EDIT");
    this.router.navigate(["form/" + this.schema._id, {schemaId: this.schema['schemaDocId'], mode: 'EDIT'}]);
  }

}
