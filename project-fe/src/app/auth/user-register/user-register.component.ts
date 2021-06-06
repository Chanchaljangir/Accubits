import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CookieService } from "../../common/service/cookie.service";
import { Router } from "@angular/router";

import { ToasterService, ToasterConfig } from "angular2-toaster";
import { AuthServiceService } from '../services/auth-service.service';
@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent implements OnInit {
  public config: ToasterConfig = new ToasterConfig({ limit: 1 });
  registerForm: FormGroup;
  emailRequiredError: boolean = false;
  passwordRequiredError: boolean = false;
  loading: boolean = false;
  nameRequiredError: boolean = false;
  constructor(private fb: FormBuilder,
    private ts: ToasterService,
    private router: Router,
    private authService: AuthServiceService,
    private cookieService: CookieService,
  ) {

  }


  ngOnInit() {
    // window.console.log = function () { };
    this.initregisterForm();
  }



  initregisterForm() {
    this.registerForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", Validators.required],
      password: ["", Validators.required],

    });
    this.registerForm.get('email').valueChanges.subscribe(event => {
      this.registerForm.get('email').setValue(event.toLowerCase(), { emitEvent: false });
    });
  }


  signUp() {

    if (this.registerForm.valid) {
      this.loading = true
      this.authService.registerUser(this.registerForm.value).subscribe(res => {
        this.loading = false;
        if (res.IsSuccess) {
          this.loading = false;

          this.router.navigate(["/auth/login"]);
          this.ts.pop("success", "", "Registretion successful");
          // this.initregisterForm();
        } else {
          this.loading = false;
          console.log("error invalid ")
          this.ts.pop("error", "", "Registretion faild! try again");

        }
      },
        error => {
          this.loading = false;
          console.log(error);
          // this.ts.pop("error", "", "Invalid email/password");
        })
    } else {
      this.emailRequiredError = true;
      this.passwordRequiredError = true;
      this.nameRequiredError = true;
    }
  }

}

