import {Component, OnDestroy, OnInit} from '@angular/core';
import {BsDropdownConfig} from 'ngx-bootstrap/dropdown';
import {AuthService} from "../_services/AuthService";
import {User} from "../_models/user";
import {Observable, of} from "rxjs";

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  providers: [{provide: BsDropdownConfig, useValue: {isAnimated: true, autoClose: true}}]

})
export class NavComponent implements OnInit, OnDestroy{
  model = {
    userName: '',
    password: ''
  };

  // currentUser$:Observable<User | null> = of(null);

  constructor(public authService: AuthService) {

  }

  login() {
    console.log(this.model)
    this.authService.login(this.model).subscribe({
      next: response => {

      },
      error: error => {
        console.log(error);
      }
    });
  }


  logout() {
    this.authService.logout();
  }

  ngOnInit(): void {
    // this.currentUser$ = this.authService.currentUser$;
  }

  ngOnDestroy(): void {
    this.authService.currentUser$ = of(null);
  }



}
