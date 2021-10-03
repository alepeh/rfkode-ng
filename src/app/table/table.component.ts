import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  documents: any[] = []; 

  constructor(
    private route: ActivatedRoute,
    private database: DatabaseService,
    private location: Location) { }

    ngOnInit(): void {
      this.getDocsOfSchema();
    }
    
    getDocsOfSchema(): void {
      const id = String(this.route.snapshot.paramMap.get('id'));
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

}
