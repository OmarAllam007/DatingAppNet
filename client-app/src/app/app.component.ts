import {Component, OnInit} from '@angular/core';
import {User} from "./_models/user";
import {AuthService} from "./_services/AuthService";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'Date App';

  constructor(private authService: AuthService) {
  }

  setCurrentUser() {
    const userString = localStorage.getItem('user');

    if (!userString) return;

    const user: User = JSON.parse(userString);
    this.authService.setCurrentUser(user);

  }

  ngOnInit(): void {
    this.setCurrentUser();
  }
}
