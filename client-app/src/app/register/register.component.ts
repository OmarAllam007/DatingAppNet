import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuthService} from "../_services/AuthService";
import {ToastrService} from "ngx-toastr";
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  @Input() maxDate:Date = new Date();
  registerForm: FormGroup = new FormGroup({});
  validationErrors:string[] | undefined;

  constructor(private authService: AuthService,
              private toastr: ToastrService,
              private fb : FormBuilder,
              private router:Router) {
  }

  ngOnInit(): void {
    this.intializeForm();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  intializeForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required,
        Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['',
        [Validators.required, Validators.minLength(4),
          Validators.maxLength(8), this.matchValues('password')]],
    })

    this.registerForm.controls['password'].valueChanges.subscribe(
      {
        next: () => {
          this.registerForm.controls['confirmPassword'].updateValueAndValidity();
        }
      }
    )
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : {notMatching: true};
    }
  }

  register() {
    let date = this.getDateOnly(this.registerForm.controls['dateOfBirth'].value);
    let values = {...this.registerForm.value,dateOfBirth:date};

    return this.authService.register(values).subscribe({
      next: _ => this.router.navigateByUrl('/members'),
      error: err => {
        this.validationErrors = err
      },
    })
  }


  cancel() {
    this.cancelRegister.emit(false);
  }


  getDateOnly(dateString:string | undefined){
    if(!dateString) return;

    let dob = new Date(dateString);
    return new Date(dob.setMinutes(dob.getMinutes() - dob.getTimezoneOffset())).toISOString().slice(0,10);
  }

}
