import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuComponent } from "../../shared/components/menu.component/menu.component";

@Component({
    selector: 'app-habitus.component',
    imports: [MenuComponent, RouterModule],
    templateUrl: './habitus.component.html',
    styleUrl: './habitus.component.css',
})
export class HabitusComponent {

}
