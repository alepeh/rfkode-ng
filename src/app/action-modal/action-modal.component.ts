import { Component, Inject, OnInit, ViewChildren } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { expandToLevel2 } from '../helpers/relationship-resolver';

@Component({
  selector: 'app-action-modal',
  templateUrl: './action-modal.component.html',
  styleUrls: ['./action-modal.component.css']
})
export class ActionModalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ActionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      resolvedData: any,
      actions: any,
      db : any,
      }) { }

  async ngOnInit() {
    this.data.resolvedData = {... await expandToLevel2(this.data.resolvedData, this.data.db)};
    this.data.actions = Object.values(this.data.actions);
    console.dir(this.data.resolvedData);
    console.dir(this.data.actions)
  }

}
