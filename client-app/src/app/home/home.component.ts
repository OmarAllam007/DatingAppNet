import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  registerMode = false;
  ngOnInit(): void {
  }

  constructor() {
  }

  registerToggle(){
    this.registerMode = !this.registerMode;
  }


}
