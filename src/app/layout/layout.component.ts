import { Component } from '@angular/core';
import { HeaderComponent } from "../shared/header/header.component";
import { SidenavComponent } from "../shared/sidenav/sidenav.component";
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-layout',
  imports: [HeaderComponent, SidenavComponent, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}
