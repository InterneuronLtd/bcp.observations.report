//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2025  Interneuron Limited

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

//See the
//GNU General Public License for more details.

//You should have received a copy of the GNU General Public License
//along with this program.If not, see<http://www.gnu.org/licenses/>.
//END LICENSE BLOCK 
/* Interneuron Observation App
Copyright(C) 2023  Interneuron Holdings Ltd
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.If not, see<http://www.gnu.org/licenses/>. */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ObservationChartComponent } from './observation-chart/observation-chart.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { DatePipe } from '@angular/common';

import { InputKeyPressDirective } from './input-key-press.directive';
import { NumberOnlyDirective } from './number-only.directive';
import { NonNegativeNumbersDirective } from './non-negative-numbers.directive';
import { ModuleLoaderDirective } from './directives/module-loader.directive';


@NgModule({ declarations: [
        AppComponent,
        ObservationChartComponent,
        InputKeyPressDirective,
        NumberOnlyDirective,
        NonNegativeNumbersDirective,
        ModuleLoaderDirective
    ],
    bootstrap: [AppComponent],
     imports: [BrowserModule,
        ReactiveFormsModule
       
       ], 
       providers: [DatePipe, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule {
  constructor(private injector: Injector) {
  }

  ngDoBootstrap() {
    const el = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('app-element', el);  // "customelement-selector" is the dom selector that will be used in parent app to render this component
  }
}
