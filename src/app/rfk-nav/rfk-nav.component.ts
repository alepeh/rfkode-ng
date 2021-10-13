import { Component } from '@angular/core';
import { Location } from '@angular/common'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { store } from '../store';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-rfk-nav',
  templateUrl: './rfk-nav.component.html',
  styleUrls: ['./rfk-nav.component.css']
})
export class RfkNavComponent {

  schemas: any[] = [];
  syncState: any = {loading: false};
  newSchemaName = '';


  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, 
    private database : DatabaseService,
    private location: Location) {
    store.subscribe((state) => {
      const {syncState} = state;
      if(syncState.loading != this.syncState.loading){
        this.syncState.loading = syncState.loading;
        this.loadAllSchemas();
      }
    })
    this.loadAllSchemas();
  }

  loadAllSchemas(){
    this.database.allSchemas().then(schemaDocs => {
      schemaDocs.rows.map(schemaDoc => {
        this.schemas.push(schemaDoc.doc as any);
      })
    })
  }

  newSchema(): void {
    console.log("Schema Name: " + this.newSchemaName);
    let schemaDocument = {
      _id: "schema:" + this.newSchemaName + ":v1",
      schemaDocId: "schema:schema:v1",
      name: this.newSchemaName,
      jsonSchema: {},
      uiSchema: {},
      actions: {}
    };
    this.database.put(schemaDocument).then(_ => {
      this.schemas.push(schemaDocument);
      this.newSchemaName = "";
    })
  }

  back(): void {
    this.location.back();
  }

}
