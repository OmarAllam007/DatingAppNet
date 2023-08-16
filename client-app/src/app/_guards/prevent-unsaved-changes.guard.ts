import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanDeactivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {MemberEditComponent} from "../members/member-edit/member-edit.component";
import {ConfirmService} from "../_services/confirm.service";

@Injectable({
  providedIn: 'root'
})
export class PreventUnsavedChangesGuard implements CanDeactivate<MemberEditComponent> {
  confirmService = inject(ConfirmService);
  canDeactivate(component: MemberEditComponent) {

    if (component.editForm?.dirty) {
      return this.confirmService.confirm();
    }
    return true;
  }

}
