import {Component, OnDestroy, OnInit} from '@angular/core';
import {BsDropdownConfig} from 'ngx-bootstrap/dropdown';
import {AuthService} from "../_services/AuthService";
import {User} from "../_models/user";
import {Observable, of, take} from "rxjs";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {MembersService} from "../_services/members.service";
import {UserParams} from "../_models/userParams";

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
              private toastr: ToastrService,
              private memberService: MembersService
  ) {

  }

  login() {
    this.authService.login(this.model).subscribe({
      next: _ => {
        this.authService.currentUser$.pipe(take(1)).subscribe({
          next: user => {
            if (user) {
              let userParams = new UserParams(user)
              this.memberService.setUserParams(userParams)
            }
          }
        })

        this.router.navigateByUrl('/members');
        this.model = {userName: '', password: ''};

      },
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
