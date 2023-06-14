import {Component, OnDestroy, OnInit} from '@angular/core';
import {BsDropdownConfig} from 'ngx-bootstrap/dropdown';
import {AuthService} from "../_services/AuthService";
import {User} from "../_models/user";
import {Observable, of} from "rxjs";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  providers: [{provide: BsDropdownConfig, useValue: {isAnimated: true, autoClose: true}}]

})
export class NavComponent implements OnInit, OnDestroy {
  model = {
    userName: '',
    password: ''
  };

  // currentUser$:Observable<User | null> = of(null);

  constructor(public authService: AuthService, private router: Router,
              private toastr: ToastrService
  ) {

  }

  login() {
    console.log(this.model)
    this.authService.login(this.model).subscribe({
      next: _ => this.router.navigateByUrl('/members'),
      error: error => this.toastr.error(error.error),
    });
  }


  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }

  ngOnInit(): void {
    // this.currentUser$ = this.authService.currentUser$;
  }

  ngOnDestroy(): void {
    this.authService.currentUser$ = of(null);
  }


}
