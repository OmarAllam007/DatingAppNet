import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  title:string = "";
  users:any;

  constructor(private http:HttpClient) {
   this.title = "Dating App" 

  }
  ngOnInit(): void {
    this.http.get('https://localhost:5001/api/users').subscribe(data=>{
      this.users = data;
      console.log(this.users);
      
    })
  }
}

