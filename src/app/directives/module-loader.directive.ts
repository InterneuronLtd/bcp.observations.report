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
import { Directive, ElementRef, Input, OnChanges, SimpleChanges, OnInit, EventEmitter, Output } from '@angular/core';
import { SubjectsService } from '../services/subjects.service';

@Directive({
  selector: '[appAssessmentLoaderComponent]',
})
export class ModuleLoaderDirective {

  @Output() sepsisModuleUnLoad?: EventEmitter<any> = new EventEmitter<any>();

  constructor(private elRef: ElementRef, private subjects: SubjectsService) {
  }

  @Input('appAssessmentLoaderComponent')
  set moduleDataSubject(moduleData: ComponentModuleData) {

    //console.log('Received Module Data');
    //console.log(moduleData);


    if (moduleData) {
      this.elRef.nativeElement.innerHtml = '';
      this.loadComponent(moduleData);
    }
  }


  private loadComponent(moduleData: ComponentModuleData) {

    //console.log(this.elRef);

    const scriptEle: HTMLScriptElement = document.getElementById(`assessment:WCScript_${moduleData.elementTag}`) as HTMLScriptElement;

    if (!scriptEle) {

      //console.log('Creating Script element');

      this.createScriptElement(moduleData,
        (e) => this.createCustomElement(moduleData)
      );
    } else {
      //console.log('Script element alredy exists. Creating element.');
      this.createCustomElement(moduleData);
    }
  }

  private createScriptElement = (moduleData: ComponentModuleData, onloadComplete: any) => {

    //console.log('Script loading...' + moduleData.url);

    const scriptEle = document.createElement('script');

    scriptEle.id = `assessment:WCScript_${moduleData.elementTag}`;

    scriptEle.src = moduleData.url + "?V" + Math.random();

    scriptEle.async = true;

    scriptEle.onload = (e) => {

      //console.log('Script load complete');
      this.subjects.showMessage.next({ result: "complete", message: " ", timeout: 10 });

      if (onloadComplete) {
        onloadComplete(e);
      }
    };
    scriptEle.onerror = (e) => {
      this.subjects.showMessage.next({ result: "failed", message: "<h5>Error loading Sepsis Assessment </h5>", timeout: 15000 });
      scriptEle.parentNode.removeChild(scriptEle);

      //console.log(e);
    };
    document.body.appendChild(scriptEle);
  }

  private createCustomElement(moduleData: ComponentModuleData) {

    //console.log('inside createCustomElement');

    const customEle: HTMLElement = document.createElement(moduleData.elementTag);

    customEle['assessmentContext'] = moduleData.assessmentModuleContext;

    let el = this.elRef; //Local reference - closure wont work

    customEle['unload'] = (data: any) => {
      if (data && data.name === 'sepsis') {
        this.sepisComponentUnloadHandler(data, el);
      }
    }

    this.elRef.nativeElement.appendChild(customEle);


    //console.log('this.contextChangedEventInvoker=' + customEle);
    //console.log(customEle);

    //console.log(customEle['currentPatientId']);
  }

  private sepisComponentUnloadHandler(data: any, el: ElementRef<any>) {
    this.elRef.nativeElement.innerHtml = '';
    //console.log('Unloaded Sepsis Component');
    //console.log(data);
    if (this.sepsisModuleUnLoad) this.sepsisModuleUnLoad.emit();
  }

}

export class ComponentModuleData {
  url: string;
  elementTag: string;
  assessmentModuleContext: IAssessmentContext;//{ assessment?: Assessment, apiServiceFromFW: any, action: 'new' | 'edit' | 'view' | 'amend' | 'viewhistory' | 'showtasks' };
}

// This should go as a package
export class IAssessmentContext {
  assessment?: {
    assessment_id?: string,
    assessmenttype_id?: string,
    encounter_id?: string,
    formtype_id?: string,
    observationevent_id?: string,
    person_id?: string,
    versionid?: number,
    sourceofinvocation?: string,
  };
  apiServiceFromFW: any;
  action: 'new' | 'edit' | 'view' | 'amend' | 'viewhistory' | 'showtasks';
}
