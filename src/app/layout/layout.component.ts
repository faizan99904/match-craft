import { Component } from '@angular/core';
import { HeaderComponent } from "../shared/header/header.component";
import { RouterOutlet } from '@angular/router';
import { ResetPasswordComponent } from "../shared/modals/reset-password/reset-password.component";
@Component({
  selector: 'app-layout',
  imports: [HeaderComponent, RouterOutlet, ResetPasswordComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}
