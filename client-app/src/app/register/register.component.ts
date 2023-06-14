import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AuthService} from "../_services/AuthService";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  model: any = {}

  constructor(private authService: AuthService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
  }

  register() {
    return this.authService.register(this.model).subscribe({
      next: _ => this.cancel(),
      error: err => {
        this.toastr.error(err.error.title)
      },
    })
  }


  cancel() {
    this.cancelRegister.emit(false);
  }


}
