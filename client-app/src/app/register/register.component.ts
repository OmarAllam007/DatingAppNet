import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AuthService} from "../_services/AuthService";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{
  @Output() cancelRegister = new EventEmitter();
  model: any = {}
  constructor(private authService:AuthService) {
  }

  ngOnInit(): void {
  }

  register(){
    return this.authService.register(this.model).subscribe({
      next:response=>{
        this.cancel();
      },
      error:err=>{
        console.log(err);
      }
    })
  }


  cancel(){
    this.cancelRegister.emit(false);
  }


}
