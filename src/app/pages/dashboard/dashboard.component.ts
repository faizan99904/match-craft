import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { HeaderNavComponent } from "../../shared/header-nav/header-nav.component";

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, HeaderNavComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
