import {Component} from '@angular/core';
import {BsModalRef} from "ngx-bootstrap/modal";

@Component({
  selector: 'app-roles-modal',
  templateUrl: './roles-modal.component.html',
  styleUrls: ['./roles-modal.component.css']
})
export class RolesModalComponent {
  userId?: number
  username?: string
  availableRoles: any[] = [];
  selectedRoles: any[] = [];
  closeBtnName = ''

  constructor(public bsModalRef: BsModalRef) {
  }

  updateCheckedRoles(checkedValue: string) {
    const index = this.selectedRoles.indexOf(checkedValue);
    index !== -1 ? this.selectedRoles.splice(index, 1) : this.selectedRoles.push(checkedValue);
  }
}