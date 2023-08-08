import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {map, Observable} from 'rxjs';
import {AuthService} from "../_services/AuthService";
import {ToastrService} from "ngx-toastr";

@Injectable({
  providedIn: 'root'
})

export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private toasterService: ToastrService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {

    return this.authService.currentUser$.pipe(
      map(user => {
          if(!user) return false;

          if(user.roles.includes('Admin') || user.roles.includes('Moderator')){
            return true;
          }else{
            this.toasterService.error("You are not authorized!")
            return false;
          }
      })
    );
  }

}
