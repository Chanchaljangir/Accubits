import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CookieService } from "../../common/service/cookie.service";
import { Router } from "@angular/router";

import { ToasterService, ToasterConfig } from "angular2-toaster";
import { AuthServiceService } from '../services/auth-service.service';
@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {
  public config: ToasterConfig = new ToasterConfig({ limit: 1 });
  loginForm: FormGroup;
  emailRequiredError: boolean = false;
  passwordRequiredError: boolean = false;
  loading: boolean = false;
  private loggedIn: boolean;
  constructor(private fb: FormBuilder,
    private ts: ToasterService,
    private router: Router,
    private authService: AuthServiceService,
    private cookieService: CookieService,
  ) {
    this.initLoginForm();
  }


  ngOnInit() {
    // window.console.log = function () { };
    if (this.cookieService.getItem('token') != null && this.cookieService.getItem('id') != null) {
      this.router.navigate(["/home/index"]);
    }

  }



  initLoginForm() {
    this.loginForm = this.fb.group({
      email: ["", Validators.required],
      password: ["", Validators.required],

    });
    this.loginForm.get('email').valueChanges.subscribe(event => {
      this.loginForm.get('email').setValue(event.toLowerCase(), { emitEvent: false });
    });
  }


  login() {

    if (this.loginForm.valid) {
      this.loading = true
      this.authService.login(this.loginForm.value).subscribe(res => {
        this.loading = false;
        if (res.IsSuccess) {
          this.loading = false;
          // if (this.cookieService.hasItem('id')) this.cookieService.removeItem('id', null, null);
          if (this.cookieService.hasItem('token')) this.cookieService.removeItem('token', null, null);
          if (this.cookieService.hasItem('email')) this.cookieService.removeItem('email', null, null);

          // this.cookieService.setItem('id', res.user.email, 24 * 3600, "/", null, null)
          this.cookieService.setItem('token', res.token, 24 * 3600, "/", null, null)
          this.cookieService.setItem('email', res.user.email, 24 * 3600, "/", null, null)

          console.log("login succesfully ")
          this.router.navigate(["/home/index"]);
          this.ts.pop("success", "", "Logged in Successfully");
          // this.initLoginForm();
        } else {
          this.loading = false;
          console.log("error invalid ")
          this.ts.pop("error", "", "Invalid email/password");

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

    }
  }

}
