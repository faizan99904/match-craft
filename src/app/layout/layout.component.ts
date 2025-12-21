import { Component } from '@angular/core';
import { HeaderComponent } from "../shared/header/header.component";
import { RouterOutlet } from '@angular/router';
import { HeaderNavComponent } from "../shared/header-nav/header-nav.component";
@Component({
  selector: 'app-layout',
  imports: [HeaderComponent, RouterOutlet, HeaderNavComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}
